const fs = require('fs');
var router = require('express').Router()
var sqlite3 = require("sqlite3").verbose();
var getDbInstance = require('@js/getDBInstance');
var db = getDbInstance(sqlite3)
const path = require('path');
// const countriesData = require('@public/data/westAfricanCountries.json');


router.get('/', function(req, res, next) {
    res.send("for creating data");
});

// Route handler
router.get('/countries', function (req, res) {
    // Check if the countries table already has data
    const checkQuery = 'SELECT COUNT(*) as count FROM countries';
    
    db.get(checkQuery, (err, row) => {
        if (err) {
            console.error('Error checking table:', err.message);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (row.count > 0) {
            // If the table has data, just return the existing countries data
            return getCountriesData(res);
        } else {
            // If the table is empty, populate it and then return the data
            populateCountriesTable(req, res);
        }
    });
});

// Function to get all countries data
function getCountriesData(res) {
    const getAllCountriesQuery = 'SELECT * FROM countries';

    db.all(getAllCountriesQuery, [], (err, rows) => {
        if (err) {
            console.error('Error fetching countries:', err.message);
            return res.status(500).json({ error: 'Error retrieving countries' });
        }
        // Return the countries data
        res.status(200).json(rows);
    });
}

// Function to populate the countries table and return data
function populateCountriesTable(req, res) {
    // Correctly reference the public folder and file path
    const filePath = './public/data/westAfricanCountries.json';

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err.message);
            return res.status(500).json({ error: 'Error reading countries file' });
        }

        const countries = JSON.parse(data);

        // Use a transaction to insert all data at once
        db.serialize(() => {
            const insertQuery = 'INSERT INTO countries (id, country, flag) VALUES (?, ?, ?)';

            db.run('BEGIN TRANSACTION');
            countries.forEach(country => {
                const { country: countryName, flag } = country;
                db.run(insertQuery, [null, countryName, flag], function (err) {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                    }
                });
            });
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err.message);
                    return res.status(500).json({ error: 'Error saving countries' });
                }

                // After successful insertion, return the data
                getCountriesData(res);
            });
        });
    });
}


module.exports = router;

