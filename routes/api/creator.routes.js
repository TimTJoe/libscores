const fs = require('fs');
var router = require('express').Router()
const { useLeaguesDB, useTournamentDB } = require('@utils/dbUtils');

// const countriesData = require('@public/data/westAfricanCountries.json');


router.get('/', function(req, res) {
    res.send("for creating data");
});

// Route handler
router.get('/countries', function (req, res) {
    // Check if the countries table already has data
    const checkQuery = 'SELECT COUNT(*) as count FROM countries';
    let db = useLeaguesDB()
    
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


// Route to handle root
router.get('/', function(req, res) {
    res.send("for creating counties data");
});

// Route to handle /creators/counties
router.get('/counties', function (req, res) {
    // Check if the counties table already has data
    const checkQuery = 'SELECT COUNT(*) as count FROM counties';

    let db = useTournamentDB()

    
    db.get(checkQuery, (err, row) => {
        if (err) {
            console.error('Error checking table:', err.message);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (row.count > 0) {
            // If the table has data, return the existing counties data
            return getCountiesData(res);
        } else {
            // If the table is empty, populate it and then return the data
            populateCountiesTable(req, res);
        }
    });
});

// Function to get all counties data
function getCountiesData(res) {
    const getAllCountiesQuery = 'SELECT * FROM counties';
    let db = useTournamentDB()

    db.all(getAllCountiesQuery, [], (err, rows) => {
        if (err) {
            console.error('Error fetching counties:', err.message);
            return res.status(500).json({ error: 'Error retrieving counties' });
        }
        // Return the counties data
        res.status(200).json(rows);
    });
}

// Function to populate the counties table and return data
function populateCountiesTable(req, res) {
    // Correctly reference the public folder and file path
    const filePath = './public/data/counties.json';
    let db = useTournamentDB()


    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err.message);
            return res.status(500).json({ error: 'Error reading counties file' });
        }

        const counties = JSON.parse(data).counties;

        // Use a transaction to insert all data at once
        db.serialize(() => {
            const insertQuery = 'INSERT INTO counties (id, name, flag) VALUES (?, ?, ?)';

            db.run('BEGIN TRANSACTION');
            counties.forEach(county => {
                const { name, flag } = county;
                db.run(insertQuery, [null, name, flag], function (err) {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                    }
                });
            });
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err.message);
                    return res.status(500).json({ error: 'Error saving counties' });
                }

                // After successful insertion, return the data
                getCountiesData(res);
            });
        });
    });
}


// Function to get all countries data
function getCountriesData(res) {
    const getAllCountriesQuery = 'SELECT * FROM countries';
    let db = useLeaguesDB()

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
    let db = useLeaguesDB()

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

