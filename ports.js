(function () {
	var KEY = 'elm-todo-save';
	var flags = null;
	try {
		var stored = localStorage.getItem(KEY);
		if (stored) {
			try {
				flags = JSON.parse(stored);
			} catch (e) {
				// Keep the unparseable data before Elm overwrites it.
				localStorage.setItem(KEY + '-corrupt', stored);
			}
		}
	} catch (e) {}
	var app = Elm.Main.init({ flags: flags });
	app.ports.setStorage.subscribe(function (state) {
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch (e) {}
	});
})();
