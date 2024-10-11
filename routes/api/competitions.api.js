const express = require('express');
const { dbQuery, dbGet, dbAll, useLeaguesDB  } = require('@utils/dbUtils');
const router = express.Router();

/**
 * Helper function to handle errors and send a response.
 * @param {Response} res - Express response object.
 * @param {Error} err - The error object.
 * @param {string} [customMessage='An error occurred'] - Optional custom error message.
 */
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};

/**
 * GET all competition details with their seasons and associated teams.
 * Endpoint: v1/api/competitions
 */
router.get('/', async (req, res) => {
    try {
        const db = await useLeaguesDB();

        // Query to get all competitions
        const competitionQuery = `
            SELECT 
                competitions.id, 
                competitions.competition, 
                competitions.founded, 
                competitions.players, 
                competitions.continent, 
                competitions.market_value, 
                competitions.logo, 
                competitions.type 
            FROM competitions
        `;
        const competitions = await dbAll(db, competitionQuery);

        if (!competitions || competitions.length === 0) {
            return res.status(404).json({ message: 'No competitions found.' });
        }

        // Iterate over all competitions to fetch their seasons and related teams
        const competitionResults = await Promise.all(competitions.map(async (competition) => {
            // Query to get the seasons for each competition
            const seasonQuery = `
                SELECT id AS season_id, start, end, status 
                FROM seasons 
                WHERE competition_id = ?
            `;
            const seasons = await dbAll(db, seasonQuery, [competition.id]);

            if (seasons.length === 0) {
                return {
                    id: competition.id,
                    name: competition.competition,
                    founded: competition.founded,
                    players: competition.players,
                    continent: competition.continent,
                    market_value: competition.market_value,
                    logo: competition.logo,
                    type: competition.type,
                    seasons: [] // No seasons found
                };
            }

            // Fetch teams for each season
            const seasonResults = await Promise.all(seasons.map(async (season) => {
                const phaseQuery = `
                    SELECT clubs.id AS club_id, clubs.club AS club_name, clubs.badge AS club_logo
                    FROM phases
                    JOIN clubs ON phases.team_id = clubs.id
                    WHERE phases.season_id = ?
                `;
                const teams = await dbAll(db, phaseQuery, [season.season_id]);

                return {
                    id: season.season_id,
                    start: season.start,
                    end: season.end,
                    status: season.status,
                    teams: teams.map(team => ({
                        id: team.club_id,
                        name: team.club_name,
                        logo: team.club_logo
                    }))
                };
            }));

            // Return competition details along with the fetched seasons
            return {
                id: competition.id,
                name: competition.competition,
                founded: competition.founded,
                players: competition.players,
                continent: competition.continent,
                market_value: competition.market_value,
                logo: competition.logo,
                type: competition.type,
                seasons: seasonResults
            };
        }));

        // Return all competitions with their season details
        return res.status(200).json(competitionResults);

    } catch (err) {
        handleError(res, err, 'Error fetching competition details.');
    }
});


/**
 * GET competition details with optional seasons and clubs data.
 * Endpoint: v1/api/competitions/:id
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await useLeaguesDB();

        // Query the competition
        const competitionQuery = `
            SELECT 
                competitions.id, 
                competitions.competition, 
                competitions.founded, 
                competitions.players, 
                competitions.continent, 
                competitions.market_value, 
                competitions.logo, 
                competitions.type 
            FROM competitions 
            WHERE competitions.id = ?
        `;
        const competition = await dbGet(db, competitionQuery, [id]);

        if (!competition) {
            return res.status(404).json({ message: 'Competition not found.' });
        }

        // Query the seasons for the competition
        const seasonQuery = `
            SELECT id AS season_id, start, end, status 
            FROM seasons 
            WHERE competition_id = ?
        `;
        const seasons = await dbAll(db, seasonQuery, [id]);

        if (!seasons || seasons.length === 0) {
            return res.status(200).json({
                id: competition.id,
                name: competition.competition,
                founded: competition.founded,
                players: competition.players,
                continent: competition.continent,
                market_value: competition.market_value,
                logo: competition.logo,
                type: competition.type,
                seasons: [], // No seasons found
            });
        }

        // For each season, fetch the related teams from the phases table
        const seasonResults = await Promise.all(seasons.map(async (season) => {
            const phaseQuery = `
                SELECT clubs.id AS club_id, clubs.club AS club_name, clubs.badge AS club_logo
                FROM phases
                JOIN clubs ON phases.team_id = clubs.id
                WHERE phases.season_id = ?
            `;
            const teams = await dbAll(db, phaseQuery, [season.season_id]);

            return {
                id: season.season_id,
                start: season.start,
                end: season.end,
                status: season.status,
                teams: teams.map(team => ({
                    id: team.club_id,
                    name: team.club_name,
                    logo: team.club_logo
                }))
            };
        }));

        // Format the response
        return res.status(200).json({
            id: competition.id,
            name: competition.competition,
            founded: competition.founded,
            players: competition.players,
            continent: competition.continent,
            market_value: competition.market_value,
            logo: competition.logo,
            type: competition.type,
            seasons: seasonResults // Include seasons with teams
        });

    } catch (err) {
        handleError(res, err, 'Error fetching competition details.');
    }
});

// GET season details including clubs for a specific competition and season
router.get('/:competitionId/seasons/:seasonId/clubs', async (req, res) => {
    const { competitionId, seasonId } = req.params;

    try {
        const db = await useLeaguesDB();

        // Query competition details
        const competitionQuery = `
            SELECT id, competition, founded, players, continent, market_value, logo, type 
            FROM competitions 
            WHERE id = ?
        `;
        const competition = await dbGet(db, competitionQuery, [competitionId]);

        if (!competition) {
            return res.status(404).json({ message: 'Competition not found.' });
        }

        // Query season details
        const seasonQuery = `
            SELECT id AS season_id, start, end, status 
            FROM seasons 
            WHERE id = ? AND competition_id = ?
        `;
        const season = await dbGet(db, seasonQuery, [seasonId, competitionId]);

        if (!season) {
            return res.status(404).json({ message: 'Season not found for this competition.' });
        }

        // Query to get all clubs along with phase details for the given season
        const phaseQuery = `
            SELECT phases.id AS phase_id,
                   phases.season_id,
                   phases.status,
                   clubs.id AS club_id,
                   clubs.club AS club_name,
                   clubs.badge AS club_logo
            FROM phases 
            JOIN clubs ON phases.team_id = clubs.id 
            WHERE phases.season_id = ?;  // Filter by the provided season ID
        `;
        const teams = await dbAll(db, phaseQuery, [seasonId]);

        // Send the response
        return res.status(200).json({
            id: competition.id,
            name: competition.competition,
            founded: competition.founded,
            players: competition.players,
            continent: competition.continent,
            market_value: competition.market_value,
            logo: competition.logo,
            type: competition.type,
            season: {
                id: season.season_id,
                start: season.start,
                end: season.end,
                status: season.status,
                teams: teams.map(team => ({
                    id: team.club_id,
                    name: team.club_name,
                    logo: team.club_logo
                }))
            }
        });

    } catch (err) {
        handleError(res, err, 'Error fetching season details.');
    }
});

module.exports = router;
