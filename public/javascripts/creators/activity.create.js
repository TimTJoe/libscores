$(document).ready(function() {
    const socket = io(); // Initialize socket.io

    socket.on('scoreUpdated', function (data) {
        let { game, scorer} = data

        let homeid = $(`#${game.home}`).attr('id');
        let awayid = $(`#${game.away}`).attr('id');

        if (homeid == game.home) {
            $(`#${game.home}`).text(game.home_goal)
        }
        if (awayid == game.away) {
            $(`#${game.away}`).text(game.away_goal)
        }
        // Log the updated score to the console
        console.log('Updated Score Received: ', data);
    });


    // Get game ID from the URL (assuming it's in the format '/dashboard/games/:gameId/game')
    const gameId = window.location.pathname.split('/')[3] ; // Extract game ID from URL

    // Function to handle showing messages
    function showMessage(element, message, isSuccess) {
        element.text(message);
        element.removeClass('success error');
        element.addClass(isSuccess ? 'success' : 'error');
    }

    
    $("#goal-team").on("change", async () => {
        const teamId = $(this).find("option:selected").attr('value'); 
        const url = `/v1/api/clubs/${teamId}/players`;

        $('.player-select').empty();
          // Make an AJAX GET request to fetch the phase by ID
    $.get(url, function (data) {
        data.players.forEach(player => {
            const option = $('<option></option>').val(player.id).text(player.fullname);
            $('.player-select').append(option);
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle error
        console.error('Error fetching player:', textStatus, errorThrown);
        // alert('Failed to fetch the phase. Please try again later.');
    });
    })

    // Save Score Button Click Handler
    $('#savescore').on('click', function() {
        const goalTeam = $('#goal-team').val(); // Get selected team value
        const goalPlayer = $('#goal-player').val(); // Get selected team value
        const goalMinute = $('#goal-minute').val(); // Get the minute value
        const $this = $(this);
        const $messageElement = $('#scoreMessage');
        const $spinner = $('.scoreSpinner');

        // Validate inputs
        if (!goalTeam || !goalPlayer || !goalMinute) {
            showMessage($messageElement, 'All fields are required!', false);
            return;
        }

        // Prepare data for PUT request
        const data = {
            game_id: gameId,
            team_id: goalTeam,
            player_id: goalPlayer,
            minutes: goalMinute,
            goals: 1 // Assuming each click represents 1 goal
        };

        // Show spinner and disable button
        $spinner.show();
        $this.prop('disabled', true);

        // Send PUT request to update the score
        $.ajax({
            url: `/dashboard/games/${gameId}/score`, // Adjust the URL based on your routing
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
            // Listen for the 'scoreUpdated' event
                console.log('response ', response);
                showMessage($messageElement, 'Score updated successfully!', true);
            },
            error: function(xhr) {
                showMessage($messageElement, `Error: ${xhr.responseJSON.error}`, false);
            },
            complete: function() {
                // Hide spinner and re-enable button
                $spinner.hide();
                $this.prop('disabled', false);
            }
        });
    });

    // Save Activity Button Click Handler
    $('#saveactivity').on('click', function() {
        const activityTeam = $('#activity-team').val(); // Get selected team value
        const activityType = $('#activity-type').val(); // Get selected activity type
        const activityMinute = $('#activity-minute').val(); // Get the minute value
        const $this = $(this);
        const $messageElement = $('#activityMessage');
        const $spinner = $('#activitySpinner');

        // Validate inputs
        if (!activityTeam || !activityType || !activityMinute) {
            alert('All fields are required!');
            return;
        }

        // Prepare data for PUT request
        const activityData = {
            game_id: gameId,
            team_id: activityTeam,
            type: activityType,
            minutes: activityMinute
        };

        // Show spinner and disable button
        $spinner.show();
        $this.prop('disabled', true);

        // Send PUT request to update the activity
        $.ajax({
            url: `/api/games/${gameId}/activity`, // Adjust the URL based on your routing
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(activityData),
            success: function(response) {
                // Emit updated activity to the client UI
                socket.emit('activityUpdated', {
                    game_id: gameId,
                    team_id: activityTeam,
                    activity: response.activity // Assuming your response contains the new activity
                });
                showMessage($messageElement, 'Activity updated successfully!', true);
            },
            error: function(xhr) {
                showMessage($messageElement, `Error: ${xhr.responseJSON.error}`, false);
            },
            complete: function() {
                // Hide spinner and re-enable button
                $spinner.hide();
                $this.prop('disabled', false);
            }
        });
    });
});
