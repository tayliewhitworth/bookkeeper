import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

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
});
