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


		// build the chart
		var margin = {top: 40, right: 20, bottom: 30, left: 80};
		var width = 960 - margin.left - margin.right;
		var height = 400 - margin.top - margin.bottom;
   		var chart = d3.select('.overall-distribution-chart')
   			.attr('width', width + margin.left + margin.right)
   			.attr('height', height + margin.top + margin.bottom)
   			.append('g')
   				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


		var x = d3.scale.ordinal()
			.domain(App.spendingCategories)
			.rangeRoundBands([0, width], 0.3);
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
		
		
		// fix y-axis scale
		var values = [2212415,348362,600,0,0,44102,130768,1688583];
		var targetValue = 2271520;
		y.domain([0, targetValue]);
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
			.attr('y', function(d, i) { return y(values[i]); })
			.attr('height', function(d, i) { return height - y(values[i]); });
		barGroups.select('text').transition()
			.attr('y', function(d, i) { return y(values[i]) - 4; })
			.text(function(d, i) { return Util.monetize(values[i]); });
			
		barGroups.exit().remove();
		
		var progressChart = d3.select('.progress-chart')
			.attr('width', 800)
			.attr('height', 25);
		progressChart.append('rect')
			.attr('width', 800)
			.attr('height', 20)
			.style('fill', 'none')
			.style('stroke', '#999')
			.style('stroke-width', 2);
		progressChart.append('rect')
			.attr('width', 800 * values[0] / targetValue)
			.attr('height', 20)
			.style('stroke', 'none')
			.style('fill', '#31a354');
		$('.progress-text').html('<b class="text-success">' + Util.monetize(values[0]) + '</b> of <b>' + Util.monetize(targetValue) + '</b> pledged');
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