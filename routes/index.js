const user = require("./user");
const cards = require("./cards");
var jwt = require("jsonwebtoken");
var moment = require("moment");
const config = require("../config");

function VerifyToken(req, res, next) {
  // console.log(res);
  if (!req.headers.authorization) {
    return res.status(401).send({
      error: "Token_Missing",
    });
  }
  var token = req.headers.authorization.split(" ")[1];
  var payload = null;
  try {
    payload = jwt.verify(token, config.TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return res.status(401).send({
      error: "Token_Invalid",
    });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({
      error: "Token_Expired",
    });
  }

  // console.log(payload);
  req.id = payload.id;
  req.email = payload.email;
  req.role = payload.role;
  // console.log(payload.role);
  // console.log(payload)
  //console.log(req.id)
  //console.log(req.name)
  next();
}

module.exports = (app) => {
  app.use('/user', user);
  app.use('/cards', VerifyToken, cards);
};
