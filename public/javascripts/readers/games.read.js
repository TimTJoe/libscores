import { fetchAndRenderSummary, fetchAndRenderLineups, updateGamePeriodTimer} from "../utils.js";

$(document).ready(function () {
    let gameId = getGameIdFromUrl()
    fetchAndRenderLineups(gameId)
    fetchAndRenderSummary(gameId)
     // Start the timer for the game based on the data-start attribute
     setInterval(updateGamePeriodTimer, 1000);
});

/**
 * Extracts the game ID from a given URL.
 * Assumes the URL has the format: /dashboard/games/{gameId}/game.
 *
 * @returns {string | null} The game ID from the URL, or null if not found.
 */
function getGameIdFromUrl() {
    const urlPath = window.location.pathname; // Get the current path, e.g., '/dashboard/games/3/game'
    const parts = urlPath.split('/'); // Split the URL path into parts

    // Find the position of "games" in the URL and return the following value (game ID)
    const gameIndex = parts.indexOf('games');
    if (gameIndex !== -1 && parts[gameIndex + 1]) {
        return parts[gameIndex + 1]; // Return the game ID
    }
    return 1; // Return null if the game ID is not found
}
