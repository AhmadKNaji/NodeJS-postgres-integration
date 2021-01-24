var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var config = require('./config');
const mountRoutes = require('./routes');
var cors = require("cors");
var helmet = require("helmet");

//const readLog = require('./readlog');

app.use(cors());
app.use(helmet());


app.use(bodyParser.urlencoded({
      extended: false
}));

app.use(bodyParser.json());

http.createServer(app).listen(config.LISTEN_PORT, () => {
      console.log('listening on port ' + config.LISTEN_PORT);
});


mountRoutes(app)