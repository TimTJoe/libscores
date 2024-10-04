$(document).ready(function() {
    // The game data will be directly available in the DOM via EJS
    const games = window.gameData;  // gameData is a global variable passed via EJS
  
    // Function to initialize timers
    function initializeTimers() {
      $('.game').each(function() {
        const gameId = $(this).data('gameid');
        const startTime = new Date(games[gameId].start).getTime();
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;
        
        // Only start a live timer if the game is supposed to be running
        if (elapsed > 0 && elapsed < 90 * 60 * 1000) {
          updateTimer(gameId, startTime);
        } else if (elapsed >= 90 * 60 * 1000) {
          $('#timer-' + gameId).text('Full-Time');
          $('#period-' + gameId).text('Ended');
        } else {
          $('#timer-' + gameId).text('--:--');
        }
      });
    }
  
    // Function to update the timer
    function updateTimer(gameId, startTime) {
      function tick() {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;
        const minutes = Math.floor((elapsed / 1000) / 60);
        const seconds = Math.floor((elapsed / 1000) % 60);
  
        // Display the timer
        $('#timer-' + gameId).text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  
        // Keep ticking unless 90 minutes have passed
        if (minutes < 90) {
          setTimeout(tick, 1000);
        } else {
          $('#timer-' + gameId).text('Full-Time');
          $('#period-' + gameId).text('Ended');
        }
      }
      tick();
    }
  
    // Initialize all game timers
    initializeTimers();
  
    // Periodically request updates from the server
    function fetchUpdates() {
      $.get('/', function(response) {
        // Assuming the server responds with the latest games data
        window.gameData = response.games;  // Update the global game data variable
        initializeTimers(); // Reinitialize timers after fetching updates
      });
    }
  
    // Poll the server every 30 seconds for updates
    setInterval(fetchUpdates, 30000); // You can adjust the interval time
  });
  