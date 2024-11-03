// app.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const shortid = require("shortid"); // Don’t forget to import shortid if you use it
const Url = require("./models/url");

const app = express();

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define API routes for shortening URLs and redirecting

// Create short URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = shortid.generate();
  const url = new Url({ originalUrl, shortUrl });
  await url.save();
  res.json({ originalUrl, shortUrl: `${process.env.BASE_URL}/${shortUrl}` });
});

// Redirect to original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });
  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).json("URL not found");
  }
});

// Optional: Set up a specific route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
