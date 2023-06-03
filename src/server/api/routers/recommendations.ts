import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type ChatGPTResponse, createChatCompletion } from "~/server/helpers/openAI";


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

      const prompt = `Please recommend exactly three different books based on the following book titles. Ensure that the recommended books have unique titles and do not match any of the input titles:\n${titles}\n\nPlease provide the recommendations in the following format: Title: [Book Title] newline Author: [Book Author] newline Description: [Book Description]`;

      const payload: ChatGPTResponse = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 3000,
        n: 1,
      }

      const recs = await createChatCompletion(payload)
      return recs
    }),
});
