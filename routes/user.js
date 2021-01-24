const Router = require("express-promise-router");
const router = new Router();
const pool = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../config');

router.post("/login", async (request, response) => {
  const userReq = request.body;

  findUser(userReq)
    .then((foundUser) => {
      checkPassword(userReq.password, foundUser)
        .then((pay) => {
          console.log(pay);
          return new Promise((resolve) => {
            tok = jwt.sign(
              {
                id: `${pay.id}`,
                email: `${pay.email}`,
                role: pay.admin ? "admin" : "client",
              },
              config.TOKEN_SECRET,
              {
                expiresIn: 86400, // expires in 1 day
              }
            );
            //  console.log(tok);
            resolve(tok);
          });
        })
        .then((token) => {
          return response.status(200).send({
            token: token,
          });
        })
        .catch((err) => {
          return response.status(401).send({
            error: "user or password missmatch",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      response.status(401).send({
        error: "user not found",
      });
    });
});

const findUser = (userReq) => {
  // console.log(userReq.email);
  return new Promise((resolve, reject) => {
    pool
      .query(
        "SELECT id,email,password,admin FROM public.users WHERE email= $1",
        [userReq.email]
      )
      .then((data) => {
        // console.log(data.rows);
        if (data.rows.length > 0) {
          //console.log(data);
          resolve(data.rows[0]);
        } else {
          reject("not found");
        }
      })
      .catch((err) => console.log(err));
  });
};

const checkPassword = (reqPassword, foundUser) => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(reqPassword, foundUser.password, (err, response) => {
      // console.log('ssd' + err);
      if (err) {
        reject(err);
      } else if (response) {
        //   console.log(foundUser)
        resolve(foundUser);
      } else {
        reject("Passwords do not match.");
      }
    })
  );
};

module.exports = router;
