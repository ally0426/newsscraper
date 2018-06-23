// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Requiring our Note and Article models
var mongoose = require("mongoose");
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

// Routes =============================================================
module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render("index", {
            title: "Main Page",
            layout: "main.hbs",
            condition: false
        });
    });
    app.get("/article", function (req, res) {
        res.render("article", {
            title: "Archive Page",
            layout: "main.hbs",
            condition: true
        });
    });

    // A GET request to scrape the echojs website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        request("http://www.techcrunch.com", function (error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);
            //console.log(html);

            // Now, we grab every h2 within an article tag, and do the following:
            $("details").each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).children("h2").text();
                result.body = $(this).children("p").text();
                result.link = $(this).children("h2").children("a").attr("href");
                // console.log(title, body, link);

                // Using our Article model, create a new entry
                // This effectively passes the result object to the entry (and the title and link)
                var entry = new Article(result);

                // Now, save that entry to the db
                entry.save(function (err, data) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    // Or log the data
                    else {
                        console.log(data);
                    }
                });

            });
            // Tell the browser that we finished scraping the text
            res.send("Scrape Completed");
        });

    });

    // This will get the articles we scraped from the mongoDB
    app.get("/articles", function (req, res) {
        // Grab every doc in the Articles array
        Article.find({}, function (err, data) {
            // Log any errors
            if (err) {
                console.log(err);
            }
            // Or send the data to the browser as a json object
            else {
                res.json(data);
            }
        });
    });

    // Grab an article by it's ObjectId
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        Article.findOne({
                "_id": req.params.id
            })
            // ..and populate all of the notes associated with it
            .populate("notes")
            // now, execute our query
            .then(function (err, data) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Otherwise, send the doc to the browser as a json object
                else {
                    res.json(data);
                }
            });
    });


    // Create a new note or replace an existing note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        var newNote = new Note(req.body);
        console.log(newNote);

        // And save the new note the db
        newNote.save(function (err, result) {
            // Log any errors
            if (err) {
                console.log(err);
            }
            // Otherwise
            else {
                // Use the article id to find and update it's note
                Article.findOneAndUpdate({
                        "_id": req.params.id
                    }, {
                        $push: {
                            "notes": result._id
                        }
                    })
                    // Execute the above query
                    .then(function (err, data) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        } else {
                            // Or send data to the browser
                            res.send(data);
                        }
                    });
            }
        });

    });

    // Save an article to archive
    app.post("/save/:id", function (req, res) {
        console.log(req.body);
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({
                "_id": req.params.id
            }, {
                "saved": req.body.saved
            })
            // Execute the above query
            .then(function (err, result) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else {
                    // Or send the result to the browser
                    res.send(result);
                }
            });
    });

    app.delete("/delete/:id", function (req, res) {
        console.log(req.body);
        // Use the article id to find and update it's note
        Article.deleteOne({
                "_id": req.params.id
            })
            // Execute the above query
            .then(function (err, result) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else {
                    // Or send the result to the browser
                    res.send(result);
                }
            });
    });

    app.delete("/note/delete/:id", function (req, res) {
        console.log(req.body);
        // Use the note id to find and update it's note
        Note.deleteOne({
                "_id": req.params.id
            })
            // Execute the above query
            .then(function (err, result) {
                // Log any errors
                if (err) {
                    console.log(err);
                } else {
                    // Or send the result to the browser
                    res.send(result);
                }
            });
    });
};