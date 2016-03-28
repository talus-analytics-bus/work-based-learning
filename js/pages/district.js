var App = App || {};

(function() {
	App.initDistrict = function(name) {
		if (typeof name === 'undefined') var name = App.academies[0].school_district;
		
		// fill sector select
		var districtSelect = d3.select('.district-select').on('change', function() {
			var district = $(this).val();
			updateData(district);
			updateDistributionChart(district);
			updateEventTable(district);
			updateBubbleChart(district);
		});
		districtSelect.selectAll('option')
			.data(App.districts)
			.enter().append('option')
				.property('value', function(d) { return d.school_district; })
				.text(function(d) { return d.school_district; });
		districtSelect.property('value', name);
		
		
		// update data text
		var currDistrict = name;
		var updateData = function(district) {
			currDistrict = district;			
			$('.district-name-text').html(district);
			
			var academies = App.academies.filter(function(d) { return d.school_district === district; });
			var county = academies[0].County;
			$('.district-county-text').html(county);
			
			var highSchools = Util.getUnique(academies.map(function(d) { return d.high_school; }));
			$('.district-high-school-text').html(highSchools.join(', '));
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
			
		var legend = d3.select('.legend')
			.attr('width', 500);
		
		
		var updateDistributionChart = function(district) {
			var academyColorScale = d3.scale.category20c();

			var districtData = [];
			for (var i = 0; i < App.spendingCategories.length; i++) {
				var cat = App.spendingCategories[i];
				var data = {
					name: cat,
					values: [],
					sum: 0
				};
				
				// loop through each academy and add value to sector data
				App.academies.filter(function(d) { return d.school_district === district; })
					.forEach(function(d) {
						var val = Util.strToFloat(d[cat]);
						if (!isNaN(val)) {
							data.values.push({
								academy: d.academy_name + ' (' + d.high_school + ')',
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



		// table showing employer volunteer work
		var updateEventTable = function(a, stat) {
			if (typeof stat === 'undefined') var stat = $('.event-list-btn-group .btn.active').attr('stat');
			
			$('.academy-event-list thead td:nth-child(2)').text((stat === 'hours') ? 'Hours' : 'Donations');
			
			var employers = getEmployerData(a);	

			if (employers.length === 0) {
				$('.event-list-container').hide();
				$('.empty-event-list-container').show();
			} else {
				$('.event-list-container').show();
				$('.empty-event-list-container').hide();

				employers.sort(function(a, b) {
					if (+a[stat] > +b[stat]) return -1;
					else if (+a[stat] < +b[stat]) return 1;
					else return 0;
				});
				employers = employers.slice(0, 10);		
				
				var eventRows = d3.select('.academy-event-list tbody').selectAll('tr')
					.data(employers);
				var newEventRows = eventRows.enter().append('tr');
				for (var i = 0; i < 2; i++) newEventRows.append('td');
				
				eventRows.select('td:first-child').text(function(d) { return d.employer; });
				eventRows.select('td:nth-child(2)').text(function(d) {
					if (stat === 'hours') return Util.comma(d[stat]);
					else return Util.monetize(d[stat]);
				});
				eventRows.on('click', function(d) {
					hasher.setHash('employer/' + d.employer);
				});
				
				eventRows.exit().remove();
			}
		};
		$('.event-list-btn-group .btn').click(function() {
			var $this = $(this);
			$this.addClass('active');
			$this.siblings().removeClass('active');
			updateEventTable(currDistrict, $this.attr('stat'));
		});


		// set up bubble chart
		var diameter = 400;
		var bubbleChartMargin = {top: 0, left: 80, right: 80, bottom: 0};
		var colorScale = d3.scale.category20c();
		var bubble = d3.layout.pack()
			.sort(null)
			.size([diameter, diameter])
			.padding(1.5);
		var bubbleChart = d3.select('.employer-bubble-chart')
			.attr('width', diameter + bubbleChartMargin.left + bubbleChartMargin.right)
			.attr('height', diameter + bubbleChartMargin.top + bubbleChartMargin.bottom)
			.append('g')
				.attr('transform', 'translate(' + bubbleChartMargin.left + ',' + bubbleChartMargin.top + ')');
		
		var updateBubbleChart = function(a) {
			var employers = getEmployerData(a);
			if (employers.length > 0) {
				var nodes = bubbleChart.selectAll('.node')
					.data(bubble.nodes({children: employers}));
				var newNodes = nodes.enter().append('g')
					.attr('class', 'node')
					.each(function() {
						$(this).tooltipster({
							onlyOne: true,
							contentAsHTML: true
						});
					});
				newNodes.append('circle');
					
				nodes.transition()
					.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
					.style('display', function(d) { return (d.depth === 0) ? 'none' : 'block'; });
				nodes.select('circle')
					.attr('r', function(d) { return d.r; })
					.style('fill', function(d) { return colorScale(d.employer); });
				nodes.on('click', function(d) {
					hasher.setHash('employer/' + d.employer);
				});
				nodes.each(function(d) {
					var $this = $(this);
					$this.tooltipster('option', 'offsetX', d.r);
					$this.tooltipster('option', 'offsetY', -d.r);
					$this.tooltipster('content', '<div>' + d.employer + '</div><div>' + Util.comma(d.hours) + ' hours');
				});
				nodes.exit().remove();
			}
		};
		updateEventTable(name);
		updateBubbleChart(name);
	};
	
	var getEmployerData = function(a) {
		var employerInfo = {};
		var maxHours = 0;
		for (var i = 0; i < App.events.length; i++) {
			var event = App.events[i];
			if (event.school_district === a) {
				var emp = event.Employer;
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
})();
