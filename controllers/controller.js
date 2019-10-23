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
})

router.get('/scrape', (req, res) => {
    axios.get('https://www.attackmagazine.com/news/').then((res) => {
        const html = res.data
        const $ = cheerio.load(html)
        // An empty array to save the data that we'll scrape
        var results = [];
        //search for each element containing article 
        $('.article--wide').each((i, element) => {
            // var result = {};
            //find title
            let title = $(element).children('h3').text()
            let link = $(element).children('a').attr("href")
            let exerpt = $(element).children('p').text()
            // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
                title: title,
                link: link,
                summary: exerpt
            });

        })
        res.redirect('/')
    }).catch((err) => {

    })
})