import type { Book } from "@prisma/client";

export type BookData = {
  book: Book;
  user: {
    username: string;
    id: string;
    profileImageUrl: string;
    name: string;
    externalUsername: string | null;
  };
};