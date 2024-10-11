var express = require('express');
var router = express.Router();
var db = require('../db'); // Your database connection

// Route to handle team details by club name
router.get('/team/:clubName', function(req, res, next) {
    const clubName = req.params.clubName;  // Capture the club name from the URL

    let results = {
        team: {},
        squad: [],
        games: [] // Store games from the 'games' table
    };

    // Function to execute queries
    const executeQueries = async () => {
        try {
            // Query for the team details
            results.team = await new Promise((resolve, reject) => {
                db.get(`SELECT club, country_id, founded, badge FROM clubs WHERE club = ?`, [clubName], (err, row) => {
                    if (err) {
                        console.error('Error querying team:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            // Query for the squad (players in the team)
            results.squad = await new Promise((resolve, reject) => {
                db.all(`SELECT fullname, position FROM players WHERE club = ?`, [clubName], (err, rows) => {
                    if (err) {
                        console.error('Error querying squad:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            // Query for the games from the 'games' table where the team plays as either home or away
            results.games = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT home, away, start, status, date, home_goal, away_goal, score 
                    FROM games 
                    WHERE home = ? OR away = ? 
                    ORDER BY date DESC`, // Order by date in descending order
                    [clubName, clubName], 
                    (err, rows) => {
                        if (err) {
                            console.error('Error querying games from games table:', err);
                            reject(err);
                        } else if (!rows || rows.length === 0) {
                            console.log('No games found for this team.');
                            resolve([]);
                        } else {
                            console.log('games found:', rows);
                            resolve(rows);
                        }
                    });
            });

            // Render the team page with team details, squad, and games
            res.render('team', {
                title: `${results.team.club} - Team Details`,
                team: results.team,
                squad: results.squad,
                games: results.games // Pass the games from 'games' table to the template
            });
        } catch (err) {
            console.error('Error occurred while fetching team details:', err);
            res.status(500).send("An error occurred while fetching team details.");
        }
    };

    // Execute the queries
    executeQueries();
});

module.exports = router;
