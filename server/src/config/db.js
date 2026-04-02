import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,                 // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test Connection
pool.on("connect", () => {
  console.log("PostgreSQL database connected successfully");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
  process.exit(1);
});

// Query Helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log("Query executed:", {
        text,
        duration: `${duration}ms`,
        rows: res.rowCount,
      });
    }

    return res;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
};

// Transaction Helper
// Use this when multiple queries must succeed together
const getClient = () => pool.connect();

export { query, getClient, pool };