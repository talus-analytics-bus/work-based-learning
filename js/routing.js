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
            setBreadcrumbs('home');
            window.scrollTo(0, 0);
        });
        crossroads.addRoute('/list', function() {
        	loadTemplate('list');
        	App.initList();
            setBreadcrumbs('list');
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/academy/:{id}:', function(id) {
        	loadTemplate('academy');
        	App.initAcademy(id);
            setBreadcrumbs('academy');
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/sector/:{name}:', function(name) {
        	loadTemplate('sector');
        	App.initSector(name);
            setBreadcrumbs('sector');
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/district/:{name}:', function(name) {
        	loadTemplate('district');
        	App.initDistrict(name);
            setBreadcrumbs('district');
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/employer/:{name}:', function(name) {
        	loadTemplate('employer');
        	App.initEmployer(name);
            setBreadcrumbs('employer');
        	window.scrollTo(0, 0);
        });

        // setup hasher for subscribing to hash changes and browser history
        hasher.prependHash = '';
        hasher.initialized.add(parseHash); //parse initial hash
        hasher.changed.add(parseHash); //parse hash changes
        hasher.init(); //start listening for history change
    };
    
    var setBreadcrumbs = function(page) {
    	var htmlStr = '<div class="home-link bread-link">Home</div>';
    	if (page !== 'home') {
    		htmlStr += '&nbsp; > &nbsp;<div class="' + page + '-link bread-link">' + page.charAt(0).toUpperCase() + page.slice(1) + '</div>';
    	}
    	$('.breadcrumbs-bar').html(htmlStr);
    	$('.home-link').click(function() { hasher.setHash(''); });
    	$('.' + page + '-link').click(function() { hasher.setHash(page); });
    };
	
    var parseHash = function(newHash) { crossroads.parse(newHash); };
    var loadTemplate = function(page, data) {
        $('#page-content').html(templates[page](data));
    };
})();
