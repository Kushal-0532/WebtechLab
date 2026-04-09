const express = require('express')
const app = express()

// logs every incoming request
app.use(function(req, res, next) {
    console.log(req.method, req.url, new Date().toLocaleTimeString())
    next()
})

// adds a header to all responses
app.use(function(req, res, next) {
    res.setHeader('X-App-Name', 'Lab12')
    next()
})

// middleware to check auth for protected routes
function checkAuth(req, res, next) {
    const token = req.headers['x-auth-token']
    if (token === 'secret123') {
        next()
    } else {
        res.status(401).send('not authorized')
    }
}

app.get('/', function(req, res) {
    res.send('home page')
})

app.get('/about', function(req, res) {
    res.send('about page')
})

app.get('/dashboard', checkAuth, function(req, res) {
    res.send('welcome to dashboard')
})

app.listen(3000, function() {
    console.log('server running on port 3000')
})
