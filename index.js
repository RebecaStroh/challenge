const fs = require('fs')
const path = require('path')

var persons = new Array();
console.clear();
function read() {
	fs.readFile(path.join(__dirname, 'input.csv'), 'utf8', (err, content) => { 
		if (err) throw err

		var lines = content.split("\n");

		for (var i=1; i<lines.length; i++) {
			column = lines[i].split(',');

			var person = {
				fullname:column[0],
				eid:column[1],
				addresses:[column[2],column[3],column[4],column[5],column[6],column[7]],
				groups:[column[8],column[9]],
				invisible:column[10],
				see_all:column[11]
			}

			persons[i-1] = person;
		}

		write(persons)
	})
}

function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(content), (err) =>{
		if (err) throw err
	})
}

read();