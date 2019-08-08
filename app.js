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

/* PRODUCTS */
/************/
// Get product based off id
app.get("/products/", function(req, res) {
  var sql = "SELECT * FROM products WHERE productid = ?"
  var sqlParams = [req.query.productid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});


// Get three random products
app.get("/products/random", function(req, res) {

  var sql = "SELECT * FROM products ORDER BY Rand() LIMIT 3"
  pool.query(sql, function(err, result) {
    if (err) throw err;
  });
});

// Add new product to the table
app.post("/products/add", function(req, res) {
  var sql = "INSERT INTO products(productid, category, name, desciprtion, price, imgURL, imgDescription) VALUES(?,?,?,?,?,?,?)";
  var sqlParams = [req.query.productid, req.query.category, req.query.name, req.query.description, req.query.price, req.query.imgURL, req.query.imgDescription];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});


/* CART */
/********/
// Add new product to cart
app.post("/cart/add", function(req, res) {
  var sql = "INSERT INTO cart(sessionid, productid, quantity, unitprice, totalprice) VALUES(?,?,?,?,?)";
  var sqlParams = [req.query.sessionid, req.query.productid, req.query.quantity, req.query.price, (req.query.quantity * req.query.price)];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Remove product from to cart
app.delete("/cart/remove", function(req, res) {
  var sql = "DELETE FROM cart WHERE sessionid = ? AND productid = ?";
  var sqlParams = [req.query.sessionid, req.query.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Empty cart
app.delete("/cart/empty", function(req, res) {
  var sql = "DELETE FROM cart WHERE sessionid = ?";
  var sqlParams = [req.query.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Retrieve total quantity of products in cart
app.get("/cart/quantity", function(req, res) {
  var sql = "SELECT SUM(quantity) FROM cart WHERE sessionid = ?";
  var sqlParams = [req.query.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

// Retrieve total cost of products in cart
app.get("/cart/total", function(req, res) {
  var sql = "SELECT SUM(totalprice) FROM cart WHERE sessionid = ?";
  var sqlParams = [req.query.sessionid];
  pool.query(sql, sqlParams, function(err, result) {
    if (err) throw err;
  });
});

/* ORDERS */
/**********/
// Add new product to orders
app.post("/orders/add", function(req, res) {
  var sql = "INSERT INTO orders(sessionid, productid, quantity, unitprice, totalprice) VALUES(SELECT * FROM cart WHERE sessionid = ?)";
  var sqlParams = [req.query.sessionid];
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