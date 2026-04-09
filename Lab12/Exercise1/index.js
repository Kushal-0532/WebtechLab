const express = require('express')
const app = express()

app.use(express.json())

let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
]
let idCounter = 3

app.get('/users', function(req, res) {
    res.json(users)
})

app.get('/users/:id', function(req, res) {
    const user = users.find(u => u.id == req.params.id)
    if (!user) {
        return res.status(404).json({ message: 'user not found' })
    }
    res.json(user)
})

app.post('/users', function(req, res) {
    const newUser = {
        id: idCounter++,
        name: req.body.name,
        email: req.body.email
    }
    users.push(newUser)
    res.status(201).json(newUser)
})

app.put('/users/:id', function(req, res) {
    const user = users.find(u => u.id == req.params.id)
    if (!user) {
        return res.status(404).json({ message: 'user not found' })
    }
    if (req.body.name) user.name = req.body.name
    if (req.body.email) user.email = req.body.email
    res.json(user)
})

app.delete('/users/:id', function(req, res) {
    const index = users.findIndex(u => u.id == req.params.id)
    if (index === -1) {
        return res.status(404).json({ message: 'user not found' })
    }
    users.splice(index, 1)
    res.json({ message: 'user deleted' })
})

app.listen(3000, function() {
    console.log('server started on http://localhost:3000')
})
