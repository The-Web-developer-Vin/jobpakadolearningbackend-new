const jwt = require("jsonwebtoken");

const config = process.env;

module.exports = (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    let bearer = token.split(" ");
    let bearerToken = bearer[1];
    if (!bearerToken) {
      return res.status(403).send({
        data: null,
        code: 403,
        message: "Authorization failed,token required",
      });
    }
    const decoded = jwt.verify(bearerToken, config.JWT_TOKEN_KEY);
    req.userAuthId = decoded._id;
    req.name = decoded.name;
  } catch (error) {
    return res.status(401).send({
      code: 401,
      status: 0,
      message: "Unauthorized Token",
    });
  }
  return next();
};