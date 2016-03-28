var App = App || {};

(function() {
	App.initLogin = function() {
		$('.login-button').click(function() { login(); });
		$('.password-input').on('keyup', function(e) {
			if (e.which === 13) login();
		});
	};
	
	var login = function() {
		NProgress.start();
		$.noty.closeAll();
		var username = $('.username-input').val();
		var password = $('.password-input').val();
		$.get('php/login.php', {
			username: username,
			password: password
		}, function(data) {
			console.log(data);
			var response = $.parseJSON(data);						
			if (response.error) noty({layout: 'top', type: 'warning', text: '<b>Error!</b><br>' + response.error});
			else hasher.setHash('');
			NProgress.done();
		});
	};
})();
