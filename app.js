const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const pool = require("./database");

// Routes

// Root route
// app.get("/", async function(req, res) {
// Do stuff
// };)

/* Monty's API Routes */
// Note: req.params gets data passed in via the request body -- use with router params (preceded by ':')
//       req.query  gets data passed in via the request query string 
// Add new product to cart

/* PRODUCTS */
/************/

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


// Get product based off id
// Product id is passed through request body
app.get("/products/:productId", function(req, res) {
  var sql = "SELECT * FROM products WHERE productId = ?"
  var sqlParams = [req.params.productId];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
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
app.post("/products/add", function(req, res) {
  var sql = "INSERT INTO products(productId, name, category, description, price, imgURL) VALUES(?,?,?,?,?,?)";
  var sqlParams = [req.query.productId, req.query.name, req.query.category, req.query.description, req.query.price, req.query.imgURL];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});


/* CART */
/********/

// Add a product to cart
// Session id is passed through request body
// All other params passed through a query string
app.post("/cart/:sessionId/add", function(req, res) {
  var sql = "INSERT INTO cart(cartId, sessionId, productId, qty, price, category) VALUES(?,?,?,?,?,?)";
  var sqlParams = [, req.params.sessionId, req.query.productId, req.query.quantity, req.query.price, (req.query.quantity * req.query.price), req.query.category];
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
app.get("/cart/:sessionId/quantity", function(req, res) {
  var sql = "SELECT SUM(qty * price) FROM cart WHERE sessionId = ?";
  var sqlParams = [req.params.sessionId];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Retrieve total cost of products in cart
// Session id is passed through the request body
app.get("/cart/:sessionId/total", function(req, res) {
  var sql = "SELECT SUM(price) FROM cart WHERE sessionId = ?";
  var sqlParams = [req.params.sessionId];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

/* ORDERS */
/**********/
// Add new product to orders
// Session id is passed through the request body
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


/* SERVER LISTENER */
/*******************/
app.listen("8081", "127.0.0.1", function() {
  console.log("Express server is running...");
});

// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Running Express Server...");
// });