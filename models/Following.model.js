const mongoose = require("mongoose");

const followingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  following: { type: Array },
});

const FollowingModel = mongoose.model("following", followingSchema);

module.exports = FollowingModel;
