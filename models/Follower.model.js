const mongoose = require("mongoose");

const followerSchema = mongoose.Schema({
  userId: { type: String, required: true },
  followers: { type: Array },
});

const FollowerModel = mongoose.model("follower", followerSchema);

module.exports = FollowerModel;
