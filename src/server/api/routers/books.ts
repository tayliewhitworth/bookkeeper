import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/api";

import { createTRPCRouter, publicProcedure, privateProcedure} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Book } from "@prisma/client";



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

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User not found" })

      return {
        book,
        user,
      };
    })
  }),
});
