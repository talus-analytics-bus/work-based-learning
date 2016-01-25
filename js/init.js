var App = App || {};

(function() {
	var LOCAL_VERSION = (typeof App.academies !== 'undefined');
	
	var init = function() {	
		// assign ids
		Util.assignId(App.academies);
		Util.assignId(App.events);
		
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
			});
	}
})();