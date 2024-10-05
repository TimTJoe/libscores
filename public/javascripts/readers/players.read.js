
$(document).ready(function () {
    const $homeselect = $("#home")
    const $awayselect = $("#away")

    $awayselect.change(function () {
        const clubId = $(this).find("option:selected").attr('value'); // Get selected club ID
        $(".away").attr('id', clubId)
        
        if (clubId) {
            fetchAndRenderClubPlayers(clubId)
        }
    });
    
    $homeselect.change(function () {
        const clubId = $(this).find("option:selected").attr('value'); // Get selected club ID
        $(".home").attr('id', clubId)
        
        if (clubId) {
            fetchAndRenderClubPlayers(clubId)
        }
    });
    });

    /**
 * Fetches the players of a specific club by clubId using jQuery and renders them into an element with the matching ID.
 *
 * @param {string} clubId - The ID of the club whose players are to be fetched and rendered.
 */
export function fetchAndRenderClubPlayers(clubId) {
    // Send a request to the API endpoint to get the players of the specified club
    $.get(`/v1/api/clubs/${clubId}/players`, function(data) {
        // Find the target element by clubId
        const targetElement = $(`#${clubId}`);


        if (!targetElement.length) {
            console.error(`No element found with ID: ${clubId}`);
            return;
        }

        // Clear the existing content in the target element
        targetElement.empty();

        // Check if the response contains the message about no players
        if (data.message) {
            const noPlayersMessage = `<p class="no-players-message">${data.message}</p>`;
            targetElement.append(noPlayersMessage);
            return;
        }

        // Iterate through the players and build the HTML structure if players are found
        data.players.forEach(player => {
            const playerHTML = `
                <span class="row tiny-bottom">
                    <label for="player-${player.id}" class="small max row margin-right" title="Select player">
                        <input type="checkbox" name="player" id="player-${player.id}">
                        <span>${player.fullname}</span>
                    </label>
                    
                    <input id="jersey-${player.id}" type="text" class="tiny-input" placeholder="${player.jersey_number || ''}" title="Player jersey number">
                    
                    <select id="position-${player.id}" name="position" class="small-select positions" title="Player position">
                        <option value="GK" ${player.position === 'GK' ? 'selected' : ''}>Goalkeeper</option>
                        <option value="DF" ${player.position === 'DF' ? 'selected' : ''}>Defender</option>
                        <option value="MF" ${player.position === 'MF' ? 'selected' : ''}>Midfielder</option>
                        <option value="FW" ${player.position === 'FW' ? 'selected' : ''}>Forward</option>
                    </select>
                </span>
            `;

            // Append the player card to the target element
            targetElement.append(playerHTML);
        });
    }).fail(function() {
        // Handle request failure
        console.error('Error fetching or rendering players.');
        const errorMessage = '<p class="error-message">Error fetching players. Please try again later.</p>';
        targetElement.append(errorMessage);
    });
}
