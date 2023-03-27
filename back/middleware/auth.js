const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.RANDOM_TOKEN);
    const userId = decoded.userId;
    req.auth = { userId: userId };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
