var App = App || {};

(function() {
	App.initAcademy = function(id) {
		// fill academy select
		var academySelect = d3.select('.academy-select').on('change', function() {
			var academyId = $(this).val();
			var academy = App.academies.filter(function(d) { return d.id === +academyId; })[0];
			updateData(academy);
			updateDistributionChart(academy);
			updateEventTable(academy);
		});
		academySelect.selectAll('option')
			.data(App.academies)
			.enter().append('option')
				.property('value', function(d) { return d.id; })
				.text(function(d) { return d['Academy Name'] + ' (' + d['High School'] + ')'; });
		academySelect.property('value', id);
		
		
		var academy = App.academies.filter(function(d) { return d.id === +id; })[0];
		
		// update data function
		var updateData = function(a) {
			$('.academy-name-text').text(a['Academy Name']);
			$('.academy-high-school-text').text(a['High School']);
			$('.academy-district-text').text(a['School District'])
				.click(function() {
					hasher.setHash('district/' + a['School District']);
				});
			$('.academy-sector-text').text(a['Primary CTE Industry Sector'])
				.click(function() {
					hasher.setHash('sector/' + a['Primary CTE Industry Sector']);
				});
			$('.academy-county-text').text(a.County);
		};
		
		
		// build the chart
		var margin = {top: 30, right: 20, bottom: 30, left: 80};
		var width = 960 - margin.left - margin.right;
		var height = 400 - margin.top - margin.bottom;
   		var chart = d3.select('.academy-distribution-chart')
   			.attr('width', width + margin.left + margin.right)
   			.attr('height', height + margin.top + margin.bottom)
   			.append('g')
   				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


		var x = d3.scale.ordinal()
			.domain(App.spendingCategories)
			.rangeRoundBands([0, width], 0.1);
		var xAxis = d3.svg.axis().scale(x)
			.orient('bottom');
		var xAxisG = chart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis);
			
		var y = d3.scale.linear()
			.range([height, 0]);
		var yAxis = d3.svg.axis()
			.orient('left')
			.tickFormat(Util.monetize)
			.innerTickSize(-width)
			.outerTickSize(0);
		var yAxisG = chart.append('g')
			.attr('class', 'y axis');
		
		
		var updateDistributionChart = function(a) {
			// fix y-axis scale
			var values = App.spendingCategories.map(function(d) { return Util.strToFloat(a[d]); });
			y.domain([0, d3.max(values)]);
			yAxis.scale(y);
			yAxisG.call(yAxis);

			var barGroups = chart.selectAll('.bar-group')
				.data(App.spendingCategories);
			var newBarGroups = barGroups.enter().append('g')
				.attr('class', 'bar-group');
			newBarGroups.append('rect')
				.attr('class', 'bar')
				.attr('width', x.rangeBand());
			newBarGroups.append('text')
				.attr('x', x.rangeBand() / 2);
			
			barGroups.transition()
				.attr('transform', function(d) { return 'translate(' + x(d) + ',0)'; });
			barGroups.select('rect').transition()
				.attr('y', function(d) { return y(a[d]); })
				.attr('height', function(d) { return height - y(a[d]); });
			barGroups.select('text').transition()
				.attr('y', function(d) { return y(a[d]) - 4; })
				.text(function(d) { return Util.monetize(a[d]); });
				
			barGroups.exit().remove();
		};
		
		
		var updateEventTable = function(a) {
			var events = App.events.filter(function(d) { return d['Academy Name'] + d['Academy School'] === a['Academy Name'] + a['High School']; });
			if (events.length === 0) {
				$('.event-list-container').hide();
			} else {
				$('.event-list-container').show();
				
				var employerHours = {};
				for (var i = 0; i < events.length; i++) {
					var emp = events[i].Employer;
					if (typeof employerHours[emp] === 'undefined') employerHours[emp] = 0;
					employerHours[emp] += Util.strToFloat(events[i].Total);
				}
				var employers = [];
				for (var emp in employerHours) employers.push({employer: emp, value: employerHours[emp]});				
				employers.sort(function(a, b) {
					if (+a.value > +b.value) return -1;
					else if (+a.value < +b.value) return 1;
					else return 0;
				});
				
				var eventRows = d3.select('.academy-event-list tbody').selectAll('tr')
					.data(employers);
				var newEventRows = eventRows.enter().append('tr');
				for (var i = 0; i < 2; i++) newEventRows.append('td');
				
				eventRows.select('td:first-child').text(function(d) { return d.employer; });
				eventRows.select('td:nth-child(2)').text(function(d) { return Util.comma(d.value); });
				
				eventRows.exit().remove();
			}
		};
		

		updateData(academy);
		updateDistributionChart(academy);
		updateEventTable(academy);
	};
})();
