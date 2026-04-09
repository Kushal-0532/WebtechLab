const fs = require('fs')

const filename = 'testfile.txt'

fs.writeFile(filename, 'Hello from Node.js fs module\n', function(err) {
    if (err) {
        console.log('error writing file:', err)
        return
    }
    console.log('file created')

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            console.log('error reading file:', err)
            return
        }
        console.log('file contents:', data)

        fs.appendFile(filename, 'this line was appended\n', function(err) {
            if (err) {
                console.log('error appending:', err)
                return
            }
            console.log('appended successfully')

            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) return
                console.log('updated contents:', data)

                fs.unlink(filename, function(err) {
                    if (err) {
                        console.log('error deleting:', err)
                        return
                    }
                    console.log('file deleted')
                })
            })
        })
    })
})
