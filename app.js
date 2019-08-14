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
    res.render("index", {title: "Home", json});
});

app.get("/products", async function(req, res) {
    res.render("products", {title: "Products", json});
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
  
  // Get three random products
  // No params needed
app.get("/products/random", function(req, res) {
    var sql = "SELECT * FROM products ORDER BY Rand() LIMIT 3"
    pool.query(sql, function(err, result) {
        if (err) throw err;
    });
});
  
// Add new product to the table
// All params are passed through a form POST
// Note: Product ID gets autoincremented, so is not passed in
app.post("/products/add", function(req, res) {
    var sql = "INSERT INTO products(name, category, description, price, imgURL) VALUES(?,?,?,?,?,?)";
    var sqlParams = [req.body.name, req.body.category, req.body.description, req.body.price, req.body.imgURL];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
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
    });
});

  // Remove product from to cart
  // Session id and product id are passed through the request body
app.delete("/cart/:sessionId/productId/remove", function(req, res) {
    var sql = "DELETE FROM cart WHERE sessionId = ? AND productId = ?";
    var sqlParams = [req.params.sessionId, req.params.productId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
});
  
  // Empty cart
  // Session id is passed through the request body
app.delete("/cart/:sessionId/empty", function(req, res) {
    var sql = "DELETE FROM cart WHERE sessionId = ?";
    var sqlParams = [req.params.sessionId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
});
  
  // Retrieve total quantity of products in cart
  // Session id is passed through the request body
// app.get("/cart/:sessionId/quantity", function(req, res) {
//     var sql = "SELECT SUM(qty * price) FROM cart WHERE sessionId = ?";
//     var sqlParams = [req.params.sessionId];
//     pool.query(sql, sqlParams, function(err, result) {
//         if (err) throw err;
//     });
// });
  
  // Retrieve total cost of products in cart
  // Session id is passed through the request body
// app.get("/cart/:sessionId/total", function(req, res) {
//     var sql = "SELECT SUM(price) FROM cart WHERE sessionId = ?";
//     var sqlParams = [req.params.sessionId];
//     pool.query(sql, sqlParams, function(err, result) {
//         if (err) throw err;
//     });
// });

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

app.get("/addProduct", function(req,res){

    res.render("addProduct", {title: "Admin"});
});

app.get("/removeProduct", async function(req,res){
    let products = await getProducts();    
    
    res.render("removeProduct", {title: "Admin", data: products});
});

app.get("/updateProduct", async function(req,res){
    let products = await getProducts();    
    
    res.render("updateProduct", {title: "Admin", data: products});
});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

/* ORDERS */
/**********/
// Add new product to orders
// Session id is passed through the request body
// Note: cart ID becomes order ID
app.post("/orders/:sessionId/add", function(req, res) {
    var sql = "INSERT INTO orders(orderId, sessionId, productId, qty, price) VALUES(SELECT * FROM cart WHERE sessionId = ?)";
    var sqlParams = [req.params.sessionId];
    pool.query(sql, sqlParams, function(err, result) {
        if (err) throw err;
    });
});
  
  // Returns a report of total number of orders, total quantity of items, and total revenue -- grouped by product category
app.post("/orders/report", function(req, res){
    var sql = 'SELECT SUM(DISTINCT orderId) as totalOrders, SUM(qty) as totalItems, SUM(price*qty) as totalRevenue FROM orders GROUP BY ROLLUP(category)';
    pool.query(sql, function(err, result) {
        if (err) throw err;
    });
});

// Functions

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
    let sql = "SELECT * FROM products";
    
    return new Promise(function(resolve, reject) {
        pool.query(sql, function(err, rows) {
            if (err) throw err;
            console.log(rows);
            resolve(rows);
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

// Server listener
app.listen("8081", "127.0.0.1", function() {
    console.log("Express server is running...");
});

// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Running Express Server...");
// });