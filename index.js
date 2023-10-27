const express = require("express");
const { connection } = require("./config/db");
const { UserModel } = require("./models/User.model");
const jwt = require("jsonwebtoken");
const app = express();

const { blogRouter } = require("./routes/blog.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { userRouter } = require("./routes/user.routes");
const passport = require("./config/google.oauth");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//port
const port = 7700;
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],

    credentials: true,
    "Access-Control-Allow-Credentials": true,
  })
);
app.use(express.json());
app.use(cookieParser());

//variables

app.get("/", (req, res) => {
  res.send("server started");
});

app.use("/users", userRouter);

app.use("/blogs", blogRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),

  function (req, res) {
    // Successful authentication, redirect home.
    const token = req.token;
    res.cookie("jwttoken", token, {
      httpOnly: false,
      sameSite: "lax",
    });
    res.redirect(`http://localhost:3000`);
  }
);

app.listen(port, async () => {
  try {
    await connection;
    console.log("database connected");
    console.log("server started on", port);
  } catch (err) {
    console.log(err);
  }
});
