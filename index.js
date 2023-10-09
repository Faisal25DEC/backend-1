const express = require("express");
const { connection } = require("./config/db");
const { UserModel } = require("./models/User.model");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcrypt");
const { authenticate } = require("./middleware/Authentication");
const { authorize } = require("./middleware/Authorize");
const { blogRouter } = require("./routes/blog.routes");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//port
const port = 8080;
app.use(cors());
app.use(express.json());

//variables
const client_id = "c64882d0d651c8eb00e5";
const client_secret = "8c7124c917d76a878fadb176e455327af2464262";

app.get("/", (req, res) => {
  res.send("server started");
});

app.post("/signup", async (req, res) => {
  const { email, password, name, phone } = req.body;
  bcrypt.hash(password, 10, async function (err, hash) {
    await UserModel.create({ email, password: hash, name, phone });
  });

  res.send("sign up successfull");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  const hashed_password = user?.password;
  bcrypt.compare(password, hashed_password, async function (err, result) {
    if (result) {
      const token = jwt.sign({ userId: user._id }, "secretkey");
      console.log(token);

      res.send({ msg: "login successful", token: token });
    } else {
      res.send("login failed");
    }
  });
});
app.get("/auth/github", async (req, res) => {
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

app.use(authenticate);

app.use("/blogs", blogRouter);

app.listen(port, async () => {
  try {
    await connection;
    console.log("database connected");
    console.log("server started on", port);
  } catch (err) {
    console.log(err);
  }
});
