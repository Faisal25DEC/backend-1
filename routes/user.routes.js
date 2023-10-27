const express = require("express");
const { UserModel } = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/Authentication");

const userRouter = express.Router();

const client_id = "c64882d0d651c8eb00e5";
const client_secret = "8c7124c917d76a878fadb176e455327af2464262";

userRouter.get("/", authenticate, async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.userId });
    console.log(user);
    res.send(user);
  } catch (err) {
    res.status(500).send({ msg: "internal server error/user doesn't exist" });
  }
});

userRouter.post("/signup", async (req, res) => {
  let { email, password, name, phone, image } = req.body;
  const user = UserModel.findOne({ email });
  image = image
    ? image
    : "https://webcolours.ca/wp-content/uploads/2020/10/webcolours-unknown.png";
  if (user) res.status(400).send({ msg: "user already exist" });
  bcrypt.hash(password, 10, async function (err, hash) {
    await UserModel.create({ email, password: hash, name, phone, image });
  });

  res.send("sign up successfull");
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  const hashed_password = user?.password;
  bcrypt.compare(password, hashed_password, async function (err, result) {
    if (result) {
      const token = jwt.sign({ userId: user._id }, "secretkey");
      console.log(token);
      res.cookie("jwttoken", token, {
        httpOnly: false,
        sameSite: "lax",
      });

      res.send({ msg: "login successful" });
    } else {
      res.send("login failed");
    }
  });
});
userRouter.get("/auth/github", async (req, res) => {
  const { code } = req.query;
  const access_token = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    }
  );
  const token = await access_token.json();
  console.log(token);

  const userDetails = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  }).then((res) => res.json());
  console.log(userDetails);
  const email_response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  const email_data = await email_response.json();

  console.log("Emails:", email_data);
  const user = UserModel.findOne({ email: email_data[0].email });
  if (!user) {
    UserModel.create({ email: email_data[0].email, password: "1234" });
  }

  res.redirect("http://localhost:3000");
});

module.exports = { userRouter };
