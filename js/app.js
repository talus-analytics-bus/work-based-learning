var App = App || {};

(function() {
	App.spendingCategories = ['Total', 'Cash', 'Equipment', 'Scholarship', 'Stipend', 'Other', 'Paid Internships', 'Emp. Hours'];

	App.initialize = function() {
		$('.header-title').click(function() { hasher.setHash(''); });
	};
	
	App.initHome = function() {
		$('.big-button').click(function() {
			var page = $(this).attr('page');
			hasher.setHash(page);
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
})();