$(document).ready(function () {
    $("#back").on('click', async () => {
       window.history.back()
    })


        $('#saveGame').click(function() {
            const homeTeamId = $('#home').find('option:selected').val();
            const homeGoals = $('input[name="home_goals"]').val();
            const awayTeamId = $('#away').find('option:selected').val();
            const seasonId = $('#competition-selector').find('option:selected').val();
            const awayGoals = $('input[name="away_goals"]').val();
            const gameTime = $('#gameTimeInput').val();
    
            const players = [];
    
            // Collect home team selected players
            $('.home input[type="checkbox"]:checked').each(function() {
                const playerId = $(this).attr('id').split('-')[1];
                const number = $(`#jersey-${playerId}`).val();
                const position = $(`#position-${playerId}`).val();
                players.push({
                    playerId: playerId,
                    teamId: $('.home').attr('id'),
                    number: number,
                    position: position,
                    start: true // Assuming 'start' is true if selected
                });
            });
    
            // Collect away team selected players
            $('.away input[type="checkbox"]:checked').each(function() {
                const playerId = $(this).attr('id').split('-')[1];
                const number = $(`#jersey-${playerId}`).val();
                const position = $(`#position-${playerId}`).val();
                players.push({
                    playerId: playerId,
                    teamId: $('.away').attr('id'),
                    number: number,
                    position: position,
                    start: true // Assuming 'start' is true if selected
                });
            });
    
            // Send the data to the server for saving
            $.ajax({
                url: '/dashboard/games',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    homeTeamId,
                    awayTeamId,
                    homeGoals,
                    awayGoals,
                    gameTime,
                    seasonId,
                    players
                }),
                success: function(response) {
                    alert('Game and lineups saved successfully!');
                    console.log(response);
                },
                error: function(error) {
                    console.error('Error saving game or lineups:', error);
                    alert('An error occurred while saving. Please try again.');
                }
            });
        });
    });
    