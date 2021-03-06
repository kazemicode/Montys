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
    secret: "sneaky fox",
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({extended: true}));

// Routes

// Root route
app.get("/", async function(req, res) {
    var data = await featuredItems();
    res.render("index", {title: "Home", json, data});
});

app.get("/products", async function(req, res) {
    var data = await getProducts();
    var cats = await getAllCategories();
    var range = await getPriceRange();

    var rangeValues = [];

    for (var i = range[0].min; i < range[0].max + 1; i += 100) {
        rangeValues.push(i);
    }

    res.render("products", {
        title: "Products", 
        json, 
        data,
        cats,
        rangeValues
    });
});

/* Monty's API Routes */
// Note: req.params gets data passed in via the request body -- use with router params (preceded by ':')
//       req.query  gets data passed in via the request query string 
// Add new product to cart

/* PRODUCTS */
/************/

// Get the lowest and highest prices from products table to populate form
app.get("/priceRange", function(req, res) {
    var sql = "SELECT MIN(price), MAX(price) FROM products ORDER BY ASC";
    pool.query(sql, function(err, rows) {
        if (err) throw err;
        res.send(rows[0]);
    });
});

// Get all categories from products table to populate form
app.get("/categories", function(req, res) {
    var sql = "SELECT DISTINCT category FROM products ORDER BY ASC";
    pool.query(sql, function(err, rows) {
        if (err) throw err;
        res.send(rows[0]);
    });
});

app.get("/products/search", async function(req, res) {
    var searchParams = await constructSearch(req.query);
    var sql = "SELECT * FROM products WHERE " + searchParams.labels;
    var sqlParams = searchParams.values;

    pool.query(sql, sqlParams, function(err, rows) {
        if (err) throw err;
        res.send(rows);
    });
});

app.get("/products/searchAll", async function(req, res) {
    var sql = "SELECT * FROM products";

    pool.query(sql, function(err, rows) {
        if (err) throw err;
        res.send(rows);
    });

});

// Get product based off category (submitted via drop down search)
// Category is passed through query string
app.get("/searchByCategory", function(req, res) {
    var sql = "SELECT * FROM products WHERE category = ?"
    var sqlParams = [req.query.category];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
});
  
  // Get product based off name (string-based form search)
  // Name is passed through query string
app.get("/searchByName", function(req, res) {
    var sql = "SELECT * FROM products WHERE name = ?"
    var sqlParams = [req.query.name];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
});
  
// Renders the individual product pages
// Get product based off id
// Product id is passed through request body
app.get("/products/:productId", function(req, res) {
    var sql = "SELECT * FROM products WHERE productId = ?"
    var sqlParams = [req.params.productId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.render("product", {data: result[0], title: result[0].name, json});
    });
});
  
// Add new product to the table
// All params are passed through a form POST
// Note: Product ID gets autoincremented, so is not passed in

app.post("/products/add", isAuthenticated, function(req, res) {
    var sql = "INSERT INTO products(name, category, description, price, imgURL) VALUES(?,?,?,?,?)";
    var sqlParams = [req.body.name, req.body.category, req.body.description, req.body.price, req.body.imgURL];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.send(true);
    });
});

// Delete existing product from the table
// All params are passed through a form POST
app.delete("/products/remove", isAuthenticated, function(req, res) {
    var sql = "DELETE FROM products WHERE productId = ?";
    var sqlParams = [req.body.productId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.send(true);
    });
});

// Update existing product from the table
// All params are passed through a form POST
app.post("/products/update", isAuthenticated, function(req, res) {
    var sql = "UPDATE products SET name = ?, category = ?, description = ?, price = ?, imgURL = ? WHERE productId = ?";
    var sqlParams = [req.body.name, req.body.category, req.body.description, req.body.price, req.body.imgURL, req.body.productId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.send(true);
    });
});

// Static Pages -------------------------- //

app.get("/about", async function(req, res) {
    res.render("about", {title: "About", json});
});

app.get("/faq", async function(req, res) {
    res.render("faq", {title: "FAQ", json});
});

// Cart -------------------------- //

app.get("/cart", async function(req, res) {
    var cartContents = await getCartContents([req.session.id]);
    var cartTotals = await getCartTotals([req.session.id]);
    var qty = 0;
    var price = 0;
    if (cartTotals[0].qty != null && cartTotals[0].price != null) {
        qty = cartTotals[0].qty;
        price = cartTotals[0].price;
    }
    res.render("cart", {
        title: "Cart", 
        json,
        data: cartContents,
        qty,
        price
    });
});

// Add a product to cart
// Session id is passed through request body
// Note: Cart ID gets autoincremented, so is not passed in
// All other params passed through a query string
// app.post("/cart/:sessionId/add", function(req, res) {
app.post("/cart/add", async function(req, res) {
    var sql = "INSERT INTO cart(sessionId, productId, qty, price, category) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE qty = qty + ?";
    var productCategory = await getItemCategory(req.body.productId);
    var sqlParams = [req.session.id, req.body.productId, req.body.quantity, req.body.price, productCategory[0].category, req.body.quantity];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.send(true);
    });
});

  // Remove product from to cart
  // Session id and product id are passed through the request body
app.post("/cart/remove", function(req, res) {
    var sql = "DELETE FROM cart WHERE sessionId = ? AND productId = ?";
    var sqlParams = [req.session.id, req.body.productId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
        res.send(true);
    });
});

// Admin login -------------------------- //

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

app.get("/addProduct", isAuthenticated, function(req,res){
    res.render("addProduct", {title: "Admin"});
});

app.get("/removeProduct", isAuthenticated, async function(req,res){
    let products = await getProducts();    
    res.render("removeProduct", {title: "Admin", data: products});
});

app.get("/updateProduct", isAuthenticated, async function(req,res){
    let products = await getProducts();    
    res.render("updateProduct", {title: "Admin", data: products});
});

app.get("/report", isAuthenticated, async function(req,res){
    let orders = await getOrders();
    res.render("report", {title: "Admin", data: orders});

});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

/* ORDERS */
/**********/

// Add contents of cart to orders table and empty current user cart
app.post("/checkout", async function(req, res) {
    var cartContents = await getCartContents(req.session.id);
    cartContents.forEach(function(item) {
        let sql = "INSERT INTO orders(sessionId, productId, qty, price, category) VALUES(?, ?, ?, ?, ?)"
        let sqlParams = [item.sessionId, item.productId, item.qty, item.price, item.category];
        pool.query(sql, sqlParams, function(err, result) {
            if (err) throw err;
        });
    });
    let sql = "DELETE FROM cart WHERE sessionId = ?";
    let sqlParams = req.session.id;
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
    res.send(true);
});
  
  // Returns a report of total number of orders, total quantity of items, and total revenue -- grouped by product category
app.post("/orders/report", function(req, res){
    var sql = 'SELECT SUM(DISTINCT orderId) as totalOrders, SUM(qty) as totalItems, SUM(price*qty) as totalRevenue FROM orders GROUP BY category WITH ROLLUP';
    pool.query(sql, function(err, result) {
        if (err) throw err;
    });
});

// Functions

function constructSearch(data) {
    var labels = [];
    var values = [];

    if (data.itemName != "") {
        labels.push("name LIKE ?");
        values.push("%" + data.itemName + "%");
    }
    if (data.cat != "") {
        labels.push("category = ?");
        values.push(String(data.cat));
    }
    if (data.minRange != "") {
        labels.push("price >= ?");
        values.push(String(data.minRange));
    }
    if (data.maxRange != "") {
        labels.push("price <= ?");
        values.push(String(data.maxRange));
    }

    return {
        labels: labels.join(" AND "),
        values: values
    };
}

function featuredItems() {
    let sql = "SELECT * FROM products ORDER BY Rand() LIMIT 3";

    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, rows) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

// Return a category given a productId
function getItemCategory(productId) {
    let sql = "SELECT category FROM products WHERE productId = ?";
    let sqlParams = productId;
    return new Promise(function(resolve, reject) {
        pool.query(sql, sqlParams, function(err, cat) {
            if (err) throw err;
            resolve(cat);
        });
    });
}

// Returns the total item count and subtotal price for the cart
function getCartTotals(sessionId) {
    let sql = "SELECT SUM(qty) as qty, SUM(price * qty) as price FROM cart WHERE sessionId = ?";
    let sqlParams = sessionId;
    return new Promise(function(resolve, reject) {
        pool.query(sql, sqlParams, function(err, totals) {
            if (err) throw err;
            resolve(totals);
        });
    });
}

// Returns all rows within the cart for a given sessionId
function getCartContents(sessionId) {
    let sql = "SELECT * FROM cart JOIN products ON cart.productId = products.productId WHERE cart.sessionId = ?";
    let sqlParams = sessionId;
    return new Promise(function(resolve, reject) {
        pool.query(sql, sqlParams, function(err, rows) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

// Returns all rows within the product table
function getProducts() {
    let sql = "SELECT * FROM products ORDER BY name ASC";
    
    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, rows) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

// Returns all rows within the orders table
function getOrders() {
    var sql = 'SELECT category, SUM(DISTINCT orderId) as totalOrders, SUM(qty) as totalItems, SUM(price*qty) as totalRevenue FROM orders GROUP BY category WITH ROLLUP';
    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, rows) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

function getAllCategories() {
    let sql = "SELECT DISTINCT category FROM products";

    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, rows) {
            if (err) throw err;
            resolve(rows);
        });
    });
}

function getPriceRange() {
    let sql = "SELECT MIN(price) as min, MAX(price) as max FROM products";

    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, result) {
            if (err) throw err;
            resolve(result);
        });
    });
}

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

/** 
* Checks if user is authenticated
* if not authenticated, redirect to root
* if yes, keep going with the next line
* in the function that made the call
*/
function isAuthenticated(req, res, next){
  if(!req.session.authenticated){
    res.redirect("/");
  }
  else{
    next();
  }
}

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Express server is running...");
});