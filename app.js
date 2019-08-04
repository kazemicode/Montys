const express = require("express");
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUninitialized: true
 }));

app.use(express.urlencoded({extended: true})); // to be able to parse POST parameters

const pool = require("./database");

// Routes

// Root route
app.get("/", function(req, res){
    res.render("index");
 });
// app.get("/", async function(req, res) {
    // Do stuff
// });

app.post("/signin", async function(req, res){
    let username = req.body.username;
    let password = req.body.password;
    // console.log("username:" + username);
    // console.log("password:" + password);
    let result = await checkUsername(username);
    // console.dir(result);
    console.log(result[0].username);
    console.log(result[0].Password);
    let hashedPwd = "";
 
    if(result.length > 0 ){
       hashedPwd = result[0].Password;
    }
 
    let passwordMatch = await checkPassword(password, hashedPwd);
    console.log("passwordMatch: " + passwordMatch);
 
    if (username == result[0].username && passwordMatch){
       req.session.authenticated = true;
       res.render("welcome");
    } else {
       res.render("index", {"loginError": true});
    }
 });//post route

 /** 
 * Checks whether the username exists in database.
 * if found, returns corresponding record
 * @param {string} username
 * @return {array of objects}
 */
function checkUsername(username){
    let sql = "SELECT * FROM users WHERE username = ?";
    return new Promise( function(resolve, reject){
       let conn = createDBConnection();
       conn.connect(function(err) {
          if(err) throw err;
          conn.query(sql, [username], function(err, rows, fields) {
             if (err) throw err;
             console.log("Rows found: " + rows.length);
             resolve(rows);
          });//query
       });//connect 
    });//promise
 }
 
 app.get("/myAccount", isAuthenticated, function(req, res) {
    res.render("account");   
 });//myAccount
 
 function isAuthenticated(req, res, next) {
    if(!req.session.authenticated) {
       res.redirect('/');
    } else {
       next()
    }
 }
 app.get("/signin", function(req, res) {
    res.render("signin");
 });//logout

 app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
 });//logout
 
 function createDBConnection() {
    var conn = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "sesame",
                database: "scsi_logic"
    });
    return conn;
 }
 /**
  * Checks the bcrpt value of the password submitted
  * @param {string} password
  * @return {boolean} true if password submitted is equal to
  *                   bcrypt-hashed value, fasle otherwise.
  */
 function checkPassword(password, hashedValue){
    return new Promise(function(resolve, reject) {
       bcrypt.compare(password, hashedValue, function(err, result) {
          console.log("Result: " + result);
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