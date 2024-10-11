const { useLeaguesDB, dbQuery } = require('./dbUtils');

// Fetch game details based on game ID
async function getGameById(game_id) {
    const db = await useLeaguesDB();
    const getGameSql = 'SELECT * FROM games WHERE id = ?';
    const result = await dbQuery(db, getGameSql, [game_id]);
    return result[0]; // Assuming game_id is unique, return the first item
}

// Update the game score for a specific team (home or away)
async function updateGameScore(game_id, isHomeTeam) {
    const db = await useLeaguesDB();
    const updateSql = isHomeTeam
        ? 'UPDATE games SET home_goal = home_goal + 1 WHERE id = ?'
        : 'UPDATE games SET away_goal = away_goal + 1 WHERE id = ?';
    await dbQuery(db, updateSql, [game_id]);

    // Fetch updated game details
    return await getGameById(game_id);
}

// Insert a new scorer entry into the database
async function insertScorer(player_id, game_id, goal, minutes) {
    const db = await useLeaguesDB();
    const insertScorerSql = 'INSERT INTO scorers VALUES (?, ?, ?, ?, ?)';
    await dbQuery(db, insertScorerSql, [null, player_id, game_id, goal, minutes]);

    // Fetch the newly inserted scorer data
    const getScorerSql = 'SELECT * FROM scorers WHERE game_id = ? AND player_id = ? ORDER BY id DESC LIMIT 1';
    const scorerResult = await dbQuery(db, getScorerSql, [game_id, player_id]);
    return scorerResult[0];
}

// Fetch player details based on player ID
async function getPlayerById(player_id) {
    const db = await useLeaguesDB();
    const getPlayerSql = 'SELECT * FROM players WHERE id = ?';
    const result = await dbQuery(db, getPlayerSql, [player_id]);
    return result[0]; // Assuming player_id is unique, return the first item
}

module.exports = {
    getGameById,
    updateGameScore,
    insertScorer,
    getPlayerById
};
