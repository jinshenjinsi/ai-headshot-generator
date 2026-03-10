import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
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

  headshot: router({
    uploadPhoto: publicProcedure
      .input(
        z.object({
          photoBase64: z.string(),
          fileName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { savePhoto } = await import("./db");
        const { randomUUID } = await import("crypto");
        
        try {
          console.log("[Upload] Starting photo upload to database...");
          console.log("[Upload] File name:", input.fileName);
          console.log("[Upload] Base64 length:", input.photoBase64.length);
          
          const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          console.log("[Upload] Cleaned base64 length:", base64Data.length);
          
          const fileSize = Buffer.from(base64Data, "base64").length;
          console.log("[Upload] File size:", fileSize, "bytes");
          
          // Generate a unique photo ID
          const photoId = randomUUID();
          
          // Save to database
          const photo = await savePhoto({
            fileName: input.fileName,
            imageBase64: base64Data,
            mimeType: "image/jpeg",
            fileSize: fileSize,
            photoId: photoId,
          });
          
          // Generate a URL to retrieve the photo
          const photoUrl = `/api/photos/${photoId}`;
          console.log("[Upload] ✅ Upload successful");
          console.log("[Upload] Photo ID:", photoId);
          
          return {
            success: true,
            url: photoUrl,
            photoId: photoId,
          };
        } catch (error) {
          console.error("[Upload] ❌ Photo upload failed:", error);
          console.error("[Upload] Error type:", error instanceof Error ? error.constructor.name : typeof error);
          console.error("[Upload] Error message:", error instanceof Error ? error.message : String(error));
          throw new Error("Failed to upload photo");
        }
      }),

    // Bailian wanx-v1-0521 generation
    generateBailian: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          style: z.string().default("professional"),
          regenerateCount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateHeadshotWithBailian } = await import("./bailian-service");
        
        try {
          console.log("[Router] Starting Bailian generation...");
          
          const result = await generateHeadshotWithBailian({
            imageUrl: input.imageUrl,
            style: input.style,
            regenerateCount: input.regenerateCount,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot with Bailian");
          }

          console.log("[Router] Bailian generation successful");

          return {
            success: true,
            imageUrl: result.imageUrl,
            originalUrl: result.imageUrl,
          };
        } catch (error) {
          console.error("[Router] Bailian generation failed:", error);
          throw new Error("Failed to generate headshot with Bailian");
        }
      }),

    generate: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          style: z.string().default("professional"),
          regenerateCount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateHeadshotWithBailian } = await import("./bailian-service");
        
        try {
          console.log("[Router] Starting generation...");
          
          const result = await generateHeadshotWithBailian({
            imageUrl: input.imageUrl,
            style: input.style,
            regenerateCount: input.regenerateCount,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot");
          }

          console.log("[Router] Generation successful");

          return {
            success: true,
            imageUrl: result.imageUrl,
            originalUrl: result.imageUrl,
          };
        } catch (error) {
          console.error("[Router] Generation failed:", error);
          throw new Error("Failed to generate headshot");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
