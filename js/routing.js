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
            loadPage('home', App.initHome);
        });
        crossroads.addRoute('/login', function() {
        	setBreadcrumbs('login');
        	loadTemplate('login');
        	App.initLogin();
        	window.scrollTo(0, 0);
        });
        crossroads.addRoute('/list', function() {
        	loadPage('list', App.initList);
        });
        crossroads.addRoute('/academy/:{id}:', function(id) {
        	loadPage('academy', App.initAcademy, id);
        });
        crossroads.addRoute('/sector/:{name}:', function(name) {
        	loadPage('sector', App.initSector, name);
        });
        crossroads.addRoute('/district/:{name}:', function(name) {
        	loadPage('district', App.initDistrict, name);
        });
        crossroads.addRoute('/employer/:{name}:', function(name) {
        	loadPage('employer', App.initEmployer, name);
        });

        // setup hasher for subscribing to hash changes and browser history
        hasher.prependHash = '';
        hasher.initialized.add(parseHash); //parse initial hash
        hasher.changed.add(parseHash); //parse hash changes
        hasher.init(); //start listening for history change
    };
    
 	var loadPage = function(pageName, pageFunction, data) {
		$.noty.closeAll();
		$.get('php/login_check.php', function(res) {
			var loginData = $.parseJSON(res);
			if (loginData.error) {
				hasher.setHash('login');
				noty({type: 'warning', text: loginData.error});
			} else {
				setBreadcrumbs(pageName);
				loadTemplate(pageName);
				pageFunction(data);
				window.scrollTo(0, 0);
			}
		});
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
