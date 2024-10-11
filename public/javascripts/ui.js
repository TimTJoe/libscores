$(document).ready(function() {
    // When any button with data-modal is clicked
    $('button[data-modal]').on('click', function() {
        // Get the value of data-modal from the clicked button
        const modalSelector = $(this).attr('data-modal');

        // Find the element whose data-modal matches the value without the hash (#)
        const targetModal = $(`[data-modal="${modalSelector.replace('#', '')}"]`);

        // Toggle the visibility of the target modal element
        targetModal.toggle();
    });

        // Fetch competition data
        $.get('/v1/api/competitions')
            .done(function(data) {
                const $competitionList = $('#competitions'); // Cache the list element
                
                // Clear the list (in case it's not empty)
                $competitionList.empty();
    
                // Check if there are competitions to display
                if (data.length === 0) {
                    $competitionList.append('<li>No competitions available.</li>');
                    return;
                }
    
                // Loop through each competition and append to the list
                data.forEach(competition => {
                    const competitionItem = `
                    
                        <a href="/competitions/${competition.id}" class="side-tab small-round bg-gray row tiny-padding cap">
                            <img src="/images/${competition.logo}" class="sm-logo small-round" alt="">  
                            <small class="tiny bold black" title="${competition.name}">${competition.name.substring(0, 16) + '...'}
                            </small>
                        </a>
                    `;
                    $competitionList.append(competitionItem);
                });
            })
            .fail(function(error) {
                console.error('Error fetching competitions:', error);
                $('#competitions').append('<li>Error loading competitions.</li>');
            });
    
});
