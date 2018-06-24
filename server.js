// Dependencies
var express = require("express");
var hbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");


// Initialize Express
var app = express();

// // Use morgan and body parser with our app
// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({
//   extended: false
// }));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


// Make public a static dir
app.use(express.static("public"));

// Set Handlebars.
app.engine("hbs", hbs({extname: "hbs", defaultLayout: "main", layoutsDir: __dirname + "/views/layouts" }));
app.set("view engine", "hbs");

// Routes =============================================================
require("./routes/api-routes.js")(app);

// Database configuration with mongoose
var MONGODB_URI = "mongodb://heroku_4h3h27vx:c46ero1fqmulot4sapvsb48nh@ds117101.mlab.com:17101/heroku_4h3h27vx" || "mongodb://localhost/mongoHeadlines";
// Set mongoose to leverage built in JavaScript ES6 Promises and connect to Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var db = mongoose.connection;

var PORT = process.env.PORT || 3000;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});