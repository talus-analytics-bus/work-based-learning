var App = App || {};

(function() {
	var LOCAL_VERSION = (typeof App.academies !== 'undefined');
	
	var init = function() {	
		// get unique list of sectors
		var sectors = App.academies
			.map(function(d) { return d['Primary CTE Industry Sector']; })
			.filter(function(d) { return d !== '#N/A'; });
		App.sectors = Util.getUnique(sectors);
		
		// get unique list of districts
		var districts = App.academies
			.map(function(d) { return d['School District']; })
			.filter(function(d) { return d !== '#N/A'; });
		App.districts = Util.getUnique(districts);
		
		// assign ids
		Util.assignId(App.academies);
		Util.assignId(App.events);
		Util.assignId(App.districts);
		
		App.initialize();
		Routing.precompileTemplates();	
		Routing.initializeRoutes();
	};
	
	if (LOCAL_VERSION) {
		init();
	} else {
		queue()
			.defer(d3.tsv, 'data/academies.tsv')
			.defer(d3.tsv, 'data/events.tsv')
			.await(function(error, academies, events) {
				App.academies = academies;
				App.events = events;
				init();
			});
	}
})();