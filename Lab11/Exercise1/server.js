const http = require('http')

const server = http.createServer(function(req, res) {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(200)
    res.write('<h1>Hello from Node.js!</h1>')
    res.write('<p>Request URL: ' + req.url + '</p>')
    res.end()
})

server.listen(3000, function() {
    console.log('server is running on port 3000')
})
