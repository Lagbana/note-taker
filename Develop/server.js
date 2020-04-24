// Dependencies
// ==============================================
const express = require('express')
const path = require('path')
const fs = require('fs').promises
const { v4 } = require('uuid')
const uniqueID = v4


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

// public route handling
// =========================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'))
})

// Server listening
// ====================================================================
app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))
