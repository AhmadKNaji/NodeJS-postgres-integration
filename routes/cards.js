const Router = require("express-promise-router");
const router = new Router();
const pool = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const config = require("../config");

router.get("/get_cards", (req, res) => {
  pool.query("SELECT * FROM public.cc_info ORDER BY id ASC ", (err, result) => {
    if (err) {
      console.log(err);
    }
    res.status(200).send(result.rows);
  });
});

router.post("/add_card", async (request, response) => {
  user_id = request.id;

  //   console.log(request);

  const { ccnb, expirydate, ccv } = request.body;

  if (!ccnb || !expirydate || !ccv)
    response.status(401).send("error missing input data");
  else {
    await pool.query(
      "INSERT INTO public.cc_info (ccnb, expirydate, ccv, user_id) VALUES ($1, $2, $3, $4)",
      [ccnb, expirydate, ccv, user_id],
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
  }
});

router.put("/update_card", async (request, response) => {
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
      "UPDATE public.cc_info SET firstName = $2, lastName = $3, birthday = $4, nationality = $5, email = $6, phoneNb = $7, admin = $8, address = $9, password = $10 WHERE id = $1",
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

router.delete("/delete_card/:id", async (request, response) => {
  u_id = request.params.id;
  await pool.query(
    "DELETE FROM public.cc_info WHERE id = $1",
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

module.exports = router;
