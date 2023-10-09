const { UserModel } = require("../models/User.model");

const authorize = (permittedRole) => async (req, res, next) => {
  const { userId } = req;
  const user = await UserModel.findOne({ _id: userId });
  if (user.role == permittedRole) {
    next();
  } else {
    res.send("not authorized");
  }
};

module.exports = { authorize };
