// Dependencies
// ==============================================
const express = require('express')
const path = require('path')
const fs = require('fs').promises
const { v4 } = require('uuid')
const uniqueID = v4
const moment = require('moment')
const timeStamp = moment().format('LLL')
const filterByTime = moment().format('YYYY-M-D')


// Express App
// ==============================================
const app = express()
const PORT = 3000

// Set up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))

// Database file and folder
const dbDir = path.resolve(__dirname, "./db");
const dbpath = path.join(dbDir, 'db.json')

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

// Filter notes in Database by: YEAR only or YEAR/MONTH or YEAR/MONTH/DAY
app.get('/api/notes/:year?/:month?/:day?', async (req, res) => {
    // Read in database
    const allNotes = await readDB()

    // search parameters
    const year = req.params.year
    const month = req.params.month
    const day = req.params.day

    // output
    const results = []

    try {
        for (const note of allNotes) {
            const noteTime = note["filterTime"] // e.g: 2020-4-30
            const arr = noteTime.split('-')
            const apiYear = arr[0], apiMonth = arr[1], apiDay = arr[2]
            
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
        if (results.length > 0) {
            return res.json(results)
        } else {
            return res.json({"parameters":false})
        }
    } catch (err) {
        console.log(err)
    }

})

// Redirect non-existent routes to the index page instead of displaying 404 status
app.get('*', (req, res) => res.redirect('/'))


// Functions: Reading and Writing to Database (to POST and DELETE)
// ====================================================================
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

const writeToDB = async (file) => {

    await fs.writeFile(dbpath, file, (err, data) => {
        if (err) {
            throw err;
        }
        return data;
    });
}

// POST request handling
// =========================================================

app.post('/api/notes', async function (req, res) {
    const newNoteObject = req.body

    // add note id and time stamp at time of writing
    newNoteObject["id"] = uniqueID()
    newNoteObject["timeStamp"] = timeStamp
    newNoteObject["filterTime"] = filterByTime

    const newNoteText = newNoteObject["text"]

    // Format note display structure and update with time of writing ------------------------------------------------------------------------------------------------------------------------>
    newNoteObject["text"] = `                                                                                                                                                          Written: ${timeStamp} 
    
${newNoteText}
    `


    const allNotes = await readDB()
    allNotes.push(newNoteObject)

    const updatedDB = JSON.stringify(allNotes)

    writeToDB(updatedDB)

    res.json({ post: true })
})

// DELETE request route handling
// =========================================================
app.delete('/api/notes/:id', async function (req, res) {
    const deletedNoteID = req.params.id

    const allNotes = await readDB()

    for (const note of allNotes) {
        if (note.id === deletedNoteID) {
            allNotes.splice(allNotes.indexOf(note), 1)
        }
    }

    const updatedDB = JSON.stringify(allNotes)

    await writeToDB(updatedDB)

    res.json({ delete: true })

})


// Server listening
// ====================================================================
app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))
