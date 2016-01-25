var App = App || {};

(function() {
	App.initDistrict = function(name) {
		// fill sector select
		var districtSelect = d3.select('.district-select').on('change', function() {
			var district = $(this).val();
			updateData(district);
			updateDistributionChart(district);
		});
		districtSelect.selectAll('option')
			.data(App.districts)
			.enter().append('option')
				.property('value', function(d) { return d; })
				.text(function(d) { return d; });
		districtSelect.property('value', name);
		
		
		// update data text
		var updateData = function(district) {
			$('.district-name-text').html('<u>District</u>: ' + district);
		};
		updateData(name);

		// build the chart
		var margin = {top: 20, right: 20, bottom: 40, left: 80};
		var width = 960 - margin.left - margin.right;
		var height = 400 - margin.top - margin.bottom;
   		var chart = d3.select('.district-distribution-chart')
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
			
		var legend = d3.select('.legend')
			.attr('width', 500);
		
		
		var updateDistributionChart = function(district) {
			var academyColorScale = d3.scale.category20();

			var districtData = [];
			for (var i = 0; i < App.spendingCategories.length; i++) {
				var cat = App.spendingCategories[i];
				var data = {
					name: cat,
					values: [],
					sum: 0
				};
				
				// loop through each academy and add value to sector data
				App.academies.filter(function(d) { return d['School District'] === district; })
					.forEach(function(d) {
						var val = Util.strToFloat(d[cat]);
						if (!isNaN(val)) {
							data.values.push({
								academy: d['Academy Name'] + ' (' + d['High School'] + ')',
								category: cat,
								value: val,
								y0: data.sum,
								y1: data.sum += val
							});
						}
					});
					
				districtData.push(data);
			}
			
			// fix y-axis scale
			y.domain([0, d3.max(districtData.map(function(d) { return d.sum; }))]);
			yAxis.scale(y);
			yAxisG.call(yAxis);

			var barGroups = chart.selectAll('.bar-group')
				.data(districtData);
			var newBarGroups = barGroups.enter().append('g')
				.attr('class', 'bar-group');
			newBarGroups.append('g')
				.attr('class', 'bars');
			newBarGroups.append('text')
				.attr('x', x.rangeBand() / 2);
			
			barGroups.transition()
				.attr('transform', function(d) { return 'translate(' + x(d.name) + ',0)'; });
			barGroups.exit().remove();
			
			// update actual bars
			var bars = barGroups.select('.bars').selectAll('.bar')
				.data(function(d) { return d.values; });
			bars.enter().append('rect')
				.attr('class', 'bar')
				.attr('width', x.rangeBand())
				.each(function() {
					$(this).tooltipster({
						trigger: 'hover',
	            		contentAsHTML: true,
	        	    	onlyOne: true,
	        	    	offsetX: x.rangeBand() / 2,
	 	          	 	offsetY: -5
	 				});
				});
			bars.transition()
				.style('fill', function(d) { return academyColorScale(d.academy); })
				.attr('y', function(d) { return y(d.y1); })
				.attr('height', function(d) { return y(d.y0) - y(d.y1); })
				.each('end', function(d) {
					var htmlStr = '';
					htmlStr += '<div class="sector-tooltip-academy">' + d.academy + '</div>';
					htmlStr += '<div class="sector-tooltip-value">' + d.category + ': <b>' + Util.monetize(d.value) + '</b></div>';
					$(this).tooltipster('content', htmlStr);
				});
			bars.exit().remove();
			
			// update text on bars
			barGroups.select('text')
				.attr('y', function(d) { return y(d.sum) - 4; })
				.text(function(d) { return Util.monetize(d.sum); });
			
			
			// update the legend
			var legendBarWidth = 80, legendBarHeight = 20;
			legend
				.attr('height', academyColorScale.domain().length * legendBarHeight)
				.attr('transform', 'translate(0,' + (height+80) + ')');
			var legendGroups = legend.selectAll('g')
				.data(academyColorScale.domain());
			var newLegendGroups = legendGroups.enter().append('g')
				.attr('transform', function(d, i) { return 'translate(0,' + (legendBarHeight * i) + ')'; });
			newLegendGroups.append('rect')
				.attr('width', legendBarWidth)
				.attr('height', legendBarHeight);
			newLegendGroups.append('text')
				.attr('transform', 'translate(' + (legendBarWidth+10) + ',15)');
				
			legendGroups.select('rect')
				.style('fill', function(d) { return academyColorScale(d); });
			legendGroups.select('text')
				.text(function(d) { return d; });
				
			legendGroups.exit().remove();
		};
		updateDistributionChart(name);
	};
})();
