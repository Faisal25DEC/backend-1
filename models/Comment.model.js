const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  blogId: { type: String, required: true },
  userId: { type: String, required: true },
  comment: { type: String, required: true },
});

const CommentModel = mongoose.model("comment", commentSchema);

module.exports = CommentModel;
