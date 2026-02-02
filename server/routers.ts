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
    uploadPhoto: publicProcedure
      .input(
        z.object({
          photoBase64: z.string(),
          fileName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        
        try {
          // Convert base64 to buffer
          const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          
          // Upload to S3
          const timestamp = Date.now();
          const key = `headshots/uploads/${timestamp}-${input.fileName}`;
          const result = await storagePut(key, buffer, "image/jpeg");
          
          return {
            success: true,
            url: result.url,
          };
        } catch (error) {
          console.error("Photo upload failed:", error);
          throw new Error("Failed to upload photo");
        }
      }),
    generate: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          background: z.enum(["white", "black", "neutral", "gray", "office"]).optional(),
          gender: z.enum(["none", "male", "female"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateProfessionalHeadshot } = await import("./replicate-service");
        
        try {
          const result = await generateProfessionalHeadshot({
            imageUrl: input.imageUrl,
            background: input.background,
            gender: input.gender,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot");
          }

          return {
            success: true,
            imageUrl: result.imageUrl!,
          };
        } catch (error) {
          console.error("Headshot generation failed:", error);
          throw new Error("Failed to generate headshot");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
