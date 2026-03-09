import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
  // Version check endpoint for in-app updates
  checkVersion: publicProcedure.query(async () => {
    // Current version - update this when releasing new versions
    const currentVersion = "1.0.9";
    // APK download URL - update this with your actual APK hosting URL
    const downloadUrl = "https://nonspontaneously-subcompensational-devyn.ngrok-free.dev/api/download/apk";
    
    return {
      version: currentVersion,
      downloadUrl: downloadUrl,
      updateAvailable: false, // Set to true when you want to force an update
      message: "Latest version installed",
    };
  }),
});
