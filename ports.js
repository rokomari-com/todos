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
	// Auto-grow fallback for browsers without field-sizing (Safari/Firefox).
	var SEL = 'textarea.new-todo, textarea.edit';
	var native = window.CSS && CSS.supports && CSS.supports('field-sizing', 'content');
	var fit = function (el) {
		if (native || !el.offsetParent) return;
		el.style.height = 'auto';
		el.style.height = el.scrollHeight + 'px';
	};
	var fitIfFallback = function (el) {
		if (el.matches && el.matches(SEL)) fit(el);
	};
	['input', 'focusin'].forEach(function (ev) {
		// Capture: Elm's onInput stops propagation.
		document.addEventListener(ev, function (e) { fitIfFallback(e.target); }, true);
	});
	var watched = null;
	var syncNew = function () {
		var nt = document.getElementById('new-todo');
		if (!nt) return;
		if (nt !== watched && window.ResizeObserver) {
			watched = nt;
			new ResizeObserver(syncNew).observe(nt);
		}
		fit(nt);
		document.documentElement.style.setProperty('--nt-extra', Math.max(0, nt.offsetHeight - 65) + 'px');
	};
	// Elm re-renders (field cleared, edit field mounted, value restored) without input events.
	new MutationObserver(function (muts) {
		syncNew();
		muts.forEach(function (m) {
			m.addedNodes.forEach(function (n) {
				if (n.nodeType !== 1) return;
				if (n.matches(SEL)) fit(n);
				n.querySelectorAll && n.querySelectorAll(SEL).forEach(fit);
			});
			if (m.type === 'attributes') fitIfFallback(m.target);
		});
	}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] });
	window.addEventListener('resize', function () { document.querySelectorAll(SEL).forEach(fit); syncNew(); });
	var app = Elm.Main.init({ flags: flags });
	app.ports.setStorage.subscribe(function (state) {
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch (e) {}
	});
})();
