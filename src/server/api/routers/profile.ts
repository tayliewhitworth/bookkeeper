import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { addUserToProfile } from "~/server/helpers/addUserToProfile";
import { addUserToBooks } from "~/server/helpers/addUserToBooks";
// import type { Book } from "@prisma/client";
import type { BookData } from "~/server/helpers/bookType";

// type UserBook = {
//   book: Book;
//   user: {
//       username: string;
//       id: string;
//       profileImageUrl: string;
//       name: string;
//       externalUsername: string | null;
//   };
// }

type UserBooks = BookData[];

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
      orderBy: "-created_at",
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

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        bio: z
          .string()
          .max(255, { message: "Bio must be less than 255 characters" }),
        tags: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profileId = input.id;
      const userId = ctx.userId;

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      if (profile.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this profile",
        });
      }

      const updatedProfile = await ctx.prisma.profile.update({
        where: { id: profileId },
        data: { ...input },
      });
      return updatedProfile;
    }),

  getProfileWithFollowers: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const profileWithFollowers = await ctx.prisma.profile.findUnique({
        where: { id: input.id },
        include: { followers: true },
      });

      if (
        !profileWithFollowers ||
        profileWithFollowers.followers.length === 0
      ) {
        return null;
      }

      const resolvedProfile = await addUserToProfile(profileWithFollowers);

      const followersWithUsers = await Promise.all(
        profileWithFollowers.followers.map(async (relationship) => {
          const userWithProfile = await ctx.prisma.profile.findFirst({
            where: { userId: relationship.userId },
          });

          if (!userWithProfile) {
            return null;
          }

          const userData = await addUserToProfile(userWithProfile);

          return { ...relationship, followedBy: userData };
        })
      );

      return {
        profile: resolvedProfile,
        followers: profileWithFollowers.followers,
        withUsers: followersWithUsers.filter(Boolean),
      };
    }),
  getUserFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userFollowing = await ctx.prisma.followerRelationship.findMany({
        where: { userId: input.userId },
        include: { profile: true },
        // orderBy: [{ createdAt: "desc" }],
      });

      if (!userFollowing || userFollowing.length === 0) {
        return null;
      }

      const profiles = userFollowing.map((relationship) =>
        addUserToProfile(relationship.profile)
      );
      const resolvedProfiles = await Promise.all(profiles);

      let followingBooks: UserBooks = [];

      for (const profile of resolvedProfiles) {
        const userBooks = await ctx.prisma.book.findMany({
          where: { userId: profile.user.id },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserToBooks)
        followingBooks = [...followingBooks, ...userBooks]
      }

      return {
        following: userFollowing,
        profiles: resolvedProfiles,
        books: followingBooks,
      };
    }),

  toggleFollow: privateProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = { userId: ctx.userId, profileId: input.profileId };

      const existingRelationship =
        await ctx.prisma.followerRelationship.findUnique({
          where: { userId_profileId: data },
        });

      if (existingRelationship == null) {
        await ctx.prisma.followerRelationship.create({ data });
        return { isFollowing: true };
      } else {
        await ctx.prisma.followerRelationship.delete({
          where: { userId_profileId: data },
        });
        return { isFollowing: false };
      }
    }),
});
