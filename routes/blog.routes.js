const express = require("express");
const { BlogModel } = require("../models/Blog.model");
const { UserModel } = require("../models/User.model");
const { getCurrentDate } = require("../utils/utils");
const { authenticate } = require("../middleware/Authentication");

const blogRouter = express.Router();

blogRouter.get("/", async (req, res) => {
  const blogs = await BlogModel.find();
  res.send(blogs);
});

blogRouter.get("/:blogId", async (req, res) => {
  const blogId = req.params.blogId;
  try {
    const blog = await BlogModel.findOne({ _id: blogId });
    res.send(blog);
  } catch (err) {
    res.status(400).send({ msg: "blog doesn't exist" });
  }
});

blogRouter.use(authenticate);

blogRouter.post("/create", async (req, res) => {
  const { title, description, category, tags, image } = req.body;
  const author_id = req.userId;
  const user = await UserModel.findOne({ _id: author_id });
  const dateCreated = getCurrentDate();
  await BlogModel.create({
    title,
    category,
    description,
    author_id,
    author: user.name,
    tags,
    image,
    dateCreated,
  });
  res.send("blog created");
});

blogRouter.patch("/:blogID", async (req, res) => {
  const blogId = req.params.blogID;
  const payload = req.body;
  const author_id = req.userId;
  const blog = await BlogModel.findOne({ _id: blogId });
  if (blog?.author_id !== author_id) {
    res.send("you are not authorized");
  } else {
    try {
      await BlogModel.findByIdAndUpdate(blogId, payload);
      res.send("blog updated");
    } catch (err) {
      res.status(400).send("bad request");
    }
  }
});
blogRouter.delete("/:blogID", async (req, res) => {
  const blogId = req.params.blogID;
  const author_id = req.userId;
  const blog = await BlogModel.findOne({ _id: blogId });
  if (blog?.author_id !== author_id) {
    res.send("you are not authorized");
  } else {
    try {
      await BlogModel.findByIdAndDelete(blogId);
      res.send("blog updated");
    } catch (err) {
      res.status(400).send("bad request");
    }
  }
});
module.exports = { blogRouter };
