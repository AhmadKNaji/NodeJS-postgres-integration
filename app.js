const express = require('express');
const app = express();
const { Client } = require('pg');
const connectionString = 'postgres://postgres:postgres@localhost:5432/postgres';
app.use(express.json());

const client = new Client({
  connectionString: connectionString,
});

client.connect();

app.set('port', process.env.PORT || 4000);

app.get('/get_user', (req, res, next) => {
  client.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.log(err);
    }
    res.status(200).send(result.rows);
  });
});

app.post('/add_user', async (request, response) => {
  const { name, password } = request.body;

  client.query(
    'INSERT INTO public.users (name, password) VALUES ($1, $2)',
    [name, password],
    (error, result) => {
      if (error) console.log(error);
      else response.status(201).send(`User added with ID: ${result.insertId}`);
    },
  );
});

// app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.listen(4000, () => console.log(`Example app listening on port 4000!`));

module.exports = app;
