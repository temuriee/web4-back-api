const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Book = require("./models/Book.js");

// Load environment varriables from .env file
dotenv.config();

// Express instance
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Config File for MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Routes

// ! Fetch All Books
app.get("/api/v1/books", async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Create book
app.post("/api/v1/books", async (req, res) => {
  try {
    const { title, author, genre, isAvailable, publishedYear } = req.body;

    // TITLE !== string min 1 symbol ------

    const existingBook = await Book.findOne({ title, author });

    if (existingBook) {
      return res.status(409).json({ error: "Book already exist" });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      isAvailable,
      publishedYear,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Delete Book
app.delete("/api/v1/books/:bookId", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    res.status(200).json({ message: "Book deleted successfully", data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Get single Book
app.get("/api/v1/books/:bookId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Update book
app.put("/api/v1/books/:bookId", async (req, res) => {
  try {
    const bookUpdated = await Book.findByIdAndUpdate(
      req.params.bookId,
      req.body,
      { new: true },
    );

    res.status(200).json(bookUpdated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
