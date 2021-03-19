const fs = require('fs')
const path = require('path')
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

var persons = new Array()

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

function checkEmail(email) {
	if (email == '') {
		return -1
	}

	const slices = email.split(' ');  	
  	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
  	for (var i in slices) {
  		if (re.test(slices[i])){
	    	return slices[i];
	    }
  	}

  	return -1;	
}

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

	return phone;
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
    	var datas = data[j].split('/')

    	for (var d in datas) {
	    	switch (indices[j].type) {
	    		case 'address':
	    			var address;
	    			switch (indices[j].content.type) {
	    				case 'phone':
	    					address = checkPhone(datas[d])
	    					break;
	    				case 'email':
	    					address = checkEmail(datas[d])
	    					break;
	    			}
					if (address != -1) {
    					var aux = Object.assign({}, indices[j].content);
    					aux.address = address
    					addresses.push(aux)
    				}
	    			break;
	    		case 'group':
    				datas[d] = datas[d].split(' ').join('')
    				datas[d] = datas[d].replace('ala', 'ala ')
    				if (datas[d] != '') {
    					groups.push(datas[d])
    				}
	    			break;
	    		case 'invisible':
	    			if ((datas[d]== true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.invisible = true
	    			}
	    			break;
	    		case 'see_all':
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
    person.groups = groups
    person.addresses = addresses
    persons.push(person)
}

function updatePerson(indices, iExist, data) {
	var person = persons[iExist]
   	var groups = person.groups
	var addresses = person.addresses

    for (var j=0; j<indices.length; j++) {	
    	var datas = data[j].split('/')

    	for (var d in datas) {
	    	switch (indices[j].type) {
	    		case 'address':
	    			var address;
	    			switch (indices[j].content.type) {
	    				case 'phone':
	    					address = checkPhone(datas[d])
	    					break;
	    				case 'email':
	    					address = checkEmail(datas[d])
	    					break;
	    			}

					if (address != -1) {
						var exist = false
						
						for (var i=0; i<addresses.length; i++) {
							if (addresses[i].address == address) {
								exist = true
							}
						}

						if (!exist) {
							var aux = Object.assign({}, indices[j].content)
							aux.address = address
							addresses.push(aux)
						}
					}
	    			break;
	    		case 'group':
    				var exist = false;
    				datas[d] = datas[d].split(' ').join('')
    				datas[d] = datas[d].replace('ala', 'ala ')
					for (var i=0; i<groups.length; i++) {
						if (groups[i] == datas[d]) {
							exist = true;
						}
					}
					if (!exist && (datas[d] != '')){
    					groups.push(datas[d])
					}
	    			break;
	    		case 'invisible':
	    			if ((datas[d] == true) || (datas[d] == 1) || (datas[d] == 'yes')) {
	    				person.invisible = true
	    			}
	    			break;
	    		case 'see_all':
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
    person.groups = groups
    person.addresses = addresses
    persons[iExist] = person
}

function write(content) {
	fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(content), (err) =>{
		if (err) throw err
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