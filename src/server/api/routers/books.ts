import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/api";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";
// import type { Book } from "@prisma/client";

export const booksRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const books = await ctx.prisma.book.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: books.map((book) => book.userId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return books.map((book) => {
      const user = users.find((user) => user.id === book.userId);

      if (!user)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });

      return {
        book,
        user,
      };
    });
  }),

  create: privateProcedure
    .input(z.object({
      title: z.string().min(1, {message: "Must be 1 or more characters long"}).max(255, {message: "Must be less than 255 characters long"}),
      author: z.string().min(1, {message: "Must be 1 or more characters long"}).max(255, {message: "Must be less than 255 characters long"}),
      description: z.string().max(255, {message: "Must be less than 255 characters long"}),
      dateStarted: z.string().datetime({ message: "Invalid date, must be UTC" }),
      dateFinished: z.string().datetime({ message: "Invalid date, must be UTC" }),
      genre: z.string().min(1, {message: "Must be 1 or more characters long"}).max(255, {message: "Must be less than 255 characters long"}),
      imgSrc: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const book = await ctx.prisma.book.create({
        data: {
          ...input,
          userId,
        },
      });

      return book
    }),
});
