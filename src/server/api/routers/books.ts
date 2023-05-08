import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Book } from "@prisma/client";

const addUserToBooks = async (books: Book[]) => {
  const userId = books.map((book) => book.userId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 100,
    })
  ).map(filterUserForClient);

  return books.map((book) => {
    const user = users.find((user) => user.id === book.userId);

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `User for book not found. POST ID: ${book.id}, USER ID: ${book.userId}`,
      });
    }
    if (!user.username) {
      if (user.externalUsername) {
        user.username = user.externalUsername;
      } else if (user.name) {
        user.username = user.name;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `User for book not found. POST ID: ${book.id}, USER ID: ${book.userId}`,
        });
      }
    }
    return {
      book,
      user: {
        ...user,
        username: user.username ?? "(username not found)",
      },
    };
  });
};

export const booksRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.prisma.book.findUnique({
        where: { id: input.id },
      });

      if (!book)
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });

      return (await addUserToBooks([book]))[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const books = await ctx.prisma.book.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserToBooks(books);
  }),

  getBooksByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.book
        .findMany({
          where: { userId: input.userId },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserToBooks)
    ),

  create: privateProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(1, { message: "Must be 1 or more characters long" })
          .max(255, { message: "Must be less than 255 characters long" }),
        author: z
          .string()
          .min(1, { message: "Must be 1 or more characters long" })
          .max(255, { message: "Must be less than 255 characters long" }),
        description: z
          .string()
          .max(255, { message: "Must be less than 255 characters long" }),
        dateStarted: z
          .string()
          .datetime({ message: "Invalid date, must be UTC" }),
        dateFinished: z
          .string()
          .datetime({ message: "Invalid date, must be UTC" }),
        genre: z
          .string()
          .min(1, { message: "Must be 1 or more characters long" })
          .max(255, { message: "Must be less than 255 characters long" }),
        imgSrc: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const book = await ctx.prisma.book.create({
        data: {
          ...input,
          userId,
        },
      });

      return book;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255),
        author: z.string().min(1).max(255),
        description: z.string().max(255),
        dateStarted: z.string().datetime(),
        dateFinished: z.string().datetime(),
        genre: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bookId = input.id;
      const userId = ctx.userId;

      const book = await ctx.prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }

      if (book.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to update this book",
        });
      }

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const updatedBook = await ctx.prisma.book.update({
        where: { id: bookId },
        data: { ...input },
      });
      return updatedBook;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bookId = input.id;
      const userId = ctx.userId;

      const book = await ctx.prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
      }

      if (book.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete this book",
        });
      }

      const deletedBook = await ctx.prisma.book.delete({
        where: { id: bookId },
      });
      return deletedBook;
    }),
});
