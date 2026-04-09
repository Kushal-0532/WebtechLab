const EventEmitter = require('events')

const myEmitter = new EventEmitter()

myEmitter.on('greet', function(name) {
    console.log('Hello ' + name)
})

myEmitter.on('greet', function(name) {
    console.log('Nice to meet you ' + name + ' (second listener)')
})

myEmitter.on('dataReceived', function(val) {
    console.log('got some data:', val)
})

myEmitter.emit('greet', 'Alice')
myEmitter.emit('greet', 'Bob')
myEmitter.emit('dataReceived', 100)
myEmitter.emit('dataReceived', 'hello world')
