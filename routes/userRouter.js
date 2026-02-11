const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User.js");

const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  try {
    const { name, email, isStudent } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User With This Email Already Exists" });
    }

    const user = await User.create({ name, email, isStudent });
    (res.status(201), json(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.get("/:bookId", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
