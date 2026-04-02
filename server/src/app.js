import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";
import errorMiddleware from "./middlewares/error.middleware.js";


const app = express();

//Security Middlewares 
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
});

app.use("/api", limiter);

// Body Parsers 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// File Upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size limit (5MB) exceeded",
  })
);

// Health Check 
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


//Global Error Handler 
app.use(errorMiddleware);


export default app;