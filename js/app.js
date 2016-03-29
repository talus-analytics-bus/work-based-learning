var App = App || {};

(function() {
	App.spendingCategories = [
		{attr: 'total', name: 'Total'},
		{attr: 'cash', name: 'Cash'},
		{attr: 'equipment', name: 'Equipment'},
		{attr: 'scholarship', name: 'Scholarship'},
		{attr: 'stipend', name: 'Stipend'},
		{attr: 'other', name: 'Other'},
		{attr: 'paid_internship', name: 'Paid Internships'},
		{attr: 'emp_hours', name: 'Emp. Hours'}
	];
	App.payRate = 11.7;

	App.initialize = function() {
		// set breadcrumbs link
		$('.header-title').click(function() { hasher.setHash(''); });
	};
	
	App.loadData = function(callback) {
		NProgress.start();
		queue()
			.defer(App.getData, 'academies')
			.defer(App.getData, 'districts')
			.defer(App.getData, 'employers')
			.defer(App.getData, 'events')
			.await(function(error, academies, districts, employers, events) {
				App.academies = academies;
				App.districts = districts;
				App.employers = employers;
				App.events = events;

				// get unique list of sectors
				var sectors = App.academies
					.map(function(d) { return d.primary_cte_industry; })
					.filter(function(d) { return d !== '#N/A'; });
				App.sectors = Util.getUnique(sectors).sort();
				
				// fill in number of hours for each employer
				for (var i = 0; i < App.employers.length; i++) {
					var emp = App.employers[i].Employer;
					App.employers[i].events = [];
					for (var j = 0; j < App.events.length; j++) {
						if (App.events[j].Employer === emp) {
							App.employers[i].events.push(App.events[j]);
						}
					}
				}
				
				// assign ids
				Util.assignId(App.academies);
				Util.assignId(App.events);
				Util.assignId(App.districts);
				Util.assignId(App.employers);

				NProgress.done();
				callback();		
			});
	};
	
		
	App.initList = function() {
		var academyTable = d3.select('.academy-table');
		var academyHeaderRow = academyTable.select('thead tr');
		var academyTbody = academyTable.select('tbody');
		
		// fill header rows
		academyHeaderRow.selectAll('td')
			.data(['Academy'].concat(App.spendingCategories))
			.enter().append('td')
				.text(function(d) { return d; });
				
		// fill academy table
		var academyRows = academyTbody.selectAll('tr')
			.data(App.academies);
		
		var newAcademyRows = academyRows.enter().append('tr');
		for (var i = 0; i < App.spendingCategories.length + 1; i++) newAcademyRows.append('td');
		
		academyRows.on('click', function(d) { hasher.setHash('academy/' + d.id); });
		for (var i = 0; i < App.spendingCategories.length + 1; i++) {
			var cell = academyRows.select('td:nth-child(' + (i+1) + ')');
			if (i === 0) {
				cell.text(function(d) { return d['Academy Name'] + ' (' + d['High School'] + ')'; });
			} else {
				cell.text(function(d) { return Util.monetize(d[App.spendingCategories[i-1]]); });
			}
		}
		
		academyRows.exit().remove();
	};

	
	App.getEmployerData = function(a) {
		var employerInfo = {};
		var maxHours = 0;
		for (var i = 0; i < App.events.length; i++) {
			var event = App.events[i];
			if (typeof a === 'object' && (event.academy_name + event.academy_school === a.academy_name + a.high_school) ||
				(event.school_district === a)) {
				var emp = event.employer;
				if (typeof employerInfo[emp] === 'undefined') {
					employerInfo[emp] = {
						hours: 0,
						money: 0
					};
				}
				employerInfo[emp].hours += Util.strToFloat(event.total);
				employerInfo[emp].money += Util.strToFloat(event.cash);
				employerInfo[emp].money += Util.strToFloat(event.equipment);
				employerInfo[emp].money += Util.strToFloat(event.scholarship);
				employerInfo[emp].money += Util.strToFloat(event.stipend);
				employerInfo[emp].money += Util.strToFloat(event.other);
				employerInfo[emp].money += Util.strToFloat(event.internship_hours) * App.payRate;
				// record max
				if (employerInfo[emp].hours > maxHours) maxHours = employerInfo[emp].hours;
			}
		}
		
		var employers = [];
		for (var emp in employerInfo) {
			employers.push({
				employer: emp,
				hours: employerInfo[emp].hours,
				money: employerInfo[emp].money,
				value: employerInfo[emp].hours,
				percOfMax: employerInfo[emp].hours / maxHours
			});
		}			
		return employers;
	};
			
	/**
	 * Queries and returns data from the database
	 * @param {String} tableName The name of the database table to be querying from
	 * @param {Object} param An object containing the conditionals of the query (e.g. "year: 2005" or "year: [2005, 2007]")
	 * @param {Function} callback The function to be called when the data has been received 
	 */
	App.getData = function(tableName, param, callback) {
		var options = {table: tableName};
		if (typeof param === 'function') {
			var callback = param;
		} else {
			for (var ind in param) options[ind] = param[ind];
		}
		
		$.post('php/get.php', options, function(data) {
			var results = JSON.parse(data);
			if (results.hasOwnProperty('error')) {
				console.log(results.error);
				callback(results.error);
			} else {
				callback(null, results);
			}
		});
	};
})();