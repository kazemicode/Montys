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
    var json = jsonfile.readFileSync(jsonpath);
    res.render("index", {title: "Home", json});
});

app.get("/products", async function(req, res) {

    var json = jsonfile.readFileSync(jsonpath);
    let data = [
        {
            image: "/img/necronomicon.png",
            name: "Necronomicon",
            category: "Books",
            price: "2000g"
        },
        {
            image: "/img/shield_scorched.png",
            name: "Lightly Scorched Shield",
            category: "Equipment",
            price: "500g"
        },
        {
            image: "/img/partial_health_pot.png",
            name: "Half-full Health Potion",
            category: "Potion",
            price: "42g"
        }
    ];

    res.render("products", {title: "Products", json, data});
});

app.get("/product", async function(req, res) {
    var json = jsonfile.readFileSync(jsonpath);
    res.render("product", {title: "Product", json});
});

app.get("/about", async function(req, res) {
    var json = jsonfile.readFileSync(jsonpath);
    res.render("about", {title: "About", json});
});

app.get("/faq", async function(req, res) {
    var json = jsonfile.readFileSync(jsonpath);
    res.render("faq", {title: "FAQ", json});
});

app.get("/cart", async function(req, res) {
    var json = jsonfile.readFileSync(jsonpath);
    var data = [
        {
            image: "/img/necronomicon.png",
            name: "Necronomicon",
            price: "2000g",
            quantity: "20"
        },
        {
            image: "/img/shield_scorched.png",
            name: "Lightly Scorched Shield",
            price: "500g",
            quantity: "8"
        },
        {
            image: "/img/partial_health_pot.png",
            name: "Half-full Health Potion",
            price: "42g",
            quantity: "4"
        }
    ];

    res.render("cart", {title: "Cart", json, data});
});

// Server listener
app.listen("8081", "127.0.0.1", function() {
    console.log("Express server is running...");
});

// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Running Express Server...");
// });