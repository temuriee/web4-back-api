const express = require("express");
const mongoose = require("mongoose");
const Book = require("../models/Book.js");
const User = require("../models/User.js");

const bookRouter = express.Router();

bookRouter.get("/", async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Create book
bookRouter.post("/", async (req, res) => {
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
bookRouter.delete("/:bookId", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    res.status(200).json({ message: "Book deleted successfully", data: book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Get single Book
bookRouter.get("/:bookId", async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Update book
bookRouter.put("/:bookId", async (req, res) => {
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

// ! Borrow A Book
bookRouter.post("/:bookId/borrow/:userId", async (res, req) => {
  try {
    const { bookId, userId } = req.params;

    if (
      !mongoose.isValidObjectId(bookId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ error: "Invalid bookId or userId" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ error: "User Not Found" });
    }

    const borrowCount = await Book.countDocuments({ borrowedBy: userId });

    if (borrowCount > 2) {
      return res
        .status(400)
        .json({ error: "User Cant Borrow More Than 2 Books" });
    }

    const updated = await Book.findOneAndUpdate(
      {
        _id: bookId,
        isAvailable: true,
        borrowedBy: null,
      },
      { $set: { isAvailable: false }, borrowedBy: userId },
      { new: true },
    );

    if (!updated) {
      return res.status(409).json({ error: "Someone Took It" });
    }

    await updated.populate("borrowedBy", "name email");

    res.status(200).json({
      message: `Book Borrowed By ${updated.borrowedBy.name}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ! Return A Book

bookRouter.post("/:bookId/return", async (res, req) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ error: "Invalid bookId or userId" });
    }

    const updated = await Book.findOneAndUpdate(
      {
        _id: bookId,
        isAvailable: false,
      },
      { $set: { isAvailable: true }, borrowedBy: null },
      { new: true },
    );

    if (!updated) {
      return res.status(409).json({ error: "Book Isnt Currently Borrowed" });
    }

    res.status(200).json({
      message: "Book Returned",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = bookRouter;
