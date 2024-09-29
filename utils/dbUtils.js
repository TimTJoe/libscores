const sqlite3 = require('sqlite3').verbose();

/**
 * Creates a database connection based on the environment.
 * @returns {sqlite3.Database} The SQLite database connection.
 */
function createDbConnection() {
    let db;

    if (process.env.NODE_ENV === 'development') {
        // Use local SQLite file in development
        db = new sqlite3.Database(process.env.DEV_DB_PATH, (err) => {
            if (err) {
                console.error('Error connecting to the local database:', err.message);
            } else {
                console.log('Connected to the local SQLite database.');
            }
        });
    } else if (process.env.NODE_ENV === 'production') {
        // Use the cloud SQLite URL in production
        db = new sqlite3.Database(process.env.PROD_DB_URL, (err) => {
            if (err) {
                console.error('Error connecting to the cloud database:', err.message);
            } else {
                console.log('Connected to the SQLite cloud database.');
            }
        });
    } else {
        console.error('NODE_ENV is not set or is unrecognized.');
    }

    return db;
}

/**
 * Executes a query that returns multiple rows.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Array>} A promise that resolves to the rows returned by the query.
 */
const dbQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Executes an insert or update query.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<number>} A promise that resolves to the last inserted ID.
 */
const dbRun = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

/**
 * Executes a query that returns all rows.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Array>} A promise that resolves to an array of rows returned by the query.
 */
const dbAll = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Executes a query that returns a single row.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Object>} A promise that resolves to the row returned by the query.
 */
const dbGet = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Export the utility functions
module.exports = {
    createDbConnection,
    dbQuery,
    dbRun,
    dbGet,
    dbAll
};
