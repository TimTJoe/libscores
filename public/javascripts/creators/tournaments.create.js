$(document).ready(function () {
    $(document).ready(function () {
        // Fetch countries to populate the country select dropdown
        // populateCountriesSelect('countries');
        // Form submission handler for saving the league
        $('#saveTournament').on('click', function (e) {
            e.preventDefault();
    
            // Gather form data
            const formData = new FormData();
            formData.append('name', $('#name').val());
            formData.append('badge', $('#badge')[0].files[0]); // Get file from input
            formData.append('host', $('#host').val());
            formData.append('start', $('#start').val());
            formData.append('end', $('#end').val());
    
            // Show loading spinner
            $('#spinner').show();
            $('#saveTournament').prop('disabled', true);
    
            // Submit form data via AJAX
            $.ajax({
                url: '/dashboard/tournaments', // Updated URL to reflect new route
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    // Hide spinner and re-enable button
                    $('#spinner').hide();
                    $('#saveTournaments').prop('disabled', false);
    
                    // Show success tournamentMsg
                    $('#tournamentMsg').show().addClass('success').text('tournament saved successfully');
    
                    // Clear form fields
                    $('#name').val('');
                    $('#host').val('');
                    $('#start').val('');
                    $('#end').val('');
                    $('#badge').val('');

                    // Dynamically append the new league data to the table
                    // console.log(data)
                    appendNewLeagueToTable(data.tournament[0]);
                    
                    // Close the dialog
                    // closeDialog();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // Hide spinner and re-enable button
                    $('#spinner').hide();
                    $('#saveTournament').prop('disabled', false);
    
                    // Show error tournamentMsg
                    $('#tournamentMsg').show().addClass('error').text('An error occurred while saving the tournament.');
                    console.error('Error saving tournament:', textStatus, errorThrown);
                }
            });
        });
    });
    
});

function appendNewLeagueToTable(tournament) {
   
    const newRow = `
        <a href="/dashboard/tournaments/${tournament.id}" class="row small-padding border small-round">
            <img src="/images/${tournament.badge}" alt="" class="mid-logo">
            <p class="small cap">${tournament.name}</p>
            <i class="fa fa-arrow-right move-right black margin-right"></i>
        </a>`;
    
    // Prepend the new row to the league table
    $('#tournamentList').prepend(newRow);
}
