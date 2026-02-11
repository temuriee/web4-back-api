const mongoose = require("mongoose");

// Book Schema

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, ["Book title is required"]] },
    author: { type: String, required: [true, ["Author title is required"]] },
    genre: String,
    publishedYear: {
      type: Number,
      required: [true, ["Published year is required"]],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compile schema
const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
