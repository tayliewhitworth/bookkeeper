import { createTRPCRouter } from "~/server/api/trpc";
import { booksRouter } from "./routers/books";
import { wishlistRouter } from "./routers/wishlist";
import { profileRouter } from "./routers/profile";
import { recsRouter } from "./routers/recommendations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  books: booksRouter,
  wishlistItem: wishlistRouter,
  profile: profileRouter,
  recs: recsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
