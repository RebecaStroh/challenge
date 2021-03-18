const fs = require('fs')
const path = require('path')

function read() {
	fs.readFile(path.join(__dirname, 'input.csv'), 'utf8', (err, content) => { 
		if (err) throw err

		write(content)
	})
}

function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), content, (err) =>{
		if (err) throw err
	})
}

read();