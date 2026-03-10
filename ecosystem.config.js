module.exports = {
  apps: [
    {
      name: "ai-headshot-generator",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // OAuth configuration
        OAUTH_SERVER_URL: "http://218.244.144.154:3000",
        // Bailian API configuration - these should be set via environment
        BAILIAN_API_KEY: process.env.BAILIAN_API_KEY || "",
        BAILIAN_AGENT_ID: process.env.BAILIAN_AGENT_ID || "",
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
