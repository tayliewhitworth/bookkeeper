import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/dist/api";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    name: `${user.firstName} ${user.lastName}`,
  };
};

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

    return books.map((book) => ({
      book,
      user: users.find((user) => user.id === book.userId),
    }));
  }),
});
