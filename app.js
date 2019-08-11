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
app.get("/products/:productid", function(req, res) {
  var sql = "SELECT * FROM products WHERE productid = ?"
  var sqlParams = [req.params.productid];
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
  var sql = "INSERT INTO products(productid, category, name, desciprtion, price, imgURL, imgDescription) VALUES(?,?,?,?,?,?,?)";
  var sqlParams = [req.query.productid, req.query.category, req.query.name, req.query.description, req.query.price, req.query.imgURL, req.query.imgDescription];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});


/* CART */
/********/

// Add a product to cart
// Session id is passed through request body
// All other params passed through a query string
app.post("/cart/:sessionid/add", function(req, res) {
  var sql = "INSERT INTO cart(sessionid, productid, quantity, unitprice, totalprice) VALUES(?,?,?,?,?)";
  var sqlParams = [req.params.sessionid, req.query.productid, req.query.quantity, req.query.price, (req.query.quantity * req.query.price)];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Remove product from to cart
// Session id and product id are passed through the request body
app.delete("/cart/:sessionid/productid/remove", function(req, res) {
  var sql = "DELETE FROM cart WHERE sessionid = ? AND productid = ?";
  var sqlParams = [req.params.sessionid, req.params.productid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Empty cart
// Session id is passed through the request body
app.delete("/cart/:sessionid/empty", function(req, res) {
  var sql = "DELETE FROM cart WHERE sessionid = ?";
  var sqlParams = [req.params.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Retrieve total quantity of products in cart
// Session id is passed through the request body
app.get("/cart/:sessionid/quantity", function(req, res) {
  var sql = "SELECT SUM(quantity) FROM cart WHERE sessionid = ?";
  var sqlParams = [req.params.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Retrieve total cost of products in cart
// Session id is passed through the request body
app.get("/cart/:sessionid/total", function(req, res) {
  var sql = "SELECT SUM(totalprice) FROM cart WHERE sessionid = ?";
  var sqlParams = [req.params.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

/* ORDERS */
/**********/
// Add new product to orders
// Session id is passed through the request body
app.post("/orders/:sessionid/add", function(req, res) {
  var sql = "INSERT INTO orders(sessionid, productid, quantity, unitprice, totalprice) VALUES(SELECT * FROM cart WHERE sessionid = ?)";
  var sqlParams = [req.params.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
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