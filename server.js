// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require("express");
const exphbs = require("express-handlebars");

let PORT = process.env.PORT || 8080;
// Sets up the Express App
var app = express();
// express.static is provided the relative path for our public folder
app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//connect mongoose db
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
//lets us know if we are connected to mongoose 
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
  console.log('Connected to Mongoose!');
})

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.listen(PORT, function () {
  console.log("Server listening on: http://localhost:" + PORT);
});