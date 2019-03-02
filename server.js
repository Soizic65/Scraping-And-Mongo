var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();


var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 8080;



app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/unit18Populater";


mongoose.connect(MONGODB_URI);



app.get("/scrape", function (req, res) {
  axios.get("https://www.newsobserver.com/living/family/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("#story-list article .title").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .siblings(".summary")
        .text()

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.redirect("/");
  });
});

app.get("/", function (req, res) {
  db.Article.find({})
    .then(function (dbArticles) {
      var dbArticles = {
        dbArticles: dbArticles
      }
      res.render("index", dbArticles)

    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles-notes/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })  
    .then(function (selectedArticleNotes) {
      var selectedNotes = {
        selectedArticleNotes: selectedArticleNotes.note,
        id: req.params.id
      }
      res.render("viewnotes", selectedNotes)

    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (data) {
      res.json(data)
    })
});


app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })   
    .then(function (selectedArticle) {
      var selectedArticle = {
        selectedArticle: selectedArticle
      }
      console.log(selectedArticle)
      res.render("notes", selectedArticle)
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.post("/articles/:id", function (req, res) {
  articleId = req.params.id
  db.Note.create(req.body)
    .then(function (dbNote) {
      console.log(dbNote)
      return db.Article.update({ _id: articleId }, { $push: { "note": { dbNote } } })
        .then(function () {
          res.status(200)
        })
        .catch(function (err) {
          res.json(err);
        });
    });
})

app.post("/read/:id", function (req, res) {
  articleId = req.params.id
  db.Article.findOneAndUpdate(
    { _id: articleId },
    { $set: { read: true } })
    .then(function () {
      res.status(200)
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/unread/:id", function (req, res) {
  articleId = req.params.id
  db.Article.findOneAndUpdate(
    { _id: articleId },
    { $set: { read: false } })
    .then(function () {
      res.status(200)
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/delete/", function (req, res) {  
  db.Article.remove({})
    .then(function () {
      res.status(200)
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});