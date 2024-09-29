var router = require('express').Router()
var sqlite3 = require("sqlite3").verbose();
var getDbInstance = require('@js/getDBInstance');
var db = getDbInstance(sqlite3)
const upload = require('@middleware/upload');


router.get('/', function(req, res, next) {
    res.render('dashboard/clubs.dash.ejs', { title: 'Manage Clubs' });
});

router.get('/:id', async function(req, res, next) {
       let {id} = req.params
       if(id) {
              db.all("SELECT * FROM clubs WHERE id=?",[id], function (err, rows) {
                     if(err || rows.length == 0) {
                            res.render('dashboard/club.info.ejs', 
                                   {title: "Club doesn't exist",  error:err, 
                                   msg: "Club doesn't exist", club: null})
                     } else {
                            let club = rows[0]
                            res.render('dashboard/club.info.ejs', { title: club.club, club });
                     }
              });
       } else {
              res.redirect('/dashboard/clubs')
       }
      
   });

router.post('/', upload.single("badge"), async function (req, res, next) {
    const { club, founded, country, stadium, value } = req.body;

    try {
        let badge = req.file.filename;

        // Prepare the SQL statement for inserting a new club
        const insertSql = `
            INSERT INTO clubs (id, club, founded, country_id, squad, stadium, market_value, badge) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [null, club, founded, country, null, stadium, value, badge];

        // Execute the insert query
        await new Promise((resolve, reject) => {
            db.run(insertSql, values, function (err) {
                if (err) {
                    return reject(err); // Reject the promise if there's an error
                }
                resolve(this.lastID); // Resolve with the last inserted ID
            });
        });

        // Fetch the newly created club data
        db.get(`SELECT * FROM clubs WHERE club = ?`, [club], (err, newClub) => {
            if (err) {
                return res.status(500).json({ error: "An error occurred while retrieving the new club data." });
            }
            res.status(201).json(newClub); // Return the newly created club data
        });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ error: "An error occurred while adding the club." });
    }
});



// router.post('/', upload.single("badge"), async function(req, res, next) {
//     let options = {
//         title: "Manage Clubs"
//     }
//     console.log(req.body)

//     try {
//            let badge = req.file.filename
//            let{club,founded,country,stadium,value}= req.body
//            db.run(
//            "INSERT INTO clubs VALUES (?,?,?,?,?,?,?,?)",
//            [null,club,founded, country,null,stadium,value,badge],
//            function (err) {
//                   if(err) {
//                          throw new Error(err);
//                   } else {
//                          res.render('dashboard/clubs.dash.ejs', options);
//                   }
//            }
//            );
//     } catch (error) {
//            res.status(400).json({error})
//     }
// });

router.put("/", async function (req, res) {
    const { coach, club, founded, squad, stadium, market_value, competition, team_country, id } = req.body;

    // Input validation
    if (!id || !team_country || !stadium || !club) {

        return res.status(400).json({ error: "Missing required fields." });
    }

    // Prepare the SQL statement for updating the club
    const updateSql = `
        UPDATE clubs 
        SET 
            club = ?, 
            founded = ?, 
            country_id = ?, 
            squad = ?, 
            stadium = ?, 
            market_value = ? 
        WHERE id = ?
    `;

    // Prepare values in the order specified
    const values = [club, founded, 1,squad, stadium, market_value, id];

    try {
        // Execute the update query
        await new Promise((resolve, reject) => {
            db.run(updateSql, values, function (err) {
                if (err) {
                    console.error(err);
                    return reject(err); // Reject the promise if there's an error
                }
                resolve(this.changes); // Resolve with the number of changes
            });
        });

        // Prepare SQL statement to retrieve the updated club data
        const selectSql = `SELECT * FROM clubs WHERE id = ?`;

        // Fetch the updated data
        db.get(selectSql, [id], (err, updatedClub) => {
            if (err) {
                console.error("Error fetching updated data:", err);
                return res.status(500).json({ error: "An error occurred while retrieving the updated club data." });
            }

            if (!updatedClub) {
                return res.status(404).json({ error: "Club not found." });
            }

            // Return the updated club data
            res.status(200).json({ message: "Club updated successfully.", club: updatedClub });
        });

    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ error: "An error occurred while updating the club." });
    }
});



module.exports = router;
