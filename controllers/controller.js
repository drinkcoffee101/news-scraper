const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const axios = require('axios');

const Comment = require('../models/comments.js');
const Article = require('../models/article.js');

router.get('/', (req, res) => {
    res.redirect('/articles')
})
//get route to scrape website for information and store in db
router.get('/scrape', (req, res) => {
    axios.get('https://www.attackmagazine.com/news/')
        .then((result) => {
            const html = result.data
            const $ = cheerio.load(html)
            //search for each element containing article 
            $('.article--wide').each((i, element) => {

                let result = {
                    title: $(element).find('h3').text(),
                    link: $(element).find('a').attr("href"),
                    summary: $(element).find('p').text().slice(4),
                    img: $(element).find('.inner').attr('style').slice(22, -2)
                }
                //this checks if the document exsists in the collection
                Article.countDocuments({ title: result.title }, (err, test) => {
                    if (test === 0) {
                        Article.create(result)
                            .then((res) => {
                                console.log(res)
                                // let documents = { article: rese }
                                // res.render('index', documents)
                            })
                            .catch((err) => { console.error(err) })
                    }
                })
            })
            res.redirect('/')
            // res.redirect('http://localhost:8080/')
            // res.redirect('/articles')
            // res.redirect('http://localhost:8080/')
            // res.redirect('/')
            // window.location.reload()
            // res.redirect('/articles')
            // res.redirect('back');
        })
        .catch((err) => {
            console.error(err)
        })
    // res.redirect('/')
})

//grab every artivle and populate the dom 
router.get('/articles', (req, res) => {
    Article.find().sort({ _id: -1 })
        .populate('comment')
        .then((doc) => {
            // console.log(doc[0].comment)
            let documents = { article: doc }
            res.render('index', documents)
        })
        .catch((err) => { console.error(err) })
})

//finds all articles and returns as JSON 
router.get('/articles-json', (req, res) => {
    Article.find({})
        .then((doc) => {
            res.json(doc)
        }).catch((err) => {
            console.error(err)
        })
})

//Delete route to ger rid of a comment 
router.get('/delete_comment/:id', (req, res) => {
    Comment.deleteOne({ _id: req.params.id })
        .then(() => {
            console.log('removed comment')
            res.redirect('/')
        })
        .catch((err) => {
            console.error(err)
        })
})

//route to remove all articles
router.get('/clear', (req, res) => {
    Article.deleteMany({})
        .then(() => {
            console.log('removed all articles ')
            res.redirect('/')
        })
        .catch((err) => {
            console.error(err)
        })
})


//post route to associate comment with article 
router.post('/comment/:id', (req, res) => {
    let articleId = req.params.id;

    let comment = {
        name: req.body.name,
        body: req.body.comment
    }

    Comment.create(comment)
        .then((dbComment) => {
            return Article.findOneAndUpdate({ _id: articleId }, { $push: { comment: dbComment._id } }, { new: true })
        })
        .then((dbArticle) => {
            // console.log(dbArticle)
            res.redirect('/')
        })
        .catch((err) => {
            console.error(err)
        })
})



// Export routes for server.js to use.
module.exports = router;