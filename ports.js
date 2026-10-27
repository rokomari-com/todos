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
	// Row drag: forward document-level pointer events while a press that began on a list row is live.
	// Elm subscribes only while a drag exists. Focus loss or a buttonless move cancels a stuck drag.
	var live = false;
	var send = function (kind, e) {
		app.ports.dragEvents.send({ kind: kind, x: e ? e.clientX : 0, y: e ? e.clientY : 0, pageY: e ? e.pageY : 0 });
	};
	var end = function (kind, e) {
		if (!live) return;
		live = false;
		send(kind, e);
	};
	document.addEventListener('pointerdown', function (e) {
		live = !!(e.target.closest && e.target.closest('.todo-list li'));
	}, { passive: true, capture: true });
	document.addEventListener('pointermove', function (e) {
		if (!live) return;
		if (e.buttons === 0) return end('cancel', e);
		send('move', e);
	}, { passive: true });
	document.addEventListener('pointerup', function (e) { end('up', e); }, { passive: true });
	document.addEventListener('pointercancel', function (e) { end('cancel', e); }, { passive: true });
	window.addEventListener('blur', function () { end('cancel'); });
	document.addEventListener('visibilitychange', function () { if (document.hidden) end('cancel'); });
	// Clipboard: async API first; hidden-textarea + execCommand fallback (insecure origins, older Safari).
	var copyFallback = function (text) {
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.top = '-1000px';
		ta.style.opacity = '0';
		var prev = document.activeElement;
		document.body.appendChild(ta);
		ta.select();
		var ok = false;
		try { ok = document.execCommand('copy'); } catch (e) {}
		document.body.removeChild(ta);
		if (prev && prev.focus) prev.focus();
		return ok;
	};
	app.ports.copyText.subscribe(function (text) {
		var done = function (ok) { app.ports.copied.send(!!ok); };
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(copyFallback(text)); });
		} else {
			done(copyFallback(text));
		}
	});
	app.ports.setStorage.subscribe(function (state) {
		try {
			localStorage.setItem(KEY, JSON.stringify(state));
		} catch (e) {}
	});
})();
