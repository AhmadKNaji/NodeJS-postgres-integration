const Router = require("express-promise-router");
const router = new Router();
const pool = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../config');

router.get('/get_user', (req,res) => {
  pool.query("SELECT * FROM public.users ORDER BY id ASC ", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.status(200).send(result.rows);
  });
});

router.post("/add_user", async (request, response) => {
  // console.log(request.body);

  const {
    firstName,
    lastName,
    birthday,
    nationality,
    email,
    phoneNb,
    admin,
    address,
    password,
  } = request.body;

  // console.log(
  //   firstName,
  //   lastName,
  //   birthday,
  //   nationality,
  //   email,
  //   phoneNb,
  //   admin,
  //   address,
  //   password
  // );
  if (
    // false
    !firstName ||
    !lastName ||
    !birthday ||
    !nationality ||
    !email ||
    !phoneNb ||
    // !admin ||
    !address ||
    !password
  )
    response.status(401).send("error missing input data");
  else {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) response.send("hash error");
      await pool.query(
        "INSERT INTO public.users (firstName, lastName, birthday, nationality, email, phoneNb, admin, address, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          firstName,
          lastName,
          birthday,
          nationality,
          email,
          phoneNb,
          admin,
          address,
          hash,
        ],
        (error, results) => {
          if (error) {
            console.log(error);
            response.status(4).json({
              error: error.detail,
            });
          }
          response.send({ ok: "Successfully inserted" });
        }
      );
    });
  }
});

router.put("/update_user", async (request, response) => {
  const {
    id,
    firstName,
    lastName,
    birthday,
    nationality,
    email,
    phoneNb,
    admin,
    address,
    password,
  } = request.body;

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) response.send("hash error");
    pool.query(
      "UPDATE public.users SET firstName = $2, lastName = $3, birthday = $4, nationality = $5, email = $6, phoneNb = $7, admin = $8, address = $9, password = $10 WHERE id = $1",
      [
        id,
        firstName,
        lastName,
        birthday,
        nationality,
        email,
        phoneNb,
        admin,
        address,
        hash,
      ],
      (error, result) => {
        if (error) console.log(error);
        else response.status(201).send({ ok: "Successfully Updated" });
      }
    );
  });
});

router.delete("/delete_user/:id", async (request, response) => {
  u_id = request.params.id;
  await pool.query(
    "DELETE FROM public.users WHERE id = $1",
    [u_id],
    (error, results) => {
      if (error) {
        console.log(error);
        response.status(500).send({ err: "Error" });
      } else if (results.rowCount == 0) {
        response.status(500).send("id not exists");
      } else if (results.rowCount != 0) {
        response.status(200).send({ ok: "Successfully deleted" });
        // console.log(results);
      }
    }
  );
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
