import type { User } from "@clerk/nextjs/dist/api";
export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    name: `${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'unknown'}`,
    externalUsername: user.externalAccounts.find((account) => account.username)?.username || null,
  };
}

