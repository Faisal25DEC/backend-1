const express = require("express");
const CommentModel = require("../models/Comment.model");
const { authenticate } = require("../middleware/Authentication");

const commentRouter = express.Router();

commentRouter.get("/", async (req, res) => {
  try {
    const { blogId } = req.body;
    const comment = await CommentModel.find({ blogId });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal server error" });
  }
});

commentRouter.post("/", authenticate, async (req, res) => {
  try {
    const { comment, blogId } = req.body;
    await CommentModel.create({ comment, blogId, userId: req.userId });
    res.send({ msg: "comment posted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "internal server error" });
  }
});

module.exports = commentRouter;
