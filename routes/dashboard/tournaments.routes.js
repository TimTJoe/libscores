// Existing code...

var router = require('express').Router();
const upload = require('@middleware/upload');
const { dbQuery, dbRun, dbGet, dbAll, useTournamentDB } = require('@utils/dbUtils');
const axios = require('axios');

/* GET home page. */
router.get('/', async function(req, res, next) {
    let options = { title: 'Tournaments Dashboard', league: "tournaments" }
    try {
        res.render('dashboard/tournaments.dash.ejs', options);
    } catch (err) {
        options.err = err
        res.render('dashboard/tournaments.dash.ejs', options);
    }
});

// Existing team creation route...
router.post('/teams', upload.single('badge'), async (req, res) => {
    const { name, group, tournamentId } = req.body;
    const badge = req.file ? req.file.filename : null;
    console.log('badge', badge)

    if (!name || !group || !tournamentId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const db = await useTournamentDB();

        const teamQuery = `INSERT INTO teams VALUES (?,?,?)`;
        const teamValues = [null, name, badge];
        const teamLastID = await dbRun(db, teamQuery, teamValues);

        let groupQuery = `INSERT INTO groups VALUES (?,?,?,?)`;
        const groupValues = [null, tournamentId, teamLastID, group];
        const groupLastID = await dbRun(db, groupQuery, groupValues);

        let groupsQuery = `
        SELECT groups.id AS group_id, groups.name as group_name, tournaments.*, tournaments.id AS tournament_id, tournaments.name as tournament_name, tournaments.badge as tournament_badge, teams.*, teams.id AS team_id, teams.name AS team_name, teams.badge AS team_badge 
        FROM groups 
        JOIN tournaments ON groups.tournament_id = tournaments.id 
        JOIN teams ON groups.team_id = teams.id 
        WHERE groups.id = ?
        `;
        // Fetch the newly inserted league to send back to the frontend
        const groups = await dbAll(db, groupsQuery, [groupLastID]);

        // Send the newly created league back as a response
        res.status(201).json({ groups });
    } catch (err) {
        console.error('Error saving team:', err);
        res.status(500).json({ message: 'An error occurred while saving the team.' });
    }
});

// Existing tournament creation route...
router.post('/', upload.single('badge'), async (req, res) => {
    const { name, host, start, end } = req.body;
    const badge = req.file ? req.file.filename : null;

    if (!name || !host || !start || !end) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const db = await useTournamentDB();
        const sql = `INSERT INTO tournaments VALUES (?,?,?, ?, ?, ?, ?, ?,?)`;
        const values = [null, name, badge, host, start, end, null, null, null];

        const lastID = await dbRun(db, sql, values);

        // Fetch the newly inserted league to send back to the frontend
        const newTournament = await dbQuery(db, `SELECT * FROM tournaments WHERE id = ?`, [lastID]);

        // Send the newly created league back as a response
        res.status(201).json({ tournament: newTournament });
    } catch (err) {
        console.error('Error saving tournament:', err);
        res.status(500).json({ message: 'An error occurred while saving the tournament.' });
    }
});

// Existing route to get tournament details...
router.get('/teams/:id', async (req, res) => {
    // Use the base URL from the environment variables, fallback to localhost if undefined
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    let { id } = req.params;
    let options = { title: 'Tournaments Dashboard', league: "tournaments", msg: '' };

    try {
        // Make a dynamic request to the API using the base URL from the environment
        const response = await axios.get(`${baseURL}/v1/api/tournaments/${id}`);

        // Destructure the tournament and groupedTeams from the API response
        const { tournament, groupedTeams } = response.data;

        if (!tournament) {
            options.msg = 'No tournament found.';
            return res.render('dashboard/tournaments.team.ejs', options);
        }

        // Pass the tournament and groupedTeams to the options for rendering
        options.tournament = tournament;
        options.groups = groupedTeams;

        // Render the EJS view with the fetched data
        res.render('dashboard/tournaments.team.ejs', options);

    } catch (error) {
        console.error(error);
        options.msg = 'Error fetching tournament data.';
        res.render('dashboard/tournaments.team.ejs', options);
    }
});

// Existing route to get tournament details...
router.get('/:id', async (req, res) => {
    // Use the base URL from the environment variables, fallback to localhost if undefined
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    let { id } = req.params;
    let options = { title: 'Tournaments Dashboard', league: "tournaments", msg: '' };

    try {
        // Make a dynamic request to the API using the base URL from the environment
        const response = await axios.get(`${baseURL}/v1/api/tournaments/${id}`);

        // Destructure the tournament and groupedTeams from the API response
        const { tournament, groupedTeams } = response.data;

        if (!tournament) {
            options.msg = 'No tournament found.';
            return res.render('dashboard/tournaments.info.ejs', options);
        }

        // Pass the tournament and groupedTeams to the options for rendering
        options.tournament = tournament;
        options.groups = groupedTeams;

        // Render the EJS view with the fetched data
        res.render('dashboard/tournaments.info.ejs', options);

    } catch (error) {
        console.error(error);
        options.msg = 'Error fetching tournament data.';
        res.render('dashboard/tournaments.info.ejs', options);
    }
});

// AJAX route to fetch groups, teams, and matches for a tournament
router.get('/ajax/:id(groups|teams|matches)', async (req, res) => {
    const { id } = req.params; // Extract the tournament ID
    const type = req.params[0]; // This will be either 'groups', 'teams', or 'matches'

    try {
        let data;

        // Determine which function to call based on the type
        if (type === 'groups') {
            data = await getGroupsData(id);
        } else if (type === 'teams') {
            data = await getTeamsData(id);
        } else if (type === 'matches') {
            data = await getMatchesData(id);
        } else {
            return res.status(400).send('Invalid type requested.');
        }

        // Render the appropriate EJS file based on the type
        if (type === 'groups') {
            res.render('dashboard/groups.dash.ejs', { groups: data });
        } else if (type === 'teams') {
            res.render('dashboard/teams.dash.ejs', { teams: data });
        } else if (type === 'matches') {
            res.render('dashboard/matches.dash.ejs', { matches: data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading data.');
    }
});

// Export the router
module.exports = router;
