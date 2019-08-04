const mysql = require("mysql");
const util = require("util");

const pool = mysql.createPool({
    connectionLimit: 7,
    host: "localhost",
    user: "root",
    password: "sesame",
    database: "scsi_logic"
});

pool.getConnection((error, connection) => {
    if (error) throw error;
    if (connection) connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;