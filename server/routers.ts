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
    // Two-step generation with face-swap for better face preservation
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
    // Ideogram-character generation for best character consistency
    generateIdeogram: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          prompt: z.string(), // 使用完整的prompt而不是简单的background/gender
          background: z.enum(["white", "black", "neutral", "gray", "office"]).optional(),
          gender: z.enum(["none", "male", "female"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateIdeogramCharacter } = await import("./ideogram-service");
        const { addWatermarkToOriginal, uploadToS3 } = await import("./watermark-service");
        
        try {
          // 在prompt中添加随机变化词,增加重生成差异
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
          
          // 随机选择变化词
          const randomLighting = lightingVariations[Math.floor(Math.random() * lightingVariations.length)];
          const randomAngle = angleVariations[Math.floor(Math.random() * angleVariations.length)];
          const randomDetail = detailVariations[Math.floor(Math.random() * detailVariations.length)];
          
          // 在原始prompt后面添加变化词
          const prompt = `${input.prompt} Additional details: ${randomLighting}, ${randomAngle}, ${randomDetail}.`;
          
          const result = await generateIdeogramCharacter({
            characterImageUrl: input.imageUrl,
            prompt: prompt,
            renderingSpeed: "Quality", // 使用Quality模式
            styleType: "Realistic",
            aspectRatio: "1:1",
          });

          if (!result.success) {
            throw new Error(result.error || "Failed to generate headshot with ideogram-character");
          }

          // 直接在原图上添加水印(不降低分辨率)
          console.log("添加水印到原图...");
          const qrCodeUrl = "https://manus.im"; // TODO: 替换为实际的APP下载页URL
          const { watermarked, original } = await addWatermarkToOriginal(
            result.imageUrl!,
            qrCodeUrl,
            {
              qrSize: 120,      // 二维码尺寸
              opacity: 0.3,     // 透明度30%
              padding: 20,      // 边距20px
            }
          );

          // 上传带水印的图和原图
          const timestamp = Date.now();
          const watermarkedUrl = await uploadToS3(watermarked, `headshots/watermarked/${timestamp}.jpg`);
          const originalUrl = await uploadToS3(original, `headshots/original/${timestamp}.jpg`);

          console.log("带水印图URL:", watermarkedUrl);
          console.log("原图URL:", originalUrl);

          return {
            success: true,
            imageUrl: watermarkedUrl,      // 返回带水印的原分辨率图
            originalUrl: originalUrl,  // 返回高清无水印原图URL
          };
        } catch (error) {
          console.error("Ideogram-character generation failed:", error);
          throw new Error("Failed to generate headshot with ideogram-character");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
