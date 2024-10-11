// Function to return the correct DB instance based on the environment
function getDbInstance(sqlite3) {
    let db;
  
    if (process.env.NODE_ENV === 'development') {
      // Use local SQLite file in development
      db = new sqlite3.Database(process.env.LEAGUES_DB_PATH, (err) => {
        if (err) {
          console.error('Error connecting to the local leagues database:', err.message);
        } else {
          console.log('Connected to the local leagues database.');
        }
      });
    } else if (process.env.NODE_ENV === 'production') {
      // Use the cloud SQLite URL in production
      db = new sqlite3.Database(process.env.PROD_DB_URL, (err) => {
        if (err) {
          console.error('Error connecting to the cloud leagues database:', err.message);
        } else {
          console.log('Connected to the SQLite cloud leagues database.');
        }
      });
    }
  
    return db;
  }

module.exports = getDbInstance