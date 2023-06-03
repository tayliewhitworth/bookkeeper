import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: env.OPENAI_API_KEY,
  })
);

// create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export const recsRouter = createTRPCRouter({
  generateRecommendations: privateProcedure
    .input(z.object({ titles: z.optional(z.array(z.string())) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const { success } = await ratelimit.limit(userId);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are making too many requests",
        });

      if (!input.titles || input.titles.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must provide at least one title",
        });
      }

      const titles = input.titles.join(', ')

      const prompt = `Recommend three different books based on the following book titles that don't have the same title:\n${titles}\n\nHave the format of your response be Title: Book title newline Author: Book Author newline Description: Book Description`;

      let response;
      try {
        response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate recommendations",
        });
      }

      const rawRecommendations = response.data.choices[0]?.message?.content;

      if (!rawRecommendations) {
        return null;
      }

      const recs = rawRecommendations.split("\n\n").map((rec) => {
        const lines = rec.split("\n");
        const title = lines[0]?.split(": ")[1]?.trim();
        const author = lines[1]?.split(": ")[1]?.trim();
        const description = lines[2]?.split(": ")[1]?.trim();

        if (!title || !author || !description) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse recommendation",
          });
        }

        return { title, author, description };
      });

      return recs;
    }),
});
