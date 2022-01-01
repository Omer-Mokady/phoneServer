const mysql = require('mysql2');
const pool = mysql.createPool( {
    connectionLimit: 10,
    password: 'Pass24%OM$6',
    user: 'root',
    database: 'phones',
    host: '127.0.0.1',
    port: '3307'
});
let phoneDB = {};

phoneDB.getAllPhones = () => {
    return new Promise((resolve,reject) => {
        pool.query(`SELECT * FROM phoneinfo`, (err,results) => {
            if(err) {
                reject(err);
            }
            resolve(results);
        });
    });
};

phoneDB.getBySerial = (serial) => {
    return new Promise((resolve,reject) => {
        pool.query(`SELECT * FROM phoneinfo WHERE serial=?`,[serial], (err,results) => {
            if(err) {
                reject(err);
            }
            resolve(results);
        });
    });
};

phoneDB.deletePhone = (serial) => {
    return new Promise((resolve,reject) => {
        pool.query(`DELETE FROM phoneinfo WHERE serial=?`,[serial], (err,results) => {
            if(err) {
                reject(err);
            }
            resolve();
        });
    });
};

phoneDB.createPhone = (reqBody) => {
    return new Promise((resolve,reject) => {
        var parameters = [[reqBody.serial, reqBody.type, reqBody.color, reqBody.metadata]];
        pool.query(`INSERT INTO phoneinfo (serial, type, color, metadata) VALUES ?`, [parameters] ,(err,results) => {
            if(err) {
                reject(err);
            }
            resolve();
        });
    });
};

phoneDB.updatePhone = (reqBody, serial) => {
    return new Promise((resolve,reject) => {
        var parameters = [reqBody, serial];
        pool.query('UPDATE phoneinfo SET ? WHERE serial=?', parameters ,(err,results) => {
            if(err) {
                reject(err);
            }
            resolve(results);
        });
    });
};

module.exports = phoneDB;