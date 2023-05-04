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

    const decoded = jwt.verify(bearerToken, config.ADMIN_JWT_TOKEN_KEY);
    req.adminAuthId = decoded._id;
    req.name = decoded.name;

    req.role = decoded.role;
    
    if(req.role != "Admin") {
      return res.status(403).send({
        data: null,
        code: 403,
        message: "UnAuthorized Access"
      })
    }

    
  } catch (error) {
    return res.status(401).send({
      code: 401,
      status: 0,
      message: "Unauthorized Token",
    });
  }
  return next();
};
