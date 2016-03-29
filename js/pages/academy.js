var App = App || {};

(function() {
	App.initAcademy = function(id) {
		if (typeof id === 'undefined') var id = 0;
		
		// fill academy select
		var academySelect = d3.select('.academy-select').on('change', function() {
			var academyId = $(this).val();
			var academy = App.academies.filter(function(d) { return d.id === +academyId; })[0];
			updateAll(academy);
		});
		academySelect.selectAll('option')
			.data(App.academies)
			.enter().append('option')
				.property('value', function(d) { return d.id; })
				.text(function(d) { return d.academy_name + ' (' + d.high_school + ')'; });
		academySelect.property('value', id);
		
		
		var academy = App.academies.filter(function(d) { return d.id === +id; })[0];
		var currAcademy = academy;
		
		// update data function
		var updateData = function(a) {
			currAcademy = a;
			$('.academy-name-text').text(a.academy_name);
			$('.academy-high-school-text').text(a.high_school);
			$('.academy-district-text').text(a.school_district)
				.click(function() {
					hasher.setHash('district/' + a.school_district);
				});
			$('.academy-sector-text').text(a.primary_cte_industry)
				.click(function() {
					hasher.setHash('sector/' + a.primary_cte_industry);
				});
			$('.academy-county-text').text(a.county);
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
			.domain(App.spendingCategories.map(function(d) { return d.name; }))
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
		
		
		var updateDistributionChart = function(a) {
			// fix y-axis scale
			var values = App.spendingCategories.map(function(d) { return Util.strToFloat(a[d.attr]); });
			y.domain([0, 1.1*d3.max(values)]);
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
				.attr('transform', function(d) { return 'translate(' + x(d.name) + ',0)'; });
			barGroups.select('rect').transition()
				.attr('y', function(d) { return y(a[d.attr]); })
				.attr('height', function(d) { return height - y(a[d.attr]); });
			barGroups.select('text').transition()
				.attr('y', function(d) { return y(a[d.attr]) - 4; })
				.text(function(d) { return Util.monetize(a[d.attr]); });
				
			barGroups.exit().remove();
		};
		
		// table showing employer volunteer work
		var updateEventTable = function(a, stat) {
			if (typeof stat === 'undefined') var stat = $('.event-list-btn-group .btn.active').attr('stat');
			
			$('.academy-event-list thead td:nth-child(2)').text((stat === 'hours') ? 'Hours' : 'Donations');
			
			var employers = App.getEmployerData(a);			
			employers.sort(function(a, b) {
				if (+a[stat] > +b[stat]) return -1;
				else if (+a[stat] < +b[stat]) return 1;
				else return 0;
			});

			if (employers.length === 0) {
				$('.event-list-container').hide();
			} else {
				$('.event-list-container').show();
				
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
			updateEventTable(currAcademy, $this.attr('stat'));
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
			var employers = App.getEmployerData(a);
			employers = employers.filter(function(d) { return d.value > 0; });
			
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
			newNodes.append('title');
			newNodes.append('circle');
			newNodes.append('text');
				
			nodes.transition()
				.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
				.style('display', function(d) { return (d.depth === 0) ? 'none' : 'block'; });
			nodes.select('title')
				.text(function(d) { return d.employer; });
			nodes.select('circle')
				.attr('r', function(d) { return d.r; })
				.style('fill', function(d) { return colorScale(d.employer); });
			nodes.select('text')
				.style('display', function(d) { return (d.percOfMax < 0.1) ? 'none' : 'block'; })
				.html(function(d) { return d.employer; });
			nodes.on('click', function(d) {
				hasher.setHash('employer/' + d.employer);
			});
			nodes.each(function(d) {
				var $this = $(this);
				$this.tooltipster('option', 'offsetX', d.r);
				$this.tooltipster('option', 'offsetY', -d.r);
				$this.tooltipster('content', d.employer);
			});
			nodes.exit().remove();
		};
		
		
		var updateAll = function(academy) {
			updateData(academy);
			updateDistributionChart(academy);
			updateEventTable(academy);
			updateBubbleChart(academy);			
		};
		updateAll(academy);
	};
})();
