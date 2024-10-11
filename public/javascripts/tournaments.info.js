$(document).ready(function () {
    // Extract the tournament ID from the span element
    window.tournament_id = $('#tournament_id').text().trim(); // Use .text() to get the content and .trim() to remove any whitespace
    fetchAndRenderContent(`/v1/api/ajax/matches/${window.tournament_id}`) 
    $('[data-tab]').click(function(e) {
        $('[data-tab]').removeClass('active');
        $(this).addClass('active');
        
        let tab = $(this).attr('data-tab');

        // Ensure tournament_id is available
        if (!window.tournament_id) {
            console.error('Tournament ID is not available.');
            return;
        }

        let url = '';

        // Determine the URL to fetch based on the clicked tab
        switch (tab) {
            case "matches":
                url = `/v1/api/ajax/matches/${window.tournament_id}`; // Append tournament ID to the URL
                break;
            case "teams":
                url = `/v1/api/ajax/teams/${window.tournament_id}`; // Append tournament ID to the URL
                break;
            case "groups":
                url = `/v1/api/ajax/groups/${window.tournament_id}`; // Append tournament ID to the URL
                break;
            default:
                url = `/v1/api/ajax/matches/${window.tournament_id}`; // Default to matches if no tab matches
                break;
        }

        fetchAndRenderContent(url) 

        // // Fetch the rendered EJS content from the server
        // $.ajax({
        //     url: url,
        //     method: 'GET',
        //     success: function (response) {
        //         // First, hide the content area, then insert the HTML, and finally slide it down smoothly
        //         $('[data-content]').hide().html(response).slideDown(500);  // 500ms animation time
        //     },
        //     error: function () {
        //         $('[data-content]').hide().html('<p>Error loading content. Please try again.</p>').slideDown(500);
        //     }
        // });
    });
});

function fetchAndRenderContent(url) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            // Default content area selector: '[data-content]'
            $('[data-content]').hide().html(response).slideDown(500);  // 500ms animation time
        },
        error: function() {
            $('[data-content]').hide().html('<p>Error loading content. Please try again.</p>').slideDown(500);
        }
    });
}
