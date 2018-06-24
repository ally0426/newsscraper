// require mongoose
const mongoose = require("mongoose");
// save constructor
const Schema = mongoose.Schema;
// make a new schema
var ArticleSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;