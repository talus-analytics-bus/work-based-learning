var App = App || {};

(function() {
	var init = function(error, academies, events) {
		App.academies = academies;
		App.events = events;
		
		// assign ids
		Util.assignId(App.academies);
		Util.assignId(App.events);
		
		App.initialize();
		Routing.precompileTemplates();	
		Routing.initializeRoutes();
	};
	
	queue()
		.defer(d3.tsv, 'data/academies.tsv')
		.defer(d3.tsv, 'data/events.tsv')
		.await(init);
})();