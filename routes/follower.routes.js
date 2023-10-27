const express = require("express");
const { authenticate } = require("../middleware/Authentication");
const FollowerModel = require("../models/Follower.model");
const FollowingModel = require("../models/Following.model");

const followerRouter = express.Router();

const checkFollowers = async (req, res, next) => {
  const { followerId } = req.body;
  const follower = await FollowerModel.find({ userId: followerId });
  if (!follower.length) {
    await FollowerModel.create({ userId: followerId, followers: [req.userId] });
    req.followerUpdate = false;
  } else {
    req.followerUpdate = true;
  }
  next();
};
const checkFollowing = async (req, res, next) => {
  const { followerId } = req.body;
  const following = await FollowingModel.find({ userId: req.userId });
  console.log(following);
  if (!following.length) {
    await FollowingModel.create({
      userId: req.userId,
      following: [followerId],
    });
    req.followingUpdate = false;
  } else {
    req.followingUpdate = true;
  }
  next();
};

followerRouter.get("/", async (req, res) => {
  try {
    const followers = await FollowerModel.find({ userId: req.userId });
    res.send(followers.followers);
  } catch (err) {
    res.status(500).send({ msg: "interval server error" });
  }
});
followerRouter.post(
  "/",
  authenticate,
  checkFollowers,
  checkFollowing,
  async (req, res) => {
    try {
      const { followerId } = req.body;
      if (req.followerUpdate) {
        await FollowerModel.findOneAndUpdate(
          { userId: followerId },
          { $push: { followers: req.userId } }
        );
      }
      if (req.followingUpdate) {
        await FollowingModel.findOneAndUpdate(
          {
            userId: req.userId,
          },
          {
            $push: { following: followerId },
          }
        );
      }

      res.send({ msg: "followers updated" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ msg: "interval server error" });
    }
  }
);
followerRouter.patch(
  "/decrease",
  authenticate,

  async (req, res) => {
    try {
      const { followerId } = req.body;

      await FollowerModel.findOneAndUpdate(
        { userId: followerId },
        { $pull: { followers: req.userId } }
      );

      await FollowingModel.findOneAndUpdate(
        {
          userId: req.userId,
        },
        {
          $pull: { following: followerId },
        }
      );

      res.send({ msg: "followers updated" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ msg: "interval server error" });
    }
  }
);

module.exports = followerRouter;
