var App = App || {};

(function() {
	App.initHome = function() {
		$('.big-button').click(function() {
			var page = $(this).attr('page');
			hasher.setHash(page);
		});


		// build the chart
		var margin = {top: 40, right: 20, bottom: 30, left: 80};
		var width = 900 - margin.left - margin.right;
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
		
		
		// update progress bar
		$('.progress-bar').css('width', String(100*values[0]/targetValue) + '%');
		$('.progress-text').html(Util.monetize(values[0]) + ' of ' + Util.monetize(targetValue) + ' achieved (' + Util.percentize(values[0]/targetValue) + ')');
		
		// draw ticks for progress bar
		d3.select('.progress-bar-shell').selectAll('.tick-line')
			.data([0, 50, 100])
			.enter().append('div')
				.attr('class', 'tick-line')
				.style('left', function(d) { return d + '%'; });
		d3.select('.progress-bar-shell').selectAll('.tick-text')
			.data([0, 50, 100])
			.enter().append('div')
				.attr('class', 'tick-text')
				.style('left', function(d) { return (d-10) + '%'; })
				.text(function(d) { return d + '%'; });
	
	};
})();
