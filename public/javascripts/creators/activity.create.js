$(document).ready(function() {
    const socket = io(); // Initialize socket.io

    // Listen for the 'activityAdded' event
    socket.on('activityAdded', function(activity) {
        const activityContainer = $('.activity-container'); // Replace with your actual container class

        // Create a new activity element using the provided activity data
        const activityElement = `
            <div class="activity">
                <h3>Activity Summary</h3>
                <p><strong>Activity Type:</strong> ${activity.type}</p>
                <p><strong>Team:</strong> ${activity.team.name}</p> <!-- Display team name instead of team ID -->
                <p><strong>Game Details:</strong></p>
                <ul>
                    <li><strong>Game ID:</strong> ${activity.game.id}</li>
                    <li><strong>Home Team:</strong> ${activity.game.home_team.name}</li>
                    <li><strong>Away Team:</strong> ${activity.game.away_team.name}</li>
                    <li><strong>Start Time:</strong> ${new Date(activity.game.start).toLocaleString()}</li>
                    <li><strong>Status:</strong> ${activity.game.status}</li>
                </ul>
                <p><strong>Minutes:</strong> ${activity.minutes}</p>
            </div>
        `;

        // Append the new activity to the container
        activityContainer.append(activityElement);
    });
});
