//defining the article collecition 
const mongoose = require('mongoose');

const Schema = mongoose.Schema
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String
    }
    , link: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
})

let Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;