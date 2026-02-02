import { describe, it, expect } from "vitest";
import { testReplicateConnection } from "../server/replicate-service";

describe("Replicate API", () => {
  it("should connect to Replicate API with valid token", async () => {
    const isConnected = await testReplicateConnection();
    expect(isConnected).toBe(true);
  }, 30000); // 30 second timeout for API call
});
