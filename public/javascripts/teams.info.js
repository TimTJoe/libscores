
$(document).ready(function() {
    const teamId = $('#teamId').val() || window.location.pathname.split('/').pop();
    
    // Load the squad content on initial page load
    loadContent(`/dashboard/teams/${teamId}/tab/squad`, 'section[data-content="team"]');

    $('.small-chip').on('click', function() {
        const tabName = $(this).data('tab');
        loadContent(`/dashboard/teams/${teamId}/tab/${tabName}`, 'section[data-content="team"]');
    });
});

export function loadContent(url, targetSelector) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            $(targetSelector).slideUp(200, function() {
                $(this).html(data).slideDown(200);
            });
        },
        error: function(err) {
            console.error("Error loading content:", err);
        }
    });
}

