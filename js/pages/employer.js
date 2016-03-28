var App = App || {};

(function() {
	
	App.initEmployer = function(name) {
		if (typeof name === 'undefined') var name = 'CSET';

		var sectors = App.sectors.concat(['Other']);

		// fill sector select
		var employerSelect = d3.select('.employer-select').on('change', function() {
			var employer = $(this).val();
			updateData(employer);
			updateDistributionChart(employer);	
		});
		employerSelect.selectAll('option')
			.data(App.employers.sort())
			.enter().append('option')
				.property('value', function(d) { return d.Employer; })
				.text(function(d) { return d.Employer; });
		employerSelect.property('value', name);
		
		var updateData = function(emp) {
			$('.employer-name-text').text(emp);
			
			var employerInfo = App.employers.filter(function(d) { return d.Employer === emp; })[0];
			var firstName = employerInfo.contact_first;
			var lastName = employerInfo.contact_last;
			var phone = employerInfo.contact_phone;
			var email = employerInfo.contact_email;

			$('.employer-first-name-text').text((firstName === '') ? 'No Data' : firstName);
			$('.employer-last-name-text').text((lastName === '') ? 'No Data' : lastName);
			$('.employer-phone-text').text((phone === '') ? 'No Data' : phone);
			$('.employer-email-text').text((email === '') ? 'No Data' : email);
		};
		updateData(name);


		// build the chart
		var margin = {top: 30, right: 100, bottom: 180, left: 80};
		var width = 960 - margin.left - margin.right;
		var height = 550 - margin.top - margin.bottom;
   		var chart = d3.select('.employer-distribution-chart')
   			.attr('width', width + margin.left + margin.right)
   			.attr('height', height + margin.top + margin.bottom)
   			.append('g')
   				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


		var x = d3.scale.ordinal()
			.domain(sectors)
			.rangeRoundBands([0, width], 0.3);
		var xAxis = d3.svg.axis().scale(x)
			.tickFormat(function(d) {
				return (d === 'Manufacturing & Product Design/Engineering & Design') ? 'Manufacturing & Product Design' : d;
			})
			.orient('bottom');
		var xAxisG = chart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis);
			
		var y = d3.scale.linear()
			.range([height, 0]);
		var yAxis = d3.svg.axis()
			.orient('left')
			.tickFormat(Util.comma)
			.innerTickSize(-width)
			.outerTickSize(0);
		var yAxisG = chart.append('g')
			.attr('class', 'y axis');
			
		var xAxisLabel = chart.append('text')
			.attr('transform', 'translate(-50, ' + height/2 + ') rotate(-90)')
			.text('# of hours');
		
		
		var updateDistributionChart = function(emp) {
			var valuesBySector = {};
			for (var i = 0; i < sectors.length; i++) valuesBySector[sectors[i]] = 0;
			for (var i = 0; i < App.events.length; i++) {
				var event = App.events[i];
				if (event.Employer === emp) {
					var sector = event.Sector;
					var val = Util.strToFloat(event.Total);
					if (sectors.indexOf(sector) === -1) {
						if (!isNaN(val)) valuesBySector.Other += val;
					} else {
						if (!isNaN(val)) valuesBySector[sector] += val;
					}
				}
			}
			
			
			// fix y-axis scale
			var values = sectors.map(function(d) { return valuesBySector[d]; });
			var max = d3.max(values);
			if (max === 0) max = 10;
			y.domain([0, max]);
			yAxis.scale(y);
			yAxisG.call(yAxis);

			var barGroups = chart.selectAll('.bar-group')
				.data(sectors);
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
				.attr('y', function(d) { return y(valuesBySector[d]); })
				.attr('height', function(d) { return height - y(valuesBySector[d]); });
			barGroups.select('rect').on('click', function(d) {
				hasher.setHash('sector/' + d);
			});
			barGroups.select('text').transition()
				.attr('y', function(d) { return y(valuesBySector[d]) - 4; })
				.text(function(d) { return Util.comma(valuesBySector[d]); });
				
			barGroups.exit().remove();
			
			$('.x.axis .tick text')
				.css('text-anchor', 'start')
				.attr('transform', 'rotate(20)');
		};
		updateDistributionChart(name);
	};
})();
