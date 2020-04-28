// Dependencies
// ==============================================
const express = require('express')
const path = require('path')
const fs = require('fs').promises
const { v4 } = require('uuid')
const uniqueID = v4                                         // Type: ASCII; To be saved as database property
const moment = require('moment')        
const timeStamp = moment().format('LLL')                    //Get local time of writing to be displayed in note and saved as database property
const filterByTime = moment().format('YYYY-M-D')            //Get formatted time to be used for API filter and saved as database property


// Initialize Express App and set dynamic port
// ==============================================
const app = express()
const PORT = process.env.PORT || 3000

// Set up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))

// Database file and folder path
const dbDir = path.resolve(__dirname, "./db");
const dbpath = path.join(dbDir, 'db.json')

/**
 * *A function that executes the fs.readFile to read the JSON database and return an object
 * 
 *  *Within the readFile function
 * @param {JSON} dbpath - absolute path to the JSON database
 * @return {Array} - JavaScript Array Object {  Array. [{string, string}]   }
 */

const readDB = async () => {
    const result = await fs.readFile(dbpath, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        try {
            return data
        } catch (err) {
            console.error(err)
        }
    });
    return JSON.parse(result)
}
/**
 * A function that executes the fs.writeFile to take update or delete actions on the JSON database and return a new object
 * 
 *  *Within the writeFile function
 * @param {JSON} file - Post request JSON object "{Object.<string, string>}"
 * @param {JSON} dbpath - absolute path to the JSON database
 * @return {object} - JavaScript Object {Object.<string, string>}
 *
 */
const writeToDB = async (file) => {
    await fs.writeFile(dbpath, file, (err, data) => {
        if (err) {
            throw err;
        }
        return data;
    });
}

// GET request handling
// ========================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'))
})

// Get all notes in Database
app.get('/api/notes', async (req, res) => {
    const result = await readDB()
    return res.json(result)
})

/**
 * Returns the filtered notes in Database by: YEAR only or YEAR/MONTH or YEAR/MONTH/DAY
 * @param {string} '/api/notes/:year?/:month?/:day?' route path with all possible parameters
 * 
 * @example /api/notes/2020/4/23
 * 
 * @property {string} /api/notes - required path to API
 * @property {string} /:year, /:month, /:day- optional paths. 
 * !note: month path can only be requested if a year has been requested first and single months should not have a preceding "zero"
 * !note: day path can only be requested if a year and month has been requested first. See example above.
 */

app.get('/api/notes/:year?/:month?/:day?', async (req, res) => {
    // Read in database by executing pre-defined readDB function (See Below). Returns JavaScript Array
    const allNotes = await readDB()

    // search parameters by user.
    const year = req.params.year
    const month = req.params.month
    const day = req.params.day

    // output array to save changes for later conversion to a JSON array
    const results = []

    try {
        for (const note of allNotes) {
            // Get the "filterTime" object property of each note in the database and split it
            const noteTime = note["filterTime"] // e.g: 2020-4-30
            const arr = noteTime.split('-')

            // Use the split variables as comparison variables for search parameters
            const apiYear = arr[0], apiMonth = arr[1], apiDay = arr[2]

            // Check if search parameters match database comparison variables
            const hasYear = (apiYear === year)
            const hasMonth = (apiMonth === month)
            const hasDay = (apiDay === day)

            if (hasYear && hasMonth && hasDay) {
                results.push(note)
            } else if (hasYear && hasMonth && day === undefined) {
                results.push(note)
            } else if (hasYear && month === undefined && day === undefined) {
                results.push(note)
            }
        }
        // If parameters match search results return the filtered results
        if (results.length > 0) {
            return res.json(results)
        } else {
            return res.json({ "parameters": false })
        }
    } catch (err) {
        console.log(err)
    }
})

// Redirect non-existent routes to the index page instead of displaying 404 status
app.get('*', (req, res) => res.redirect('/'))


// POST request handling
// =========================================================
app.post('/api/notes', async function (req, res) {
    const newNoteObject = req.body

    // Add JSON database object properties
    // add note id, time stamp, and filter time properties at time of POST request (clicking save note)
    newNoteObject["id"] = uniqueID()
    newNoteObject["timeStamp"] = timeStamp
    newNoteObject["filterTime"] = filterByTime

    // Get the request body text content for some formatting below
    const newNoteText = newNoteObject["text"]

    // Format note display structure and update with time of writing ------------------------------------------------------------------------------------------------------------------------>
    newNoteObject["text"] = `                                                                                                                                                          Written: ${timeStamp} 
    
${newNoteText}
    `
    // Read in the database and push new note into database for update
    const allNotes = await readDB()
    allNotes.push(newNoteObject)

    const updatedDB = JSON.stringify(allNotes)
    // Update the database
    writeToDB(updatedDB)

    // Send back response to client side
    res.json({ post: true })
})

// DELETE request route handling
// =========================================================
app.delete('/api/notes/:id', async function (req, res) {
    // Receive deleted post id from req
    const deletedNoteID = req.params.id

    // Read in database
    const allNotes = await readDB()

    // Check all notes in database to find match of deleted post ID
    for (const note of allNotes) {
        if (note.id === deletedNoteID) {
            allNotes.splice(allNotes.indexOf(note), 1)
        }
    }
    // Updated JSON database 
    const updatedDB = JSON.stringify(allNotes)
    await writeToDB(updatedDB)

    // Return POST response
    res.json({ delete: true })
})

// Server listening
// ====================================================================
app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))