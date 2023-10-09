const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  console.log(token);
  jwt.verify(token, "secretkey", function (err, decoded) {
    if (err) {
      res.send("login first");
    } else {
      req.userId = decoded.userId;
      next();
    }
  });
};

module.exports = { authenticate };
