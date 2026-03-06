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
        const { storagePut } = await import("./storage");
        
        try {
          const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          
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

    // Bailian wanx-v1-0521 generation
    generateBailian: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          style: z.string().default("professional"),
        })
      )
      .mutation(async ({ input }) => {
        const { generateHeadshotWithBailian } = await import("./bailian-service");
        
        try {
          console.log("[Router] Starting Bailian generation...");
          
          const result = await generateHeadshotWithBailian({
            imageUrl: input.imageUrl,
            style: input.style,
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

    generateTwoStep: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          background: z.enum(["white", "black", "neutral", "gray", "office"]).optional(),
          gender: z.enum(["none", "male", "female"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateHeadshotTwoStep } = await import("./headshot-two-step-service");
        
        try {
          const result = await generateHeadshotTwoStep({
            userImageUrl: input.imageUrl,
            background: input.background,
            gender: input.gender,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot with two-step method");
          }

          return {
            success: true,
            imageUrl: result.finalImageUrl!,
            backgroundImageUrl: result.backgroundImageUrl,
          };
        } catch (error) {
          console.error("Two-step headshot generation failed:", error);
          throw new Error("Failed to generate headshot with two-step method");
        }
      }),

    generateIdeogram: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          prompt: z.string(),
          background: z.enum(["white", "black", "neutral", "gray", "office"]).optional(),
          gender: z.enum(["none", "male", "female"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateHeadshotWithBailian } = await import("./bailian-service");
        
        try {
          const lightingVariations = [
            "soft diffused lighting",
            "natural window light",
            "professional studio lighting",
            "dramatic side lighting",
            "balanced key light",
          ];
          
          const angleVariations = [
            "straight-on angle",
            "slight 3/4 angle",
            "head tilted slightly",
            "shoulders angled",
            "centered composition",
          ];
          
          const detailVariations = [
            "crisp details",
            "subtle texture",
            "smooth skin tone",
            "natural skin texture",
            "professional retouching",
          ];
          
          const randomLighting = lightingVariations[Math.floor(Math.random() * lightingVariations.length)];
          const randomAngle = angleVariations[Math.floor(Math.random() * angleVariations.length)];
          const randomDetail = detailVariations[Math.floor(Math.random() * detailVariations.length)];
          
          const prompt = `${input.prompt} Additional details: ${randomLighting}, ${randomAngle}, ${randomDetail}.`;
          
          const result = await generateHeadshotWithBailian({
            imageUrl: input.imageUrl,
            style: "professional",
            prompt: prompt,
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot with Bailian API");
          }

          console.log("Generation successful");

          return {
            success: true,
            imageUrl: result.imageUrl,
            originalUrl: result.imageUrl,
          };
        } catch (error) {
          console.error("Ideogram-character generation failed:", error);
          throw new Error("Failed to generate headshot with ideogram-character");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
