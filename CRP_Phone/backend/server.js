const express = require('express')
const fs = require('fs')
const cors = require('cors')
const app = express()

const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_PATH = './messages.json'

const USER_PATH = './users.json'

function generatePhoneNumber() {
  const num = Math.floor(1000000 + Math.random() * 9000000) // 7 random digits
  return '420' + num.toString()
}

// POST /register
app.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const users = JSON.parse(fs.readFileSync(USER_PATH, 'utf-8'))

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists' })
  }

  let phone
  do {
    phone = generatePhoneNumber()
  } while (users.find(u => u.phone === phone))

  const newUser = { username, password, phone }
  users.push(newUser)
  fs.writeFileSync(USER_PATH, JSON.stringify(users, null, 2))

  res.json({ phone })
})

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

// GET /messages/thread?user=4201234567&with=4207654321
app.get('/messages/thread', (req, res) => {
  const { user, with: contact } = req.query

  if (!user || !contact) {
    return res.status(400).json({ error: 'user and with parameters required' })
  }

  const messages = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))

  const thread = messages.filter(msg =>
    (msg.from === user && msg.to === contact) ||
    (msg.from === contact && msg.to === user)
  )

  res.json(thread)
})

// GET /messages/inbox?to=4201234567
app.get('/messages/inbox', (req, res) => {
  const { to } = req.query
  if (!to) return res.status(400).json({ error: 'to parameter required' })

  const messages = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))

  // Group by sender and pick most recent
  const latestFromSenders = {}
  for (const msg of messages) {
    if (msg.to === to) {
      const existing = latestFromSenders[msg.from]
      if (!existing || msg.id > existing.id) {
        latestFromSenders[msg.from] = msg
      }
    }
  }

  res.json(Object.values(latestFromSenders))
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
