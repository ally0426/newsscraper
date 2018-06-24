// require packages
var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");
var hbars = require("express-handlebars");
var cheerio = require("cheerio");
var request = require("request");
// require models
var db = require("./models");
// instantiate app
var PORT = process.env.PORT || 9000; 
var app = express();
// configure middleware
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.engine("handlebars", hbars({ defaultLayout: "main"}));
app.set("view engine", "handlebars");
// connect to db
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// require routes
// require("./routes/dataRoutes.js")(app);
app.get("/scrape", function (req, res) {
    request("https://lifehacker.com/tag/programming", function(error, response, body) {
    var $ = cheerio.load(response.body);
    
$("article").each(function(i, element) {
    var result = {};
    result.title = $(element)
        .find("header > h1 > a")
        .text();
    result.link = $(element)
        .find("header > h1 > a")
        .attr("href");
    result.body = $(element)
        .find("div > div > p") 
        .text();  
        // console.log(result);
    db.Article
    .create(result)
    .then(function(dbArticle) {
      console.log(dbArticle);
    })
    .catch(function(err) {
      return res.json(err);
    });
});
console.log("scrape complete");
res.send("Scrape Complete")
});
    
});

app.get("/", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        var obj = {
            article: dbArticle
        }
      res.render("index", obj);
    })
    .catch(function(err) {
      res.json(err);
    })
  });

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
  });

  app.post("/articles/:id", function(req, res) {
    db.Note
      .create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  app.delete("/delete", function(req, res) {
    db.Article.remove({}, function(err) {
      if (err) {
        console.log(err);
      }
    });
    db.Note.remove({}, function(err) {
      if (err) {
        console.log(err);
      }
    });
    res.end();
  })


// listen

app.listen(PORT, function() {
    console.log("App is listening on port: " + PORT);
});