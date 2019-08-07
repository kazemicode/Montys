const express = require("express");
const app = express();
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.static("public"));
const jsonfile = require("jsonfile");
const jsonpath = "./public/json/page_data.json"

// const pool = require("./database");

// Routes

// Root route
app.get("/", async function(req, res) {
    res.render("index", {title: "Home"});
});

app.get("/products", async function(req, res) {
    res.render("products", {title: "Products"});
});

app.get("/about", async function(req, res) {
    var data = jsonfile.readFileSync(jsonpath);
    res.render("about", {data, title: "About"});
});

app.get("/faq", async function(req, res) {
    var data = jsonfile.readFileSync(jsonpath);
    res.render("faq", {data, title: "FAQ"});
});

app.get("/cart", async function(req, res) {
    res.render("cart", {title: "Cart"});
});

// Server listener
app.listen("8081", "127.0.0.1", function() {
    console.log("Express server is running...");
});

// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Running Express Server...");
// });