const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection

// Route to handle search requests
router.get('/search', (req, res) => {
    const searchTerm = req.query.q;

    // Queries for players, clubs, games, and competitions
    const playerQuery = `SELECT name, club, position, age FROM players WHERE name LIKE ?`;
    const clubQuery = `SELECT name, country, founded FROM clubs WHERE name LIKE ?`;
    const gameQuery = `SELECT home_team, away_team, date, score FROM games WHERE home_team LIKE ? OR away_team LIKE ?`;
    const competitionQuery = `SELECT name, country, season FROM competitions WHERE name LIKE ?`;

    const searchParam = `%${searchTerm}%`; // SQL wildcard search

    // Results object to store all data
    let results = {
        players: [],
        clubs: [],
        games: [],
        competitions: []
    };

    // Query players
    db.all(playerQuery, [searchParam], (err, rows) => {
        if (err) {
            console.error('Error querying players:', err);
        } else {
            results.players = rows;
        }

        // Query clubs
        db.all(clubQuery, [searchParam], (err, rows) => {
            if (err) {
                console.error('Error querying clubs:', err);
            } else {
                results.clubs = rows;
            }

            // Query games
            db.all(gameQuery, [searchParam, searchParam], (err, rows) => {
                if (err) {
                    console.error('Error querying games:', err);
                } else {
                    results.games = rows;
                }

                // Query competitions
                db.all(competitionQuery, [searchParam], (err, rows) => {
                    if (err) {
                        console.error('Error querying competitions:', err);
                    } else {
                        results.competitions = rows;
                    }

                    // Render the search results page
                    res.render('search', {
                        searchTerm,
                        players: results.players,
                        clubs: results.clubs,
                        games: results.games,
                        competitions: results.competitions
                    });
                });
            });
        });
    });
});

module.exports = router;
