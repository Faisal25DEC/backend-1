const express = require("express");

const { authenticate } = require("../middleware/Authentication");
const { ReadingListModel } = require("../models/ReadingList.model");
const { BlogModel } = require("../models/Blog.model");

const readingListRouter = express.Router();

readingListRouter.get("/", authenticate, async (req, res) => {
  try {
    const readingList = await ReadingListModel.find({ userId: req.userId });
    if (readingList.length > 0) {
      const blogs = readingList.map(async (read) => {
        const blog = await ReadingListModel.findOne({ _id: read.blogId });
        return blog ? blog : {};
      });
      res.send(blogs);
    } else {
      res.send([]);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

readingListRouter.use(authenticate);

readingListRouter.post("/create", async (req, res) => {
  const { userId, blogId } = req.body;

  await ReadingListModel.create({
    userId,
    blogId,
  });
  res.send("blog created");
});

readingListRouter.delete("/:blogID", async (req, res) => {
  const blogId = req.params.blogID;
  const author_id = req.userId;
  const blog = await ReadingListModel.findOne({ _id: blogId });
  if (blog?.author_id !== author_id) {
    res.send("you are not authorized");
  } else {
    try {
      await ReadingListModel.findByIdAndDelete(blogId);
      res.send("blog updated");
    } catch (err) {
      res.status(400).send("bad request");
    }
  }
});
module.exports = { readingListRouter };
