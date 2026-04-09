const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/lab12db')
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log('db connection error:', err))

const userSchema = new mongoose.Schema({
    name: String,
    email: String
})

const User = mongoose.model('User', userSchema)

app.get('/users', async function(req, res) {
    const users = await User.find()
    res.json(users)
})

app.get('/users/:id', async function(req, res) {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'not found' })
    res.json(user)
})

app.post('/users', async function(req, res) {
    const user = await User.create(req.body)
    res.status(201).json(user)
})

app.put('/users/:id', async function(req, res) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) return res.status(404).json({ message: 'not found' })
    res.json(user)
})

app.delete('/users/:id', async function(req, res) {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'not found' })
    res.json({ message: 'deleted' })
})

app.listen(3000, function() {
    console.log('server running on port 3000')
})
