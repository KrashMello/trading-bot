import mysql from "mysql";
export const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
});

export function openConnection() {
    connection.connect();
}

export function closeConnection() {
    connection.end();
}

export function query(peticion = "SELECT 1 + 1 AS solution", callback) {
    connection.query(peticion, (error, results, fields) => {
        callback(results, error);
    });
}
export function insert_order(
    buyPrice = null,
    mountBuy = null,
    currency = null,
    callback
) {
    if (buyPrice !== null && mountBuy !== null && currency !== null) {
        connection.query(
            "CALL insert_order(" +
                buyPrice +
                "," +
                mountBuy +
                ",'" +
                currency +
                "')",
            (error, results, fields) => {
                callback(results, error);
            }
        );
    } else console.log("the arg1-3 can't be null");
}

export function update_order(sellPrice = null, callback) {
    if (sellPrice !== null) {
        connection.query(
            "CALL update_order(" + sellPrice + ")",
            (error, results, fields) => {
                callback(results, error);
            }
        );
    } else console.log("the arg1-3 can't be null");
}
