import type { Profile } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "./filterUserForClient";

export const addUserToProfile = async (profile: Profile) => {
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