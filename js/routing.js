// Routing, hash changes, and navigation
function Routing(app) {
    this.parseHash = function(newHash) {
        crossroads.parse(newHash);
    };
    
    this.loadTemplate = function(page, data) {
        $('#page-content').html(app.templates[page](data));
    };
    
    this.initializeRoutes = function() {
        var self = this;
        
        // setup crossroads for routing
        crossroads.addRoute('/', function() {
            self.loadTemplate('home');
            app.initHome();
            window.scrollTo(0, 0);
        });
        crossroads.addRoute('/about', function() {
        	self.loadTemplate('about');
        	window.scrollTo(0, 0);
        });

        // setup hasher for subscribing to hash changes and browser history
        hasher.prependHash = '';
        hasher.initialized.add(this.parseHash); //parse initial hash
        hasher.changed.add(this.parseHash); //parse hash changes
        hasher.init(); //start listening for history change
    };
}