const { dbQuery, dbRun, dbGet, createDbConnection } = require('@utils/dbUtils');
var router = require('express').Router()
var sqlite3 = require("sqlite3").verbose();
var getDbInstance = require('@js/getDBInstance');
var db = getDbInstance(sqlite3)

router.get('/', async function(req, res, next) {
    try {
        db.all("SELECT * FROM clubs", function (err, rows) {
            if(err) {
                    throw new Error(err);
            } else {
                    res.json({clubs: rows})
            }
            });
        } catch (error) {
            res.json({error, msg: "No club found."})
        }
});


router.get('/suggest', async (req, res) => {
    const { q } = req.query; // Get the query parameter

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'Query parameter is required.' });
    }

    try {
        const query = `SELECT id, club FROM clubs WHERE club LIKE ? LIMIT 10`; // Adjust the query as necessary
        const params = [`%${q}%`]; // Use parameterized query to prevent SQL injection

        let db = await createDbConnection()

        // Execute the database query
        const teams = await dbQuery(db, query, params); // Assuming dbQuery is defined in your dbUtils

        // Return the suggestions as JSON
        return res.status(200).json(teams);
    } catch (err) {
        console.error('Error fetching team suggestions:', err);
        return res.status(500).json({ message: 'An error occurred while fetching team suggestions.' });
    }
});

router.get('/:id', async function(req, res, next) {
    let {id} = req.params
    try {
    db.all("SELECT * FROM clubs WHERE id=?",[id], function (err, rows) {
           if(err || rows.length == 0) {
                  throw new Error(err);
           } else {
                  res.status(200).json({club: rows, msg: false})
           }
           });
    } catch (error) {
           res.status(400).json({error, msg: "Club doesn't exist"})
    }
});





module.exports = router;
