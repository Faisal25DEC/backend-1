var GoogleStrategy = require("passport-google-oauth20").Strategy;
const fs = require("fs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { UserModel } = require("../models/User.model");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:7700/auth/google/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, cb) {
      const email = profile._json.email;
      const mongooseUser = await UserModel.findOne({ email });
      if (!mongooseUser) {
        const name = profile._json.name;
        const picture = profile._json.picture;
        console.log(profile._json);
        const user = new UserModel({
          name,
          email,
          password: uuidv4(),
          image: picture,
        });
        await user.save();
        console.log(user);
        const token = jwt.sign({ userId: user._id }, "secretkey");
        req.token = token;
        return cb(null, user);
      }
      const token = jwt.sign({ userId: mongooseUser._id }, "secretkey");
      req.token = token;
      return cb(null, mongooseUser);
    }
  )
);

module.exports = passport;
