const express = require("express");
const app = express();
app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.static("public"));
const session = require("express-session");
const bcrypt = require("bcrypt");
const jsonfile = require("jsonfile");
const jsonpath = "./public/json/page_data.json"
var json = jsonfile.readFileSync(jsonpath);

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
 }));

app.use(express.urlencoded({extended: true})); // to be able to parse POST parameters

const pool = require("./database");

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({extended: true}));

// Routes

// Root route
app.get("/", async function(req, res) {
    res.render("index", {title: "Home", json});
});

app.get("/products", async function(req, res) {

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
            category: "Potions",
            price: "42g"
        }
    ];

    res.render("products", {title: "Products", json, data});
});

app.get("/product", async function(req, res) {
    res.render("product", {title: "Product", json});
});

app.get("/about", async function(req, res) {
    res.render("about", {title: "About", json});
});

app.get("/faq", async function(req, res) {
    res.render("faq", {title: "FAQ", json});
});

app.get("/cart", async function(req, res) {
    let data = [
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

app.get("/login", function(req, res) {
    res.render("login", {title: "Login"});
});

app.post("/login", async function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    let result = await checkUsername(username);
    let hashedPwd = "";
    let usernameValue = "";

    if (result.length > 0) {
        usernameValue = result[0].username;
        hashedPwd = result[0].password;
    }

    let passwordMatch = await checkPassword(password, hashedPwd);

    if (username == usernameValue && passwordMatch) {
        req.session.authenticated = true;
        res.render("admin", {title: "Admin"});
    }
    else {
        res.render("login", {loginError: true, title: "Login"});
    }
});

app.get("/admin", function(req, res) {
    res.render("admin", {title: "Admin"});
});;

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

// Functions

function checkUsername(username) {
    let sql = "SELECT * FROM users WHERE username = ?";
    return new Promise(function (resolve, reject) {
        pool.query(sql, [username], function(err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

function checkPassword(password, hashedValue) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(password, hashedValue, function(err, result) {
            resolve(result);
        });
    });
}

// Server listener
// app.listen("8081", "127.0.0.1", function() {
//     console.log("Express server is running...");
// });

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running Express Server...");
});