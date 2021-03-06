const mysql = require("mysql");
const util = require("util");

const pool = mysql.createPool({
    connectionLimit: 7,
    host: "us-cdbr-iron-east-02.cleardb.net",
    user: "b8020a09ed1481",
    password: "7a2ede28",
    database: "heroku_c64927c31179572"
});

// const pool = mysql.createPool({
//     connectionLimit: 7,
//     host: "127.0.0.1",
//     user: "root",
//     password: "sesame",
//     database: "cst336_final_project"
// });

pool.getConnection((error, connection) => {
    if (error) throw error;
    if (connection) connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;