    $(document).ready(function() {
        const socket = io(); // Initialize socket.io

        // Listen for the 'activityAdded' event
        socket.on('activityAdded', function(activity) {
            const activityContainer = $('.activity-container'); // Replace with your actual container class

            // Create a new activity element
            const activityElement = `
                <div class="activity">
                    <p>Activity Type: ${activity.type}</p>
                    <p>Team ID: ${activity.team_id}</p>
                    <p>Minutes: ${activity.minutes}</p>
                </div>
            `;

            // Append the new activity to the container
            activityContainer.append(activityElement);
        });
    });
