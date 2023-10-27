const mongoose = require("mongoose");

const readingListSchema = mongoose.Schema({
  userId: { type: String, required: true },
  blogId: { type: String, required: true },
});

const ReadingListModel = mongoose.model("reading_list", readingListSchema);

module.exports = { ReadingListModel };
