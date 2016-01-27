var App = App || {};

(function() {
	var LOCAL_VERSION = (typeof App.academies !== 'undefined');
	
	var init = function() {			
		App.initialize();
		Routing.precompileTemplates();	
		Routing.initializeRoutes();
	};
	
	if (LOCAL_VERSION) {
		init();
	} else {
		queue()
			.defer(d3.tsv, 'data/academies.tsv')
			.defer(d3.tsv, 'data/districts.tsv')
			.defer(d3.tsv, 'data/employers.tsv')
			.defer(d3.tsv, 'data/events.tsv')
			.await(function(error, academies, districts, employers, events) {
				App.academies = academies;
				App.districts = districts;
				App.employers = employers;
				App.events = events;
				init();
			});
	}
})();