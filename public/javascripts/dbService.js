// dbService.js
const getDbInstance = require('@js/getDBInstance');
const sqlite3 = require('sqlite3').verbose();

/**
 * Fetch a single item from the specified database table by ID.
 * @param {string} tableName - The name of the database table.
 * @param {number|string} id - The ID of the item to fetch.
 * @returns {Promise<object|null>} - The fetched item or null if not found.
 */
async function getItemById(tableName, id) {
    if (!tableName || !id) {
        throw new Error("Table name and ID must be provided.");
    }

    const db = await getDbInstance(sqlite3); // Get the DB instance

    const query = `SELECT * FROM ${tableName} WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.get(query, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row || null); // Return the row or null if not found
        });
    });
}

module.exports = { getItemById };
