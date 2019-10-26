const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');

const Comment = require('../models/comments.js');
const Article = require('../models/article.js');

router.get('/', (req, res) => {
    res.redirect('/articles')
    // res.send("Hello world");
})

router.get('/scrape', (requ, resu) => {
    axios.get('https://www.attackmagazine.com/news/').then((res) => {
        const html = res.data
        const $ = cheerio.load(html)
        // An empty array to save the data that we'll scrape
        var titlesArray = [];
        //search for each element containing article 
        $('.article--wide').each((i, element) => {

            let result = {
                title: $(element).find('h3').text(),
                link: $(element).find('a').attr("href"),
                summary: $(element).find('p').text().slice(4),
                img: $(element).find('.inner').attr('style').slice(22, -2)

            }
            //check for duplicate titles 
            //if the current searched element is not empty 
            // if (result.title !== '' && result.link !== '') {
            //check if the searched element already exsists 
            // if (titlesArray.indexOf(result.title) == -1) {
            //     //if not, add it to the list of titles
            //     titlesArray.push(result.title)
            //this checks if the document exsists in the collection
            Article.countDocuments({ title: result.title }, (err, test) => {
                if (test === 0) {
                    //instanciate a new document using the Artcile model 
                    //comes with a .save() method to add the new document to the db
                    var entry = new Article(result)

                    entry.save((err, doc) => {
                        if (err) {
                            console.error(err)
                        }
                        else {
                            console.log(doc)
                        }
                    })
                }
            })
            // }
            // else {
            //     console.log('Article already exsists')
            // }
            // }
            // else {
            //     console.log('Not saved to DB, missing data')
            // }
        })
        res.redirect('/')
    }).catch((err) => {

    })
})

//grab every artivle and populate the dom 
router.get('/articles', (req, res) => {
    Article.find().sort({ _id: -1 })
        //mongoose queries are not promises 
        //if you need a real Promise use exec 
        .exec((err, doc) => {
            if (err) {
                console.error(err)
            }
            else {
                let documents = { article: doc }
                res.render('index', documents)
            }
        })
})

//finds all articles and returns as JSON 
router.get('/articles-json', (req, res) => {
    Article.find({}, (err, doc) => {
        if (err) {
            console.error(err)
        } else {
            res.json(doc)
        }
    })
})

//route to remove all articles
router.get('/clear', (req, res) => {
    Article.remove({}, (err, doc) => {
        if (err) {
            console.error(err)
        }
        else {
            console.log('removed all articles ')
        }
    })
    res.redirect('/artcles-json')
})

router.post('/comment/:id', (req, res) => {
    let articleId = req.params.id;

    let comment = {
        name: req.body.name,
        body: req.body.comment
    }

    console.log(comment)

    let newComment = new Comment(comment)

    newComment.save((err, doc) => {
        if (err) {
            console.error(err)
        }
        else {
            console.log("comment id:" + doc._id);
            console.log("articleId:" + articleId)

            // Article.findByIdAndUpdate(
            //     { _id: articleId },
            //     { $push: { comment: doc._id } },
            //     { new: true }
            // ).exec((err, doc) => {
            //     if (err) {
            //         console.error(err)
            //     }
            //     else {
            //         // res.redirect('/')
            //     }
            // })
            Article.findOneAndUpdate({ _id: articleId }, { $push: { comment: doc._id } }, { new: true }).then((dbArticle) => {

            }).catch((error) => {
                console.error(error)
            })
        }
    })

})


// Export routes for server.js to use.
module.exports = router;