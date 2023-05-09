import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import type { Profile } from "@prisma/client";

const addUserToProfile = async (profile: Profile) => {
  const userId = profile.userId;
  const [user] = (
    await clerkClient.users.getUserList({
      userId: [userId],
    })
  ).map(filterUserForClient);

  if (!user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `User for profile not found. PROFILE ID: ${profile.id}, USER ID: ${profile.userId}`,
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
        message: `User for profile not found. PROFILE ID: ${profile.id}, USER ID: ${profile.userId}`,
      });
    }
  }
  return {
    profile,
    user: {
      ...user,
      username: user.username ?? "(username not found)",
    },
  };
};

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        const users = await clerkClient.users.getUserList({
          limit: 200,
        });

        const nameParts = input.username.split(" ");
        const firstName = nameParts[0];
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        const matchedUser = users.find(
          (user) =>
            user.firstName?.toLowerCase() === firstName?.toLowerCase() &&
            user.lastName?.toLowerCase() === lastName?.toLowerCase()
        );

        if (matchedUser) {
          return filterUserForClient(matchedUser);
        }

        const user = users.find((user) =>
          user.externalAccounts.find(
            (account) => account.username === input.username
          )
        );
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found - profile router line 42",
          });
        }
        return filterUserForClient(user);
      }

      return filterUserForClient(user);
    }),

  getAllUsers: publicProcedure.query(async () => {
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    return users.map(filterUserForClient);
  }),

  getProfileByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findFirst({
        where: { userId: input.userId },
      });

      if (!profile) {
        return null;
      }

      return await addUserToProfile(profile);
    }),

  create: privateProcedure
    .input(
      z.object({
        bio: z
          .string()
          .max(255, { message: "Bio must be less than 255 characters" }),
        tags: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const profile = await ctx.prisma.profile.create({
        data: {
          ...input,
          userId,
        },
      });

      return profile;
    }),
  
  update: privateProcedure.input(z.object({
    id: z.string(),
    bio: z.string().max(255, { message: "Bio must be less than 255 characters" }),
    tags: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const profileId = input.id;
    const userId = ctx.userId;

    const profile = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
    })

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" })
    }

    if (profile.userId !== userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update this profile" })
    }

    const updatedProfile = await ctx.prisma.profile.update({
      where: { id: profileId },
      data: { ...input }
    })
    return updatedProfile
  }),
});
