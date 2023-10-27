const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], required: true },
  author: { type: String, required: true },
  dateCreated: { type: String, required: true },
  author_id: { type: String, required: true },
  text: { type: String },
  image: { type: String },
});

const BlogModel = mongoose.model("blog", blogSchema);

module.exports = { BlogModel };
