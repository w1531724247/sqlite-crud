/**
 * Establishing connection to the database
 *
 * @source http://blog.modulus.io/nodejs-and-sqlite
 */

const debug = require('debug')('sqlite-crud:index');
const dbInstance = require('./source/db-instance');
const migrate = require('./source/migrate');
const insertRow = require('./source/insertRow');
const getRows = require('./source/getRows');
const run = require('./source/run');


/**
 * Update table row
 * @param tableName {String}
 * @param data {object}
 * @param where {Array}
 *  [
 *      {
 *          column: '',
 *          comparator: '',
 *          value: ''
 *      },
 *      ...
 *  ]
 * @returns {Promise}
 */
const updateRow = (tableName, data, where) => new Promise((resolve, reject) => {
    const DB = dbInstance.getDB();
    let query = `UPDATE ${tableName} SET `;
    const columns = [];
    const columnValues = [];
    if (!tableName) {
        throw new Error('`tableName` is not provided');
    }
    if (!data) {
        throw new Error('`data` object is not provided');
    }
    if (!where) {
        throw new Error('`where` is not provided');
    } else if (!where.hasOwnProperty('length')) {
        throw new Error('`where` should be an array');
    } else if (where.length === 0) {
        throw new Error('There is no data in `where` object');
    }

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            columns.push(key);
            columnValues.push(data[key]);
        }
    }
    if (columns.length === 0) {
        throw new Error('There is no columns in `data` object');
    }
    columns.forEach((column, i) => {
        query += `${column} = ?`;
        if (i < columns.length - 1) {
            query += ', ';
        }
    });

    query += ' WHERE ';

    where.forEach((whereItem, i) => {
        query += `${whereItem.column} ${whereItem.comparator} ?`;
        if (i < where.length - 1) {
            query += ' AND ';
        }
        columnValues.push(whereItem.value);
    });

    // console.log(chalk.blue('Query:'), query);
    // console.log('columnValues', columnValues);

    DB.run(query, columnValues, (err) => {
        if (err) {
            debug(err);
            reject(err);
        } else {
            resolve();
        }
    });
});

/**
 * Return first result row
 * @param query {String}
 * @returns {Promise}
 */
const queryOneRow = query => new Promise((resolve, reject) => {
    const DB = dbInstance.getDB();

    DB.get(query, (err, row) => {
        if (err) {
            debug(err);
            debug(`Query was: ${query}`);
            reject(err);
        } else {
            resolve(row);
        }
    });
});

/**
 * Return all rows that fit to the given query
 * @param query {String}
 * @param parameters {Array} array of parameters to the query (optional)
 * @returns {Promise}
 */
const queryRows = (query, parameters = null) => new Promise((resolve, reject) => {
    const DB = dbInstance.getDB();
    const callback = (err, rows) => {
        if (err) {
            debug(err);
            debug(`Query was: ${query}`);
            reject(err);
        } else {
            resolve(rows);
        }
    };

    if (parameters && Array.isArray(parameters)) {
        DB.all(query, parameters, callback);
    } else {
        DB.all(query, callback);
    }
});

/**
 * Delete rows from table
 * @param tableName {String}
 * @param where {Array}
 *  [
 *      {
 *          column: '',
 *          comparator: '',
 *          value: ''
 *      },
 *      ...
 *  ]
 * @returns {Promise}
 */
const deleteRows = (tableName, where) => new Promise((resolve, reject) => {
    const DB = dbInstance.getDB();
    let query = `DELETE FROM ${tableName}`;
    const columnValues = [];
    if (!tableName) {
        throw new Error('`tableName` is not provided');
    }
    if (!where) {
        throw new Error('`where` is not provided');
    } else if (!where.hasOwnProperty('length')) {
        throw new Error('`where` should be an array');
    } else if (where.length === 0) {
        throw new Error('There is no data in `where` object');
    }

    query += ' WHERE ';

    where.forEach((whereItem, i) => {
        query += `${whereItem.column} ${whereItem.comparator} ?`;
        if (i < where.length - 1) {
            query += ' AND ';
        }
        columnValues.push(whereItem.value);
    });

    DB.serialize(() => {
        DB.run('PRAGMA foreign_keys = ON;');
        DB.run(query, columnValues, (err) => {
            if (err) {
                debug(err);
                debug(`Query was: ${query}`);
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

const connectToDB = (dbPath) => {
    dbInstance.connectToDB(dbPath);
};

module.exports = {
    getDB: dbInstance.getDB,
    connectToDB,
    insertRow,
    updateRow,
    getRows,
    deleteRows,
    queryOneRow,
    queryRows,
    run,
    migrate
};
