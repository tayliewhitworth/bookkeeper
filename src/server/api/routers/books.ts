import { z } from "zod";

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

import { addUserToBooks } from "~/server/helpers/addUserToBooks";

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

  infinteFeed: publicProcedure
    .input(
      z.object({ limit: z.number().optional(), cursor: z.object({ id: z.string(), createdAt: z.date()}).optional(), })
    )
    .query(async ({ ctx, input: { limit = 10, cursor} }) => {
      const books = await ctx.prisma.book.findMany({
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      let nextCursor: typeof cursor | undefined;
      if (books.length > limit) {
        const nextItem = books.pop()
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt }
        }
      }
      return {
        books: await addUserToBooks(books),
        nextCursor
      }
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

  getBookWithLikes: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booksWithLikes = await ctx.prisma.book.findUnique({
        where: { id: input.id },
        include: { likes: true },
      });

      if (!booksWithLikes || booksWithLikes.likes.length === 0) {
        return null;
      }

      return {
        book: booksWithLikes,
        likes: booksWithLikes.likes,
      };
    }),

  getUserWithLikes: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userLikes = await ctx.prisma.like.findMany({
        where: { userId: input.userId },
        include: { book: true },
        orderBy: [{ createdAt: "desc" }],
      });

      if (!userLikes || userLikes.length === 0) {
        return null;
      }

      const books = userLikes.map((like) => like.book);
      const booksWithUsers = await addUserToBooks(books);

      return {
        likes: userLikes,
        books: booksWithUsers,
      };
    }),

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
        rating: z.number().min(0).max(5),
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

  toggleLike: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = { userId: ctx.userId, bookId: input.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_bookId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_bookId: data } });
        return { addedLike: false };
      }
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
        rating: z.number().min(0).max(5),
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
