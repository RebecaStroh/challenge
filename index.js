const fs = require('fs')
const path = require('path')

var persons = new Array()

console.clear()

function read() {
	fs.readFile(path.join(__dirname, 'input.csv'), 'utf8', (err, content) => { 
		if (err) throw err

		// trata das virgulas 
		var t = content.split('"')
		for (var i=1;i<t.length; i=i+2){
			t[i] = t[i].split(',').join('/')
		}
		content = t.join('')

		// divide o arquivo em linhas e colunas
	    var allTextLines = content.split(/\r\n|\n/)
	    var headings = allTextLines[0].split(',')
	    var lines = []
	    var indices = []

	    for (var i=0; i<headings.length; i++) {
	    	headings[i] = headings[i].split('"').join('')
	    	var aux = headings[i].split(' ')
	
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
	    		default:
	    			indices.push({type:aux[0]})
	    			break;
	    	}
	    }

	    for (var i=1; i<allTextLines.length; i++) {
	    	var data = allTextLines[i].split(',')
	    	var groups = []
	    	var addresses = []
	    	var person = {
				fullname: '',
				eid: -1,
				groups: [],
				addresses: [],
				invisible: false,
				see_all: false
	    	}

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
		    			var aux = data[j].split('/')
		    			groups.push(data[j])
		    			break;
		    		case 'invisible':
		    			if ((data[j] == true) || (data[j] == 1) || (data[j] == 'yes')) {
		    				person.invisible = true
		    			}
		    			break;
		    		case 'see_all':
		    			if ((data[j] == true) || (data[j] == 1) || (data[j] == 'yes')) {
		    				person.see_all = true
		    			}
		    			break;
		    		case 'fullname':
		    			person.fullname = data[j]
		    			break;
		    		case 'eid':
		    			person.eid = data[j]
		    			break;
		    	}
		    }
		    person.groups = groups
		    person.addresses = addresses
		    persons.push(person)
		}

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