const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const pool = require("./database");

// Routes

// Root route
// app.get("/", async function(req, res) {
    // Do stuff
// });

// Server listener
app.listen("8081", "127.0.0.1", function() {
    console.log("Express server is running...");
});

// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Running Express Server...");
// });