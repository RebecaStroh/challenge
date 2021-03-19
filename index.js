const fs = require('fs')
const path = require('path')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

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
	    var eid = 0;
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
	    		case 'eid':
	    			eid = i;
	    		default:
	    			indices.push({type:aux[0]})
	    			break;
	    	}
	    }

	    for (var i=1; i<allTextLines.length; i++) {
	    	var data = allTextLines[i].split(',')

	    	var iExist = checkExistence(data[eid])
	    	if (iExist == -1) {
	    		createNew(indices, data)
	    	} else {
	    		updatePerson(indices, iExist, data)
	    	}
	    	
		}

		write(persons)
	})
}

function createNew(indices, data) {
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

    for (var j=0; j<indices.length; j++) {	

    	switch (indices[j].type) {
    		case 'address':
    			var aux = indices[j].content
    			switch (indices[j].content.type) {
    				case 'phone':
    					var letters = /^[A-Za-z]+$/;
    					data[j] = data[j].split(letters).join('')
    					letters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    					data[j] = data[j].split(letters).join('')
    					if (data[j] != '') {
    						aux.address = data[j]
    					}
    					break;
    				case 'email':
    					aux.address = data[j]
    					break;
    			}
    			addresses.push(aux)
    			break;
    		case 'group':
    			var aux = data[j].split('/')
    			for (var a in aux) {
    				aux[a] = aux[a].split(' ').join('')
    				aux[a] = aux[a].replace('ala', 'ala ')
    				if (aux[a] != '') {
    					groups.push(aux[a])
    				}
    			}
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

function updatePerson(indices, iExist, data) {
	var person = persons[iExist]
   	var groups = person.groups
	var addresses = person.addresses

    for (var j=0; j<indices.length; j++) {	

    	switch (indices[j].type) {
    		case 'address':
    			switch (indices[j].content.type) {
    				case 'phone':
    					var letters = /^[A-Za-z]+$/;
    					data[j] = data[j].split(letters).join('')
    					letters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
    					data[j] = data[j].split(letters).join('')
    					break;
    				case 'email':
    					break;
    			}

    			var exist = false;
				if (data[j] != '') {
					var aux = indices[j].content
					for (var i=0; i<addresses.length; i++) {
						if (addresses[i].address == aux.address) {
							exist = true;
						}
					}
					if (!exist) {
						aux.address = data[j]
						addresses.push(aux)
					}
				}
    			break;
    		case 'group':
    			var aux = data[j].split('/')
    			for (var a in aux) {
    				var exist = false;
    				aux[a] = aux[a].split(' ').join('')
    				aux[a] = aux[a].replace('ala', 'ala ')
					for (var i=0; i<addresses.length; i++) {
						if (groups[i] == aux[a]) {
							exist = true;
						}
					}
					if (!exist && (aux[a] != '')){
    					groups.push(aux[a])
					}
    			}
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
    persons[iExist] = person
}

function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(content), (err) =>{
		if (err) throw err

		console.log(persons)
	})
}

function checkExistence(eid) {
	 for (var i=0; i<persons.length; i++) {
		 if (persons[i].eid == eid) {
		 	return i;
		 }
	 }
	return -1
}

read()