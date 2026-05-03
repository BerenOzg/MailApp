const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  // Username
  const user = await User.findOne({
    username: req.body.username
  })

  if (user) {
      res.status(400).send({ message: "Failed! Username is already in use!" });
      return;
  }

    // Email
  const email = await User.findOne({
      email: req.body.email
  })

  if (email) {
    res.status(400).send({ message: "Failed! Email is already in use!" });
    return;
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;
