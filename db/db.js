// db.js
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('C:\\Users\\liveh\\OneDrive\\Faculdade\\Ultimo Ano\\Projeto Italo\\ES\\ES\\db\\database.db', sqlite3.OPEN_READWRITE,(err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectou ao banco de dados SQLite.');
    }
});

module.exports = db;
