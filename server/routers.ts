import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI Headshot Generation
  headshot: router({
    generate: publicProcedure
      .input(
        z.object({
          stylePrompt: z.string(),
          referenceImageUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        
        try {
          const result = await generateImage({
            prompt: input.stylePrompt,
            originalImages: input.referenceImageUrl
              ? [
                  {
                    url: input.referenceImageUrl,
                    mimeType: "image/jpeg",
                  },
                ]
              : undefined,
          });

          return {
            success: true,
            imageUrl: result.url,
          };
        } catch (error) {
          console.error("Headshot generation failed:", error);
          throw new Error("Failed to generate headshot");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
