const Router = require("express-promise-router");
const router = new Router();
const pool = require("../db/dbconfig");
const bcrypt = require("bcrypt");
const config = require("../config");

router.get("/get_cards_by_id", async (req, res) => {
  console.log(req.id);
  await pool.query(
    "SELECT * FROM public.cc_info  WHERE user_id = $1 ORDER BY ccid ASC",
    [req.id],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.status(200).send(result.rows);
    }
  );
});

router.post("/add_card", async (request, response) => {
  user_id = request.id;
  console.log(user_id);
  //   console.log(request);

  // console.log(request.body.data);

  const { ccnb, expirydate, ccv } = request.body.data;

  if (!ccnb || !expirydate || !ccv)
    response.status(401).send("error missing input data");
  else {
    await pool.query(
      "INSERT INTO public.cc_info (ccnb, expirydate, ccv, user_id, balance) VALUES ($1, $2, $3, $4, 0)",
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
  const { ccid, ccnb, expirydate, ccv } = request.body;
  await pool.query(
    "UPDATE public.cc_info SET ccnb = $2, expirydate = $3, ccv = $4 WHERE ccid = $1",
    [ccid, ccnb, expirydate, ccv],
    (error, result) => {
      if (error) console.log(error);
      else response.status(201).send({ ok: "Successfully Updated" });
    }
  );
});

router.put("/add_balance", async (request, response) => {
  const { ccid, balance } = request.body.data;
  await pool.query(
    "UPDATE public.cc_info SET balance = $2 WHERE ccid = $1",
    [ccid, balance],
    (error, result) => {
      if (error) console.log(error);
      else response.status(201).send({ ok: "Successfully Updated" });
    }
  );
});

router.delete("/delete_card/:id", async (request, response) => {
  c_id = request.params.id;
  await pool.query(
    "DELETE FROM public.cc_info WHERE ccid = $1",
    [c_id],
    (error, results) => {
      if (error) {
        console.log(error);
        response.status(500).send({ err: "Error" });
      } else if (results.rowCount == 0) {
        response.status(500).send("card not exists");
      } else if (results.rowCount != 0) {
        response.status(200).send({ ok: "Successfully deleted" });
        // console.log(results);
      }
    }
  );
});

module.exports = router;
