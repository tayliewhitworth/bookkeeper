import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import type { WishlistItem } from "@prisma/client";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

const addUserToWishlistItem = async (wishlistItems: WishlistItem[]) => {
  const userId = wishlistItems.map((wishlistItem) => wishlistItem.userId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 100,
    })
  ).map(filterUserForClient);

  return wishlistItems.map((wishlistItem) => {
    const user = users.find((user) => user.id === wishlistItem.userId);

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `User for wishlistItem not found. POST ID: ${wishlistItem.id}, USER ID: ${wishlistItem.userId}`,
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
          message: `User for wishlistItem not found. POST ID: ${wishlistItem.id}, USER ID: ${wishlistItem.userId}`,
        });
      }
    }
    return {
      wishlistItem,
      user: {
        ...user,
        username: user.username ?? "(username not found)",
      },
    };
  });
};

export const wishlistRouter = createTRPCRouter({
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const wishlistItem = await ctx.prisma.wishlistItem.findUnique({
        where: { id: input.id },
      });

      if (!wishlistItem)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });

      return (await addUserToWishlistItem([wishlistItem]))[0];
    }),

  getWishlistByUserId: privateProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.wishlistItem
        .findMany({
          where: {
            userId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserToWishlistItem)
    ),

  create: privateProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        description: z.string(),
        link: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const wishlistItem = await ctx.prisma.wishlistItem.create({
        data: {
          ...input,
          userId,
        },
      });
      return wishlistItem;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        author: z.string(),
        description: z.string(),
        link: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wishlistItemId = input.id;
      const userId = ctx.userId;

      const wishlistItem = await ctx.prisma.wishlistItem.findUnique({
        where: { id: wishlistItemId },
      });

      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }
      if (wishlistItem.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this wishlist item",
        });
      }

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const updatedWishlistItem = await ctx.prisma.wishlistItem.update({
        where: { id: wishlistItemId },
        data: { ...input },
      });
      return updatedWishlistItem;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const wishlistItemId = input.id;
      const userId = ctx.userId;

      const wishlistItem = await ctx.prisma.wishlistItem.findUnique({
        where: { id: wishlistItemId },
      });

      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }
      if (wishlistItem.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this wishlist item",
        });
      }

      const deletedWishlistItem = await ctx.prisma.wishlistItem.delete({
        where: { id: wishlistItemId },
      });
      return deletedWishlistItem;
    }),
});
