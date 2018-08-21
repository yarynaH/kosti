var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var i18n = require('/lib/xp/i18n');
var httpClientLib = require('/lib/xp/http-client');
var norseUtils = require('norseUtils');

exports.makeRequest = function(url, params, method) {
	return httpClientLib.request({
	    url: url,
	    method: method,
	    headers: {
	        'X-Custom-Header': 'header-value'
	    },
	    connectionTimeout: 2000000,
	    readTimeout: 500000,
	    params: params,
	    contentType: 'application/json'
	});
}

exports.createCity = function( city, population, buildings ){
	var cityCore = {
		Population: ['Guards', 'Militia', 'Warriors', 'Experts', 'Adepts', 'Aristocrats', 'Barbarians', 'Bards', 'Clerics',
			'Druids', 'Fighters', 'Monks', 'Paladins', 'Rangers', 'Rogues', 'Sorcerers', 'Wizards', 'Commoners'],
		Buildings: ['Blacksmith', 'Magic Shop', 'Scroll and Potion Shop', 'Jewelry Store', 'General Store', 'Taverns']
	}
    var city = contentLib.create({
        name: city.title,
        displayName: city.title,
        parentPath: '/dndTools/cities',
        contentType: app.name + ':town',
        data: {
            powerCenter: city.powerCenters,
            wealth: city.communityWealth,
            gpLimit: city.gpLimit,
            population: city.population
        }
    });
    for (var property in cityCore) {
	    if (cityCore.hasOwnProperty(property)) {
		    var coreFolder = contentLib.create({
		        name: property,
		        displayName: property,
		        parentPath: city._path,
		        contentType: 'base:folder',
		        data: {}
		    });
	    	for( var i = 0; i < cityCore[property].length; i++ ){
			    var categoryFolder = contentLib.create({
			        name: cityCore[property][i],
			        displayName: cityCore[property][i],
			        parentPath: coreFolder._path,
			        contentType: 'base:folder',
			        data: {}
			    });
			    for (var type in population) {
				    if (population.hasOwnProperty(type)) {
					    if( type ==  cityCore[property][i]){
					    	for( var j = 0; j < population[type].length; j++ ){
						    	this.createPerson(population[type][j], categoryFolder._path);
						    }
					    }
				    }
				}
			    for (var type in buildings) {
				    if (buildings.hasOwnProperty(type)) {
					    if( type ==  cityCore[property][i]){
					    	for( var j = 0; j < buildings[type].length; j++ ){
					    		if( type != 'Taverns' ){
							    	this.createBuilding(buildings[type][j], categoryFolder._path, city._path);
							    } else {
							    	this.createTavern(buildings[type][j], categoryFolder._path, city._path);
							    }
						    }
					    }
				    }
				}
	    	}
	    }
	}
}

exports.beautifyResponse = function( response ){
    response = response.body.split('<br>');
    for( var i = 0; i < response.length; i++ ){
        response[i] = response[i].trim();
        if( response[i] == '' ){
            response.splice(i, 1);
        }
    }
    return response;
}

exports.createPerson = function( person, parentPath ){
	try{
		contentLib.create({
	        name: person.name,
	        displayName: person.name,
	        parentPath: parentPath,
	        contentType: app.name + ':person',
	        refresh: true,
	        data: {
	        	race: person.race,
	        	sex: person.sex,
	        	class: person.class,
	        	level: person.level,
	        	role: person.role,
	        	habit: person.habit
	        }
	    });
	   	norseUtils.log('created ' + person.class + ' ' + person.name);
	} catch( err ){
		norseUtils.log(err);
	}
}

exports.createBuilding = function( building, parentPath, cityPath ){
	try{
		var staff = [];
		for( var i = 0; i < building.staff.length; i++ ){
			var temp = contentLib.query({
				query: "displayName = '" + building.staff[i].name + "' AND _parentPath LIKE '/content"+cityPath+"*'",
				branch: 'draft'
			}).hits[0];
			staff.push({
				id: temp._id,
				role: building.staff[i].role
			});
		}
		contentLib.create({
	        name: building.title,
	        displayName: building.title,
	        parentPath: parentPath,
	        contentType: app.name + ':building',
	        data: {
	        	type: building.type,
	        	price: building.price,
	        	lunchTime: building.lunchTime,
	        	lunchOpen: building.lunchOpen,
	        	staff: staff
	        }
	    });
	    norseUtils.log('created ' + building.type + ' ' + building.title);
	} catch( err ){
		norseUtils.log(err);
	}
}

exports.createTavern = function( tavern, parentPath, cityPath ){
	try{
		var staff = [];
		for( var i = 0; i < tavern.staff.length; i++ ){
			var temp = contentLib.query({
				query: "displayName = '" + tavern.staff[i].name + "' AND _parentPath LIKE '/content"+cityPath+"*'",
				branch: 'draft'
			}).hits[0];
			staff.push({
				id: temp._id,
				role: tavern.staff[i].role
			});
		}
		var owner = [];
		for( var i = 0; i < tavern.owners.length; i++ ){
			var temp = contentLib.query({
				query: "displayName = '" + tavern.owners[i].name + "' AND _parentPath LIKE '/content"+cityPath+"*'",
				branch: 'draft'
			}).hits[0];
			owner.push({
				id: temp._id,
				role: tavern.owners[i].role
			});
		}
		var patron = [];
		for( var i = 0; i < tavern.patrons.length; i++ ){
			var temp = contentLib.query({
				query: "displayName = '" + tavern.patrons[i].name + "' AND _parentPath LIKE '/content"+cityPath+"*'",
				branch: 'draft'
			}).hits[0];
			patron.push(temp._id);
		}
		contentLib.create({
	        name: tavern.title,
	        displayName: tavern.title,
	        parentPath: parentPath,
	        contentType: app.name + ':tavern',
	        data: {
	        	open: tavern.open,
	        	close: tavern. close,
	        	staff: staff,
	        	owner: owner,
	        	patron: patron,
	        	menu: tavern.menu
	        }
	    });
	    norseUtils.log('created tavern ' + tavern.title);
	} catch( err ){
		norseUtils.log(err);
	}
}

exports.createCreature = function( creature ){
	try{
		var name = creature.name;
		delete creature.name;
		contentLib.create({
	        name: name.replace('/', ' or '),
	        displayName: name,
	        parentPath: '/dndtools/monsters',
	        contentType: app.name + ':creature',
	        data: creature
	    });
	    norseUtils.log('created creature ' + name);
	} catch( err ){
		norseUtils.log(err);
	}
}

exports.createItem = function( item ){
	try{
		var title = item.title;
		delete item.title;
		contentLib.create({
	        name: title.replace('/', ' or '),
	        displayName: title,
	        parentPath: '/dndTools/items',
	        contentType: app.name + ':item',
	        data: item
	    });
	    norseUtils.log('created item ' + title);
	} catch( err ){
		norseUtils.log(err);
	}
}