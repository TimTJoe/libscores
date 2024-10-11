const { getItemById } = require('@js/dbService');
const router = require('express').Router();
const sqlite3 = require('sqlite3').verbose();
const upload = require('@middleware/upload');
const { dbQuery, dbRun, dbGet,dbAll, useLeaguesDB  } = require('@utils/dbUtils');


// PUT, DELETE, and other specific methods related to competitions can go here.

// GET route to create a new game for a specific competition (most specific route)
router.get('/:id/games/new', async (req, res) => {
    const competitionId = req.params.id;

    try {
        const db = await useLeaguesDB();
        const competition = await dbQuery(db, 'SELECT * FROM competitions WHERE id = ?', [competitionId]);

        if (!competition.length) {
            return res.status(404).render('dashboard/games.form.ejs', {
                title: 'Create New Game',
                message: 'Competition not found',
                competition: null,
            });
        }

        res.render('dashboard/games.form.ejs', {
            title: 'Create New Game',
            competition: competition[0],
        });
    } catch (err) {
        console.error('Error fetching competition:', err);
        res.status(500).render('dashboard/games.form.ejs', {
            title: 'Create New Game',
            message: 'An error occurred while fetching competition data. Please try again later.',
            competition: null,
        });
    }
});

// GET route to fetch competition details by ID (less specific route)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.redirect('/competitions');
    }

    try {
        const competition = await getItemById('competitions', id);
        const db = await useLeaguesDB();
        const seasons = await dbQuery(db, 'SELECT * FROM seasons ORDER BY id DESC');

        if (!competition) {
            return res.render('dashboard/competition.info.ejs', {
                title: "Competition Doesn't Exist",
                error: null,
                msg: "Competition doesn't exist.",
                competition: null,
                seasons
            });
        }

        res.render('dashboard/competition.info.ejs', {
            title: competition.competition,
            competition,
            seasons
        });
    } catch (err) {
        console.error('Error fetching competition:', err);
        res.status(500).render('dashboard/competition.info.ejs', {
            title: "Error Fetching Competition",
            error: err,
            msg: "An error occurred while fetching the competition. Please try again later.",
            competition: null,
            seasons
        });
    }
});

// GET route to display all competitions (generic route)
router.get('/', async (req, res) => {
    try {
        const db = await useLeaguesDB();
        const query = 'SELECT * FROM competitions ORDER BY id DESC';
        const leagues = await dbQuery(db, query);

        if (!leagues.length) {
            return res.render('dashboard/competition.dash.ejs', {
                title: 'Leagues and Competitions',
                leagues: [],
                message: 'No leagues or competitions found.',
                competition: null
            });
        }

        res.render('dashboard/competition.dash.ejs', {
            title: 'Leagues and Competitions',
            leagues,
            competition: null
        });
    } catch (err) {
        console.error('Error fetching leagues:', err);
        res.status(500).render('dashboard/competition.dash.ejs', {
            title: 'Leagues and Competitions',
            leagues: [],
            message: 'An error occurred while fetching competitions. Please try again later.'
        });
    }
});

// POST route to save a new competition (league)
router.post('/', upload.single('logo'), async (req, res) => { // Changed the path to '/'
    const { league, founded, continent, country, market_value, type} = req.body;
    const logo = req.file ? req.file.filename : null;
    const players = 0

    if (!league || !founded || !continent || !country || !market_value) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const db = await useLeaguesDB();
        const sql = `INSERT INTO competitions VALUES (?,?,?, ?, ?, ?, ?, ?,?)`;
        const values = [null, league, country, players, market_value, continent,logo, founded, type];

        const result = await dbRun(db, sql, values);
        
        // Fetch the newly inserted league to send back to the frontend
        const newLeague = await dbQuery(db, `SELECT * FROM competitions WHERE id = ?`, [result.lastID]);

        // Send the newly created league back as a response
        res.status(201).json({ league: newLeague });
    } catch (err) {
        console.error('Error saving league:', err);
        res.status(500).json({ message: 'An error occurred while saving the league.' });
    }
});

// PUT route to update an existing competition (league)
router.put('/', async (req, res) => {
       const { id, competition, founded, continent, country, market_value, type } = req.body;
       console.log(req.body)
   
   
       try {
           const db = await useLeaguesDB();
           
           // Prepare the SQL statement for updating the competition
           const sql = `
               UPDATE competitions 
               SET 
                   competition = ?, 
                   country_id = ?, 
                   players = ?, 
                   market_value = ?, 
                   continent = ?, 
                   founded = ?, 
                   type = ? 
               WHERE id = ?
           `;
           const values = [competition, country, 0, market_value, continent, founded, type, id];
   
           // Execute the update query
           const result = await dbRun(db, sql, values);
   
           // Check if any rows were affected
           if (result.changes === 0) {
               return res.status(404).json({ message: 'Competition not found.' });
           }
   
           // Fetch the updated competition data
           const updatedCompetition = await dbQuery(db, `SELECT * FROM competitions WHERE id = ?`, [id]);
   
           // Send the updated competition back as a response
           res.status(200).json({ competition: updatedCompetition });
       } catch (err) {
           console.error('Error updating competition:', err);
           res.status(500).json({ message: 'An error occurred while updating the competition.' });
       }
   });

  
   // GET all clubs in a specific season and competition
   router.get('/v1/api/competitions/:competitionId/seasons/:seasonId/clubs', async (req, res) => {
       const { competitionId, seasonId } = req.params;
   
       try {
           // SQL Query to get all clubs for the given competition and season
           const query = `
               SELECT c.id, c.name
               FROM clubs c
               JOIN phases p ON p.team_id = c.id
               WHERE p.season_id = ? AND p.competition_id = ?;
           `;
   
           // Use dbAll to fetch data
           const clubs = await dbAll(query, [seasonId, competitionId]);
   
           // Check if no clubs were found
           if (clubs.length === 0) {
               return res.status(404).json({ message: 'No clubs found for this season and competition' });
           }
   
           // Return the list of clubs as JSON
           res.json(clubs);
       } catch (error) {
           // Handle any errors that occur during the query
           console.error('Error fetching clubs:', error);
           res.status(500).json({ message: 'Internal server error' });
       }
   });
   
   

   

module.exports = router;
