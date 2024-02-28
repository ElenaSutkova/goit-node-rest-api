import express from "express";
import morgan from "morgan";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";

import contactsRouter from "./routes/contactsRouter.js";

const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Database connection successful")
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1)
  });

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});