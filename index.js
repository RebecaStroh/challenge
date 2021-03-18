const fs = require('fs')
const path = require('path')

var persons = new Array()

console.clear()

function read() {
	fs.readFile(path.join(__dirname, 'input.csv'), 'utf8', (err, content) => { 
		if (err) throw err

		// var lines = content.split("\n")

		// var header = lines[0].split(',')[0]

	    var allTextLines = content.split(/\r\n|\n/)
	    var headings = allTextLines[0].split(',')
	    var lines = []
	    var indices = []

	    for (var i=0; i<headings.length; i++) {
	    	headings[i] = headings[i].split('"').join('');
	    	var aux = headings[i].split(' ');
	
	    	switch (aux[0]) {
	    		case 'email':
	    			var tags = new Array()
	    			for (var j=1; j<aux.length; j++) {
	    				tags.push(aux[j])
	    			}
	    			var address = {
				    	type: 'email',
				    	tags: tags,
				    	address: ''
				    }
	    			indices.push({type:'address', content: address})
	    			break;
	    		case 'phone':
	    			var tags = new Array()
	    			for (var j=1; j<aux.length; j++) {
	    				tags.push(aux[j])
	    			}
	    			var address = {
				    	type: 'phone',
				    	tags: tags,
				    	address: ''
				    }
	    			indices.push({type:'address', content: address})
	    			break;
	    		case 'group':
	    			indices.push({type:'group'})
	    			break;
	    		case 'invisible':
	    			indices.push({type:'invisible'})
	    			break;
	    		case 'see_all':
	    			indices.push({type:'boolean', content:'see_all'})
	    			break;
	    		case 'fullname':
	    			indices.push({type:'string', content:'fullname'})
	    			break;
	    		case 'eid':
	    			indices.push({type:'number', content:'eid'})
	    			break;
	    	}

	    }

	    for (var i=1; i<allTextLines.length; i++) {
	    	var data = allTextLines[i].split(',');
	    	var person = [];
	    	var groups = []
	    	var addresses = []
		    for (var j=0; j<headings.length; j++) {	

		    	switch (indices[j].type) {
		    		case 'address':
		    			var aux = indices[j].content
		    			switch (indices[j].content.type) {
		    				case 'phone':
		    					aux.address = data[j]
		    					break;
		    				case 'email':
		    					aux.address = data[j]
		    					break;
		    			}
		    			addresses.push(aux)
		    			break;
		    		case 'group':
		    			groups.push(allTextLines[i][j])
		    			break;
		    		case 'boolean':
		    			person.push(indices[j].content+': '+data[j])
		    			break;
		    		case 'string':
		    			person.push(indices[j].content+': '+data[j])
		    			break;
		    		case 'number':
		    			person.push(indices[j].content+': '+data[j])
		    			break;
		    	}
		    }
		    person.push({groups: groups})
		    person.push({addresses: addresses})
		    persons.push(person)
		    
		}
		console.log(persons)


	    // for (var i=1; i<allTextLines.length; i++) {
	    //     var tarr = '{\n'
	    //     for (var j=0; j<headings.length; j++) {
	    //         tarr += (headings[j]+':'+'\n')
	    //     }
	    //     tarr += '}'
	    //     lines.push(tarr)
	    // }
	    //console.log(lines)

		// for (var i=1; i<lines.length; i++) {
		// 	var column = lines[i].split(',')

		// 	var addr = new Array()
		// 	addr = [column[2],column[3],column[4],column[5],column[6],column[7]]

		// 	var grp = new Array()
		// 	grp = [column[8],column[9]]

		// 	var person = {
		// 		fullname:column[0],
		// 		eid:column[1],
		// 		groups: grp,
		// 		addresses: addr,
		// 		invisible:column[10],
		// 		see_all:column[11]
		// 	}

		// 	var resul = checkExistence(persons, column[1])
		// 	if (resul == -1) {
		// 		persons.push(person)
		// 	} else {
		// 		persons.push(person)
		// 	}
		// }

		 write(persons)
	})
}

function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(content), (err) =>{
		if (err) throw err

		console.log(persons)
	})
}

function checkExistence(persons, eid) {
	 for (var i=0; i<persons.length; i++) {
		 if (persons[i].eid == eid) {
		 	return i;
		 }
	 }
	return -1
}

read()