var Routing = {};

(function() {
	// Precompiles all html handlebars templates on startup.
	// Compiling is front-loaded so the compiling does not happen on page changes. 
	var templates = {};
	Routing.precompileTemplates = function() {
	    $("script[type='text/x-handlebars-template']").each(function (i, e) {
	        templates[e.id.replace("-template", "")] = Handlebars.compile($(e).html());
	    });
	};	
    
    Routing.initializeRoutes = function() {        
        // setup crossroads for routing
        crossroads.addRoute('/', function() {
            loadTemplate('home');
            App.initHome();
            window.scrollTo(0, 0);
        });
        crossroads.addRoute('/academy/{id}', function(id) {
        	loadTemplate('academy');
        	App.initAcademy(id);
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/sector/{name}', function(name) {
        	loadTemplate('sector');
        	App.initSector(name);
        	window.scrollTo(0, 0);
        });

        // setup hasher for subscribing to hash changes and browser history
        hasher.prependHash = '';
        hasher.initialized.add(parseHash); //parse initial hash
        hasher.changed.add(parseHash); //parse hash changes
        hasher.init(); //start listening for history change
    };
	
    var parseHash = function(newHash) { crossroads.parse(newHash); };
    var loadTemplate = function(page, data) {
        $('#page-content').html(templates[page](data));
    };
})();
