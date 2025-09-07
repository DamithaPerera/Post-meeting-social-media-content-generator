import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.js";
import authGoogle from "./routes/auth.google.js";
import authLinkedIn from "./routes/auth.linkedin.js";
import authFacebook from "./routes/auth.facebook.js";
import calendarRoutes from "./routes/calendar.js";
import meetingsRoutes from "./routes/meetings.js";
import settingsRoutes from "./routes/settings.js";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.split(","), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/auth/google", authGoogle);
app.use("/auth/linkedin", authLinkedIn);
app.use("/auth/facebook", authFacebook);
app.use("/calendar", calendarRoutes);
app.use("/meetings", meetingsRoutes);
app.use("/settings", settingsRoutes);

// Errors
app.use(errorHandler);
