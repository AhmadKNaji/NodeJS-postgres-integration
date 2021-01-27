const Router = require("express-promise-router");
const router = new Router();
const pool = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

router.delete("/delete_user/:id", async (request, response) => {
  u_id = request.params.id;
  if (jwt.decode(request.headers.authorization.split(" ")[1]).role === "admin")
    await pool.query(
      "DELETE FROM public.users WHERE id = $1",
      [u_id],
      (error, results) => {
        if (error) {
          console.log(error);
          response.status(500).send({ err: "Error" });
        } else if (results.rowCount == 0) {
          response.status(404).send("user does not not exist");
        } else if (results.rowCount != 0) {
          response.status(200).send({ ok: "Successfully deleted" });
          // console.log(results);
        }
      }
    );
  else response.status(401).send({ error: "Unauthorized" });
});

router.put("/make_admin", async (request, response) => {
  u_id = request.body.data;
  // console.log(request.body);
  if (jwt.decode(request.headers.authorization.split(" ")[1]).role === "admin")
    await pool.query(
      "UPDATE public.users SET admin = true WHERE id = $1",
      [u_id],
      (error, results) => {
        if (error) {
          console.log(error);
          response.status(500).send({ err: "Error" });
        } else if (results.rowCount == 0) {
          response.status(404).send("user does not not exist");
        } else if (results.rowCount != 0) {
          response.status(200).send({ ok: "Successfully Updated" });
          // console.log(results);
        }
      }
    );
  else response.status(401).send({ error: "Unauthorized" });
});

router.post("/add_user", async (request, response) => {
  console.log(request.body.data);

  const {
    firstName,
    lastName,
    birthday,
    nationality,
    email,
    phoneNb,
    address,
    password,
  } = request.body.data;

  console.log(
    firstName,
    lastName,
    birthday,
    nationality,
    email,
    phoneNb,
    address,
    password
  );

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
          false,
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

router.get("/get_user", async (req, res) => {
  if (jwt.decode(req.headers.authorization.split(" ")[1]).role === "admin")
    await pool.query(
      "SELECT * FROM public.users WHERE admin != true ORDER BY id ASC",
      (err, result) => {
        if (err) {
          console.log(err);
        }
        res.status(200).send(result.rows);
      }
    );
  else res.status(401).send({ error: "Unauthorized" });
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
    await pool.query(
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
