// Dependencies
// ==============================================
const express = require('express')
const path = require('path')

// Express App
// ==============================================
const app = express()
const PORT = 3000

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))


const sampleNotes = [
    {   
        weekday: 'Monday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Tuesday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Wednesday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Thursday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Friday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Saturday',
        note: 'Get shit done'
    },
    {   
        weekday: 'Sunday',
        note: 'Get shit done'
    }

]

// Route Handler for html pages
// =========================================================
const publicRoutes = {index:'/', notes: '/notes'}
const files = ['public/index.html', 'public/notes.html']

const requestHandler = (path) => {
    if (Object.values(publicRoutes).indexOf(path) === -1){
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public/index.html'))
        })
    } else if (path === '/') {
        app.get(path, (req, res) => {
            res.sendFile(path.join(__dirname, files[0]))
        })
    } else if (path === '/notes') {
        app.get(path, (req, res) => {
            res.sendFile(path.join(__dirname, files[1]))
        })
    }
}
requestHandler()

// requestHandler('/', 'public/index.html')
// requestHandler('/notes', 'public/notes.html')


// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/index.html'))
// })
// app.get('/notes', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/notes.html'))
// })

// Displays all the notes
app.get('/api/notes', (req, res) => {
    return res.json(sampleNotes)
})

// Get a specific note
app.get('/api/notes/:slot', (req, res) => {
    const slot = req.params.slot

    for (const note of sampleNotes) {

        if (slot.toLowerCase() === note.weekday.toLowerCase()) {
            return res.json(note)
        }
    }
})


// Server listening
// ====================================================================
app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))
