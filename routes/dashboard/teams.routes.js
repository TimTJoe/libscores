var router = require('express').Router();
const { dbQuery, useTournamentDB } = require('@utils/dbUtils');



// Route to get games for a team
router.get('/:id/tab/games', async function(req, res, next) {
    const teamId = req.params.id; // Extract the team ID
    const db = useTournamentDB(); // Get the database instance

    try {
        // Query for games related to the team
        const gamesQuery = `
            SELECT * FROM games 
            WHERE home_team_id = ? OR away_team_id = ?`;
        const games = await dbQuery(db, gamesQuery, [teamId, teamId]);

        // Render the games EJS
        res.render('dashboard/teams.games.ejs', { games }); // Pass games data to the template
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).send("Error loading games");
    }
});

// Route to get squad for a team
router.get('/:id/tab/squad', async function(req, res, next) {
    const teamId = req.params.id; // Extract the team ID
    const db = useTournamentDB(); // Get the database instance

    try {
        // Query for players related to the team
        const playersQuery = `
            SELECT * FROM players 
            WHERE team_id = ?`;
        const players = await dbQuery(db, playersQuery, [teamId]);

        // Render the squad EJS
        res.render('dashboard/teams.squad.ejs', { players }); // Pass players data to the template
    } catch (err) {
        console.error("Error fetching squad:", err);
        res.status(500).send("Error loading squad");
    }
});

// Route to get group information for a team
router.get('/:id/tab/group', async function(req, res, next) {
    const teamId = req.params.id; // Extract the team ID
    const db = useTournamentDB(); // Get the database instance

    try {
        // Query for groups related to the team
        const groupsQuery = `
            SELECT * FROM groups 
            WHERE team_id = ?`;
        const groups = await dbQuery(db, groupsQuery, [teamId]);

        // Render the groups EJS
        res.render('dashboard/teams.group.ejs', { groups }); // Pass groups data to the template
    } catch (err) {
        console.error("Error fetching groups:", err);
        res.status(500).send("Error loading groups");
    }
});


/* GET team, players, and groups based on team ID. */
router.get('/:id', async function(req, res, next) {
    let options = { title: 'Teams Dashboard', league: "Teams" };
    const teamId = req.params.id; // Extract the team ID
    const db = useTournamentDB(); // Get the database instance

    try {
        // Query to get the specific team by its ID
        const teamQuery = `
            SELECT * FROM teams 
            WHERE id = ?`;
        const team = await dbQuery(db, teamQuery, [teamId]);

        // Check if the team exists
        if (team.length === 0) {
            return res.status(404).send("Team not found");
        }

        // Prepare to gather players for the specific team
        const playersQuery = `
            SELECT * FROM players 
            WHERE team_id = ?`;
        const players = await dbQuery(db, playersQuery, [teamId]);

        // Query to get groups for the specific team
        const groupsQuery = `
            SELECT * FROM groups 
            WHERE team_id = ?`;
        const groups = await dbQuery(db, groupsQuery, [teamId]);

        // Pass the data to the template
        options.team = team[0]; // Pass the first team since the query returns an array
        options.players = players;
        options.groups = groups;

        res.render('dashboard/teams.info.ejs', options);
    } catch (err) {
        console.error("Error fetching data:", err);
        options.err = err;
        res.render('dashboard/teams.info.ejs', options);
    }
});

module.exports = router;


