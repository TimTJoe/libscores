const { useLeaguesDB, useTournamentDB , dbQuery } = require('@utils/dbUtils');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
       const db = useLeaguesDB()
       try {
       db.all("SELECT * FROM counties", function (err, rows) {
              if(err) {
                     throw new Error(err);
              } else {
                     res.status(200).json({counties: rows})
              }
              });
       } catch (error) {
              res.status(400).json(error)
       }
});


router.get('/suggest', async (req, res) => {
       const { q } = req.query; // Get the query parameter
   
       if (!q || q.trim() === '') {
           return res.status(400).json({ message: 'Query parameter is required.' });
       }
   
       try {
           const query = `SELECT id, name FROM counties WHERE name LIKE ? LIMIT 15`; // Adjust the query as necessary
           const params = [`%${q}%`]; // Use parameterized query to prevent SQL injection
   
           let db = await useTournamentDB();
   
           // Execute the database query
           const teams = await dbQuery(db, query, params); // Assuming dbQuery is defined in your dbUtils
   
           // Return the suggestions as JSON
           return res.status(200).json(teams);
       } catch (err) {
           console.error('Error fetching team suggestions:', err);
           return res.status(500).json({ message: 'An error occurred while fetching team suggestions.' });
       }
   });

module.exports = router;

