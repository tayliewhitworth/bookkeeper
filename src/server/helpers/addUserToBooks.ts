import { filterUserForClient } from "./filterUserForClient";
import type { Book } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

export const addUserToBooks = async (books: Book[]) => {
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