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

app.get('/', (req, res, next) => {
  client.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.log(err);
    }
    res.status(200).send(result.rows);
  });
});

// app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.listen(4000, () => console.log(`Example app listening on port 4000!`));
