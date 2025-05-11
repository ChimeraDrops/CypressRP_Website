const express = require('express')
const fs = require('fs')
const cors = require('cors')
const app = express()

const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_PATH = './messages.json'

// GET all messages
// GET messages for a specific recipient
app.get('/messages', (req, res) => {
  const messages = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  const to = req.query.to
  if (to) {
    const filtered = messages.filter(msg => msg.to === to)
    res.json(filtered)
  } else {
    res.json(messages)
  }
})

// POST a new message
app.post('/messages', (req, res) => {
  const messages = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  const newMessage = req.body
  messages.push(newMessage)
  fs.writeFileSync(DATA_PATH, JSON.stringify(messages, null, 2))
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
