import "dotenv/config";
import app from "./src/app.js";
import { pool } from "./src/config/db.js";

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    pool.end();
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});