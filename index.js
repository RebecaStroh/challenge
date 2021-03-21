const fs = require('fs')
const readline = require('readline')
const path = require('path')
const PNF = require('google-libphonenumber').PhoneNumberFormat
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

// indices is an array that will save all the header's details 
var indices = new Array()
// eid will save which column is de eid
var eid = 0
// will save all the people of the file as an object
var people = new Array()

// opens the file
const readable = fs.createReadStream(path.join(__dirname, 'input.csv'))
const rl = readline.createInterface({input: readable})

// process each line of the document
rl.on('line', (line) => {
	// treat comas in a string 
	var t = line.split('"')
	for (var i=1;i<t.length; i=i+2){
		t[i] = t[i].split(',').join('/')
	}
	line = t.join('')

	// check if it's a header or data
	if (indices.length == 0) {
		header(line)
	} else {
		data(line)
	}
})

// after finesh reading all the data, writes on the output file
readable.on('end', () => {
	write(people)
})

// Treats the header, recognizing tags and the eid position
function header(line) {
	var headings = line.split(',')

    for (var i=0; i<headings.length; i++) {
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
}

// Treats the data of the new Line
function data(line) {
    for (var i=1; i<line.length; i++) {
    	const data = line.split(',')

    	var iExist = checkExistence(data[eid])
    	if (iExist == -1) {
    		createNew(data)
    	} else {
    		updatePerson(iExist, data)
    	}

	}
}

// Checks if a Person (eid) already exists in the array People. 
// Return -1, in case it doesn't and the index of the person, in case it does.
function checkExistence(eid) {
	for (var i=0; i<people.length; i++) {
		if (people[i].eid == eid) {
			return i
		}
	}

	return -1
}

// Checks if the email is valid, if it's, return the email already processed, if is not, return -1
function checkEmail(email) {
	if (email == '') {
		return -1
	}

	const slices = email.split(' ')
  	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    
  	for (var i in slices) {
  		if (re.test(slices[i])){
	    	return slices[i]
	    }
  	}

  	return -1;	
}

// Checks if the phone is valid, if it's, return the phone already processed, if is not, return -1
function checkPhone(phone) {
	const letters = /^[A-Za-z`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]+$/
	phone = phone.split(letters).join('')

	if (phone == '') {
		return -1
	}

	phone = phoneUtil.parseAndKeepRawInput(phone, 'BR')
	if (!phoneUtil.isValidNumberForRegion(phone, 'BR')) {
		return -1
	}

	phone = phoneUtil.format(phone, PNF.E164)
	phone = phone.replace('+','')

	return phone
}

// Checks if the group is valid, if it's, return the group already processed, if is not, return -1
function checkGroup(group) {
	var groupSlices = group.split(' ')
	group = '';
	for (k in groupSlices) {
		if (groupSlices[k] != '') {
			if (group != '') {
				group += ' '
			}
			group += groupSlices[k]
		}
	}
	return group
}

// Add a new person on the Array
function createNew(data) {
	// create a new instance for the new person
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
    	// if there is more than one information in the same column, split it to treat them separetly
    	var datas = data[j].split('/')

    	for (var d in datas) {
    		// check which type (fullname, eid, address, group, invisible, see_all) we are dealing with to deal properly
	    	switch (indices[j].type) {
	    		case 'address':
	    			var address;

	    			// check if is phone or email, to deal with it properly
	    			switch (indices[j].content.type) {
	    				case 'phone':
	    					address = checkPhone(datas[d])
	    					break;
	    				case 'email':
	    					address = checkEmail(datas[d])
	    					break;
	    			}

	    			// in the case where the address was valid, add it to the address's list
					if (address != -1) {
    					var aux = Object.assign({}, indices[j].content);
    					aux.address = address
    					addresses.push(aux)
    				}
	    			break;
	    		case 'group':
	    			var group = checkGroup(datas[d])
    				if (group != '') {
    					groups.push(group)
    				}
	    			break;
	    		case 'invisible':
	    			// checks all the possibilities of the boolean invisible
	    			if ((datas[d]== true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.invisible = true
	    			}
	    			break;
	    		case 'see_all':
	    			// checks all the possibilities of the boolean invisible
	    			if ((datas[d] == true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.see_all = true
	    			}
	    			break;
	    		case 'fullname':
	    			person.fullname = datas[d]
	    			break;
	    		case 'eid':
	    			person.eid = datas[d]
	    			break;
	    	}
	    }
    }

    // update person in the array
    person.groups = groups
    person.addresses = addresses
    people.push(person)
}

// Updates the information in a person that already has data in the Array
function updatePerson(iExist, data) {
	// first, gets the data that we had from that person
	var person = people[iExist]
   	var groups = person.groups
	var addresses = person.addresses

    for (var j=0; j<indices.length; j++) {
    	// if there is more than one information in the same column, split it to treat them separetly
    	var datas = data[j].split('/')

    	for (var d in datas) {
    		// check which type (fullname, address, group, invisible, see_all) we are dealing with to deal properly
	    	switch (indices[j].type) {
	    		case 'address':
	    			var address

	    			// check if is phone or email, to deal with it properly
	    			switch (indices[j].content.type) {
	    				case 'phone':
	    					address = checkPhone(datas[d])
	    					break;
	    				case 'email':
	    					address = checkEmail(datas[d])
	    					break;
	    			}

	    			// if the address was valid, add it to the address's list
					if (address != -1) {
						// checks if the address already exists in the person's address
						var exist = false						
						for (var i=0; i<addresses.length; i++) {
							if (addresses[i].address == address) {
								exist = true
							}
						}

						// if it doesn't exists in the person's address, add it
						if (!exist) {
							var aux = Object.assign({}, indices[j].content)
							aux.address = address
							addresses.push(aux)
						}
					}
	    			break;
	    		case 'group':
	    			var group = checkGroup(datas[d])

    				if (group != '') {
    					// checks if the group already exists in the person's groups
	    				var exist = false
						for (var i=0; i<groups.length; i++) {
							if (groups[i] == group) {
								exist = true
							}
						}

						// if it doesn't exists in the person's groups, add it
						if (!exist){
	    					groups.push(group)
						}
    				}
	    			break;
	    		case 'invisible':
	    			// checks all the possibilities of the boolean invisible
	    			if ((datas[d] == true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.invisible = true
	    			}
	    			break;
	    		case 'see_all':
	    			// checks all the possibilities of the boolean invisible
	    			if ((datas[d] == true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.see_all = true
	    			}
	    			break;
	    		case 'fullname':
	    			person.fullname = datas[d]
	    			break;
	    	}
	    }
    }

    // update person in the array
    person.groups = groups
    person.addresses = addresses
    people[iExist] = person
}

// Writes in the output file, transforming the array people in a JSON
function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(content), (err) =>{
		if (err) throw err
	})
}