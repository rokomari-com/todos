(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**_UNUSED/''//*//**/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}
var $author$project$Main$UrlChanged = function (a) {
	return {$: 'UrlChanged', a: a};
};
var $author$project$Main$UrlRequested = function (a) {
	return {$: 'UrlRequested', a: a};
};
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$application = _Browser_application;
var $author$project$Main$GotTime = F2(
	function (a, b) {
		return {$: 'GotTime', a: a, b: b};
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $author$project$Main$AnyCategory = {$: 'AnyCategory'};
var $author$project$Main$emptySaved = {categories: _List_Nil, categoryFilter: $author$project$Main$AnyCategory, entries: _List_Nil, field: '', newCategory: $elm$core$Maybe$Nothing, nextCategoryId: 1, uid: 0};
var $author$project$Main$followFilter = F2(
	function (f, current) {
		switch (f.$) {
			case 'OnlyCategory':
				var id = f.a;
				return $elm$core$Maybe$Just(id);
			case 'NoCategory':
				return $elm$core$Maybe$Nothing;
			default:
				return current;
		}
	});
var $elm$time$Time$Name = function (a) {
	return {$: 'Name', a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 'Offset', a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 'Zone', a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$here = _Time_here(_Utils_Tuple0);
var $elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(
			A3($elm$core$List$foldl, $elm$core$Basics$max, x, xs));
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$maxId = function (entries) {
	return A2(
		$elm$core$Maybe$withDefault,
		-1,
		$elm$core$List$maximum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.id;
				},
				entries)));
};
var $elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var $elm$time$Time$millisToPosix = $elm$time$Time$Posix;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $author$project$Main$OnlyCategory = function (a) {
	return {$: 'OnlyCategory', a: a};
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$core$Basics$ge = _Utils_ge;
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Main$lenientField = F3(
	function (name, dec, fallback) {
		return $elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2($elm$json$Json$Decode$field, name, dec),
					$elm$json$Json$Decode$succeed(fallback)
				]));
	});
var $elm$json$Json$Decode$map4 = _Json_map4;
var $elm$core$Basics$modBy = _Basics_modBy;
var $author$project$Main$paletteSize = 8;
var $author$project$Main$Circle = {$: 'Circle'};
var $author$project$Main$Diamond = {$: 'Diamond'};
var $author$project$Main$Square = {$: 'Square'};
var $author$project$Main$Triangle = {$: 'Triangle'};
var $author$project$Main$allShapes = _List_fromArray(
	[$author$project$Main$Circle, $author$project$Main$Square, $author$project$Main$Diamond, $author$project$Main$Triangle]);
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$shapeForId = function (id) {
	return A2(
		$elm$core$Maybe$withDefault,
		$author$project$Main$Circle,
		$elm$core$List$head(
			A2(
				$elm$core$List$drop,
				A2(
					$elm$core$Basics$modBy,
					$elm$core$List$length($author$project$Main$allShapes),
					id - 1),
				$author$project$Main$allShapes)));
};
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $author$project$Main$shapeKey = function (s) {
	switch (s.$) {
		case 'Circle':
			return 'circle';
		case 'Square':
			return 'square';
		case 'Diamond':
			return 'diamond';
		default:
			return 'triangle';
	}
};
var $author$project$Main$shapeFromKey = function (k) {
	return $elm$core$List$head(
		A2(
			$elm$core$List$filter,
			function (s) {
				return _Utils_eq(
					$author$project$Main$shapeKey(s),
					k);
			},
			$author$project$Main$allShapes));
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$core$String$trim = _String_trim;
var $author$project$Main$categoryDecoder = A5(
	$elm$json$Json$Decode$map4,
	F4(
		function (id, name, color, shape) {
			return {
				color: ((color >= 0) && (_Utils_cmp(color, $author$project$Main$paletteSize) < 0)) ? color : A2($elm$core$Basics$modBy, $author$project$Main$paletteSize, id - 1),
				id: id,
				name: $elm$core$String$trim(name),
				shape: A2(
					$elm$core$Maybe$withDefault,
					$author$project$Main$shapeForId(id),
					A2($elm$core$Maybe$andThen, $author$project$Main$shapeFromKey, shape))
			};
		}),
	A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'name', $elm$json$Json$Decode$string),
	A3($author$project$Main$lenientField, 'color', $elm$json$Json$Decode$int, -1),
	A3(
		$author$project$Main$lenientField,
		'shape',
		A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string),
		$elm$core$Maybe$Nothing));
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $author$project$Main$maxCategories = 12;
var $elm$core$String$toLower = _String_toLower;
var $author$project$Main$normName = A2($elm$core$Basics$composeR, $elm$core$String$trim, $elm$core$String$toLower);
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Main$cleanCategories = A2(
	$elm$core$Basics$composeR,
	A2(
		$elm$core$List$foldl,
		F2(
			function (c, acc) {
				return ($elm$core$String$isEmpty(c.name) || A2(
					$elm$core$List$any,
					function (x) {
						return _Utils_eq(x.id, c.id) || _Utils_eq(
							$author$project$Main$normName(x.name),
							$author$project$Main$normName(c.name));
					},
					acc)) ? acc : _Utils_ap(
					acc,
					_List_fromArray(
						[c]));
			}),
		_List_Nil),
	$elm$core$List$take($author$project$Main$maxCategories));
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $author$project$Main$Entry = F8(
	function (description, completed, editing, id, category, completedAt, archivedAt, order) {
		return {archivedAt: archivedAt, category: category, completed: completed, completedAt: completedAt, description: description, editing: editing, id: id, order: order};
	});
var $author$project$Main$andMap = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $author$project$Main$optionalTime = function (name) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				name,
				A2(
					$elm$json$Json$Decode$map,
					A2($elm$core$Basics$composeL, $elm$core$Maybe$Just, $elm$time$Time$millisToPosix),
					$elm$json$Json$Decode$int)),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			]));
};
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $author$project$Main$entryDecoder = A3(
	$elm$json$Json$Decode$map2,
	$elm$core$Tuple$pair,
	A2(
		$author$project$Main$andMap,
		A3($author$project$Main$lenientField, 'order', $elm$json$Json$Decode$int, -1),
		A2(
			$author$project$Main$andMap,
			$author$project$Main$optionalTime('archivedAt'),
			A2(
				$author$project$Main$andMap,
				$author$project$Main$optionalTime('completedAt'),
				A2(
					$author$project$Main$andMap,
					A3(
						$author$project$Main$lenientField,
						'category',
						$elm$json$Json$Decode$nullable($elm$json$Json$Decode$int),
						$elm$core$Maybe$Nothing),
					A2(
						$author$project$Main$andMap,
						A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$int),
						A2(
							$author$project$Main$andMap,
							$elm$json$Json$Decode$succeed(false),
							A2(
								$author$project$Main$andMap,
								A2($elm$json$Json$Decode$field, 'completed', $elm$json$Json$Decode$bool),
								A2(
									$author$project$Main$andMap,
									A2($elm$json$Json$Decode$field, 'description', $elm$json$Json$Decode$string),
									$elm$json$Json$Decode$succeed($author$project$Main$Entry))))))))),
	A3(
		$author$project$Main$lenientField,
		'type',
		A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string),
		$elm$core$Maybe$Nothing));
var $author$project$Main$NoCategory = {$: 'NoCategory'};
var $author$project$Main$filterDecoder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2($elm$json$Json$Decode$map, $author$project$Main$OnlyCategory, $elm$json$Json$Decode$int),
			A2(
			$elm$json$Json$Decode$map,
			function (k) {
				return (k === 'none') ? $author$project$Main$NoCategory : $author$project$Main$AnyCategory;
			},
			$elm$json$Json$Decode$string),
			$elm$json$Json$Decode$succeed($author$project$Main$AnyCategory)
		]));
var $author$project$Main$legacyCategories = _List_fromArray(
	[
		{color: 0, id: 1, name: 'Personal', shape: $author$project$Main$Circle},
		{color: 1, id: 2, name: 'Work', shape: $author$project$Main$Square}
	]);
var $author$project$Main$legacyId = function (key) {
	switch (key) {
		case 'personal':
			return $elm$core$Maybe$Just(1);
		case 'work':
			return $elm$core$Maybe$Just(2);
		default:
			return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (_v0.$ === 'Just') {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Main$lenientList = function (dec) {
	return A2(
		$elm$json$Json$Decode$map,
		$elm$core$List$filterMap($elm$core$Basics$identity),
		$elm$json$Json$Decode$list(
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, dec),
						$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
					]))));
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$json$Json$Decode$map5 = _Json_map5;
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Main$findCategory = F2(
	function (cats, id) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (c) {
					return _Utils_eq(c.id, id);
				},
				cats));
	});
var $author$project$Main$validCategory = F2(
	function (cats, mid) {
		if (mid.$ === 'Just') {
			var id = mid.a;
			return _Utils_eq(
				A2($author$project$Main$findCategory, cats, id),
				$elm$core$Maybe$Nothing) ? $elm$core$Maybe$Nothing : mid;
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $author$project$Main$validFilter = F2(
	function (cats, f) {
		switch (f.$) {
			case 'OnlyCategory':
				var id = f.a;
				return _Utils_eq(
					A2($author$project$Main$findCategory, cats, id),
					$elm$core$Maybe$Nothing) ? $author$project$Main$AnyCategory : f;
			case 'NoCategory':
				return $elm$core$List$isEmpty(cats) ? $author$project$Main$AnyCategory : f;
			default:
				return f;
		}
	});
var $author$project$Main$savedDecoder = A2(
	$elm$json$Json$Decode$andThen,
	$elm$core$Basics$identity,
	A5(
		$elm$json$Json$Decode$map4,
		F4(
			function (pairs, field, uid, stored) {
				return A6(
					$elm$json$Json$Decode$map5,
					F5(
						function (newCat, filter, legacyNew, legacyFilter, nextStored) {
							var legacy = _Utils_eq(stored, $elm$core$Maybe$Nothing) && A2(
								$elm$core$List$any,
								function (_v1) {
									var t = _v1.b;
									return !_Utils_eq(
										A2($elm$core$Maybe$andThen, $author$project$Main$legacyId, t),
										$elm$core$Maybe$Nothing);
								},
								pairs);
							var cats = legacy ? $author$project$Main$legacyCategories : A2($elm$core$Maybe$withDefault, _List_Nil, stored);
							var entries = A2(
								$elm$core$List$map,
								function (_v0) {
									var e = _v0.a;
									var t = _v0.b;
									return _Utils_update(
										e,
										{
											category: A2(
												$author$project$Main$validCategory,
												cats,
												legacy ? A2($elm$core$Maybe$andThen, $author$project$Main$legacyId, t) : (_Utils_eq(stored, $elm$core$Maybe$Nothing) ? $elm$core$Maybe$Nothing : e.category))
										});
								},
								pairs);
							return {
								categories: cats,
								categoryFilter: A2(
									$author$project$Main$validFilter,
									cats,
									legacy ? A2(
										$elm$core$Maybe$withDefault,
										$author$project$Main$AnyCategory,
										A2(
											$elm$core$Maybe$map,
											$author$project$Main$OnlyCategory,
											A2($elm$core$Maybe$andThen, $author$project$Main$legacyId, legacyFilter))) : filter),
								entries: entries,
								field: field,
								newCategory: A2(
									$author$project$Main$validCategory,
									cats,
									legacy ? A2($elm$core$Maybe$andThen, $author$project$Main$legacyId, legacyNew) : newCat),
								nextCategoryId: A2(
									$elm$core$Basics$max,
									nextStored,
									1 + A2(
										$elm$core$Maybe$withDefault,
										0,
										$elm$core$List$maximum(
											A2(
												$elm$core$List$map,
												function ($) {
													return $.id;
												},
												cats)))),
								uid: uid
							};
						}),
					A3(
						$author$project$Main$lenientField,
						'newCategory',
						$elm$json$Json$Decode$nullable($elm$json$Json$Decode$int),
						$elm$core$Maybe$Nothing),
					A3($author$project$Main$lenientField, 'categoryFilter', $author$project$Main$filterDecoder, $author$project$Main$AnyCategory),
					A3(
						$author$project$Main$lenientField,
						'newType',
						A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string),
						$elm$core$Maybe$Nothing),
					A3(
						$author$project$Main$lenientField,
						'typeFilter',
						A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, $elm$json$Json$Decode$string),
						$elm$core$Maybe$Nothing),
					A3($author$project$Main$lenientField, 'nextCategoryId', $elm$json$Json$Decode$int, 1));
			}),
		A3(
			$author$project$Main$lenientField,
			'entries',
			$author$project$Main$lenientList($author$project$Main$entryDecoder),
			_List_Nil),
		A3($author$project$Main$lenientField, 'field', $elm$json$Json$Decode$string, ''),
		A3($author$project$Main$lenientField, 'uid', $elm$json$Json$Decode$int, 0),
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2(
					$elm$json$Json$Decode$field,
					'categories',
					A2(
						$elm$json$Json$Decode$map,
						A2($elm$core$Basics$composeL, $elm$core$Maybe$Just, $author$project$Main$cleanCategories),
						$author$project$Main$lenientList($author$project$Main$categoryDecoder))),
					$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
				]))));
var $elm$time$Time$utc = A2($elm$time$Time$Zone, 0, _List_Nil);
var $author$project$Main$Active = {$: 'Active'};
var $author$project$Main$All = {$: 'All'};
var $author$project$Main$ArchiveView = {$: 'ArchiveView'};
var $author$project$Main$Completed = {$: 'Completed'};
var $author$project$Main$ManageView = {$: 'ManageView'};
var $author$project$Main$visibilityFromUrl = function (url) {
	var _v0 = url.fragment;
	_v0$5:
	while (true) {
		if (_v0.$ === 'Just') {
			switch (_v0.a) {
				case '/active':
					return $author$project$Main$Active;
				case '/completed':
					return $author$project$Main$Completed;
				case '/archive':
					return $author$project$Main$ArchiveView;
				case '/categories':
					return $author$project$Main$ManageView;
				case '/all':
					return $author$project$Main$All;
				default:
					break _v0$5;
			}
		} else {
			break _v0$5;
		}
	}
	return $author$project$Main$Active;
};
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (result.$ === 'Ok') {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Main$withOrders = function (entries) {
	return A2(
		$elm$core$List$any,
		function (e) {
			return e.order < 0;
		},
		entries) ? A2(
		$elm$core$List$indexedMap,
		F2(
			function (i, e) {
				return _Utils_update(
					e,
					{order: i});
			}),
		entries) : entries;
};
var $author$project$Main$init = F3(
	function (flags, url, key) {
		var saved = A2(
			$elm$core$Result$withDefault,
			$author$project$Main$emptySaved,
			A2($elm$json$Json$Decode$decodeValue, $author$project$Main$savedDecoder, flags));
		return _Utils_Tuple2(
			{
				addError: $elm$core$Maybe$Nothing,
				announce: '',
				categories: saved.categories,
				categoryFilter: saved.categoryFilter,
				confirmingCategory: $elm$core$Maybe$Nothing,
				confirmingDelete: $elm$core$Maybe$Nothing,
				copyFlash: $elm$core$Maybe$Nothing,
				copyPending: $elm$core$Maybe$Nothing,
				copySeq: 0,
				drag: $elm$core$Maybe$Nothing,
				editBackup: $elm$core$Maybe$Nothing,
				editingCat: $elm$core$Maybe$Nothing,
				entries: $author$project$Main$withOrders(saved.entries),
				field: saved.field,
				key: key,
				menuDown: false,
				menuOpen: $elm$core$Maybe$Nothing,
				menuPointer: false,
				newCatName: '',
				newCategory: A2($author$project$Main$followFilter, saved.categoryFilter, saved.newCategory),
				nextCategoryId: saved.nextCategoryId,
				noRing: $elm$core$Maybe$Nothing,
				pressSeq: 0,
				pressing: $elm$core$Maybe$Nothing,
				returnTo: '#/active',
				uid: A2(
					$elm$core$Basics$max,
					saved.uid,
					1 + $author$project$Main$maxId(saved.entries)),
				visibility: $author$project$Main$visibilityFromUrl(url),
				zone: $elm$time$Time$utc
			},
			A2(
				$elm$core$Task$perform,
				$elm$core$Basics$identity,
				A3($elm$core$Task$map2, $author$project$Main$GotTime, $elm$time$Time$here, $elm$time$Time$now)));
	});
var $author$project$Main$Copied = function (a) {
	return {$: 'Copied', a: a};
};
var $author$project$Main$Tick = function (a) {
	return {$: 'Tick', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Main$DismissConfirm = {$: 'DismissConfirm'};
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$json$Json$Decode$lazy = function (thunk) {
	return A2(
		$elm$json$Json$Decode$andThen,
		thunk,
		$elm$json$Json$Decode$succeed(_Utils_Tuple0));
};
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $elm$core$String$words = _String_words;
var $author$project$Main$climbToConfirm = function (_v0) {
	return A2(
		$elm$json$Json$Decode$andThen,
		function (cls) {
			return A2(
				$elm$core$List$member,
				'confirm-delete',
				$elm$core$String$words(cls)) ? $elm$json$Json$Decode$succeed(true) : $elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2(
						$elm$json$Json$Decode$field,
						'parentElement',
						$elm$json$Json$Decode$lazy($author$project$Main$climbToConfirm)),
						$elm$json$Json$Decode$succeed(false)
					]));
		},
		A2(
			$elm$json$Json$Decode$field,
			'className',
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						$elm$json$Json$Decode$string,
						$elm$json$Json$Decode$succeed('')
					]))));
};
var $author$project$Main$insideConfirm = A2(
	$elm$json$Json$Decode$field,
	'target',
	$author$project$Main$climbToConfirm(_Utils_Tuple0));
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$Events$Document = {$: 'Document'};
var $elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$browser$Browser$Events$init = $elm$core$Task$succeed(
	A2($elm$browser$Browser$Events$State, _List_Nil, $elm$core$Dict$empty));
var $elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
		return 'd_';
	} else {
		return 'w_';
	}
};
var $elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			$elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {event: event, key: key};
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$browser$Browser$Events$spawn = F3(
	function (router, key, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			$elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						$elm$core$Platform$sendToSelf,
						router,
						A2($elm$browser$Browser$Events$Event, key, event));
				}));
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _v6) {
				var deads = _v6.a;
				var lives = _v6.b;
				var news = _v6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						$elm$core$List$cons,
						A3($elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_v4, pid, _v5) {
				var deads = _v5.a;
				var lives = _v5.b;
				var news = _v5.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _v2, _v3) {
				var deads = _v3.a;
				var lives = _v3.b;
				var news = _v3.c;
				return _Utils_Tuple3(
					deads,
					A3($elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2($elm$core$List$map, $elm$browser$Browser$Events$addKey, subs);
		var _v0 = A6(
			$elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.pids,
			$elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, $elm$core$Dict$empty, _List_Nil));
		var deadPids = _v0.a;
		var livePids = _v0.b;
		var makeNewPids = _v0.c;
		return A2(
			$elm$core$Task$andThen,
			function (pids) {
				return $elm$core$Task$succeed(
					A2(
						$elm$browser$Browser$Events$State,
						newSubs,
						A2(
							$elm$core$Dict$union,
							livePids,
							$elm$core$Dict$fromList(pids))));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$sequence(makeNewPids);
				},
				$elm$core$Task$sequence(
					A2($elm$core$List$map, $elm$core$Process$kill, deadPids))));
	});
var $elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _v0, state) {
		var key = _v0.key;
		var event = _v0.event;
		var toMessage = function (_v2) {
			var subKey = _v2.a;
			var _v3 = _v2.b;
			var node = _v3.a;
			var name = _v3.b;
			var decoder = _v3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : $elm$core$Maybe$Nothing;
		};
		var messages = A2($elm$core$List$filterMap, toMessage, state.subs);
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Platform$sendToApp(router),
					messages)));
	});
var $elm$browser$Browser$Events$subMap = F2(
	function (func, _v0) {
		var node = _v0.a;
		var name = _v0.b;
		var decoder = _v0.c;
		return A3(
			$elm$browser$Browser$Events$MySub,
			node,
			name,
			A2($elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager($elm$browser$Browser$Events$init, $elm$browser$Browser$Events$onEffects, $elm$browser$Browser$Events$onSelfMsg, 0, $elm$browser$Browser$Events$subMap);
var $elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var $elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return $elm$browser$Browser$Events$subscription(
			A3($elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var $elm$browser$Browser$Events$onClick = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'click');
var $elm$browser$Browser$Events$onKeyDown = A2($elm$browser$Browser$Events$on, $elm$browser$Browser$Events$Document, 'keydown');
var $author$project$Main$confirmSubs = function (model) {
	var _v0 = _Utils_Tuple2(model.confirmingDelete, model.confirmingCategory);
	if ((_v0.a.$ === 'Nothing') && (_v0.b.$ === 'Nothing')) {
		var _v1 = _v0.a;
		var _v2 = _v0.b;
		return $elm$core$Platform$Sub$none;
	} else {
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					$elm$browser$Browser$Events$onKeyDown(
					A2(
						$elm$json$Json$Decode$andThen,
						function (k) {
							return (k === 'Escape') ? $elm$json$Json$Decode$succeed($author$project$Main$DismissConfirm) : $elm$json$Json$Decode$fail('not escape');
						},
						A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string))),
					$elm$browser$Browser$Events$onClick(
					A2(
						$elm$json$Json$Decode$andThen,
						function (inside) {
							return inside ? $elm$json$Json$Decode$fail('inside') : $elm$json$Json$Decode$succeed($author$project$Main$DismissConfirm);
						},
						$author$project$Main$insideConfirm))
				]));
	}
};
var $author$project$Main$copied = _Platform_incomingPort('copied', $elm$json$Json$Decode$bool);
var $author$project$Main$DragCancel = {$: 'DragCancel'};
var $author$project$Main$DragEnded = {$: 'DragEnded'};
var $author$project$Main$DragFrame = {$: 'DragFrame'};
var $author$project$Main$DragMoved = F3(
	function (a, b, c) {
		return {$: 'DragMoved', a: a, b: b, c: c};
	});
var $elm$json$Json$Decode$float = _Json_decodeFloat;
var $author$project$Main$dragEvents = _Platform_incomingPort(
	'dragEvents',
	A2(
		$elm$json$Json$Decode$andThen,
		function (y) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (x) {
					return A2(
						$elm$json$Json$Decode$andThen,
						function (pageY) {
							return A2(
								$elm$json$Json$Decode$andThen,
								function (kind) {
									return $elm$json$Json$Decode$succeed(
										{kind: kind, pageY: pageY, x: x, y: y});
								},
								A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string));
						},
						A2($elm$json$Json$Decode$field, 'pageY', $elm$json$Json$Decode$float));
				},
				A2($elm$json$Json$Decode$field, 'x', $elm$json$Json$Decode$float));
		},
		A2($elm$json$Json$Decode$field, 'y', $elm$json$Json$Decode$float)));
var $elm$browser$Browser$AnimationManager$Time = function (a) {
	return {$: 'Time', a: a};
};
var $elm$browser$Browser$AnimationManager$State = F3(
	function (subs, request, oldTime) {
		return {oldTime: oldTime, request: request, subs: subs};
	});
var $elm$browser$Browser$AnimationManager$init = $elm$core$Task$succeed(
	A3($elm$browser$Browser$AnimationManager$State, _List_Nil, $elm$core$Maybe$Nothing, 0));
var $elm$browser$Browser$AnimationManager$now = _Browser_now(_Utils_Tuple0);
var $elm$browser$Browser$AnimationManager$rAF = _Browser_rAF(_Utils_Tuple0);
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$browser$Browser$AnimationManager$onEffects = F3(
	function (router, subs, _v0) {
		var request = _v0.request;
		var oldTime = _v0.oldTime;
		var _v1 = _Utils_Tuple2(request, subs);
		if (_v1.a.$ === 'Nothing') {
			if (!_v1.b.b) {
				var _v2 = _v1.a;
				return $elm$browser$Browser$AnimationManager$init;
			} else {
				var _v4 = _v1.a;
				return A2(
					$elm$core$Task$andThen,
					function (pid) {
						return A2(
							$elm$core$Task$andThen,
							function (time) {
								return $elm$core$Task$succeed(
									A3(
										$elm$browser$Browser$AnimationManager$State,
										subs,
										$elm$core$Maybe$Just(pid),
										time));
							},
							$elm$browser$Browser$AnimationManager$now);
					},
					$elm$core$Process$spawn(
						A2(
							$elm$core$Task$andThen,
							$elm$core$Platform$sendToSelf(router),
							$elm$browser$Browser$AnimationManager$rAF)));
			}
		} else {
			if (!_v1.b.b) {
				var pid = _v1.a.a;
				return A2(
					$elm$core$Task$andThen,
					function (_v3) {
						return $elm$browser$Browser$AnimationManager$init;
					},
					$elm$core$Process$kill(pid));
			} else {
				return $elm$core$Task$succeed(
					A3($elm$browser$Browser$AnimationManager$State, subs, request, oldTime));
			}
		}
	});
var $elm$browser$Browser$AnimationManager$onSelfMsg = F3(
	function (router, newTime, _v0) {
		var subs = _v0.subs;
		var oldTime = _v0.oldTime;
		var send = function (sub) {
			if (sub.$ === 'Time') {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(
						$elm$time$Time$millisToPosix(newTime)));
			} else {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(newTime - oldTime));
			}
		};
		return A2(
			$elm$core$Task$andThen,
			function (pid) {
				return A2(
					$elm$core$Task$andThen,
					function (_v1) {
						return $elm$core$Task$succeed(
							A3(
								$elm$browser$Browser$AnimationManager$State,
								subs,
								$elm$core$Maybe$Just(pid),
								newTime));
					},
					$elm$core$Task$sequence(
						A2($elm$core$List$map, send, subs)));
			},
			$elm$core$Process$spawn(
				A2(
					$elm$core$Task$andThen,
					$elm$core$Platform$sendToSelf(router),
					$elm$browser$Browser$AnimationManager$rAF)));
	});
var $elm$browser$Browser$AnimationManager$Delta = function (a) {
	return {$: 'Delta', a: a};
};
var $elm$browser$Browser$AnimationManager$subMap = F2(
	function (func, sub) {
		if (sub.$ === 'Time') {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Time(
				A2($elm$core$Basics$composeL, func, tagger));
		} else {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Delta(
				A2($elm$core$Basics$composeL, func, tagger));
		}
	});
_Platform_effectManagers['Browser.AnimationManager'] = _Platform_createManager($elm$browser$Browser$AnimationManager$init, $elm$browser$Browser$AnimationManager$onEffects, $elm$browser$Browser$AnimationManager$onSelfMsg, 0, $elm$browser$Browser$AnimationManager$subMap);
var $elm$browser$Browser$AnimationManager$subscription = _Platform_leaf('Browser.AnimationManager');
var $elm$browser$Browser$AnimationManager$onAnimationFrame = function (tagger) {
	return $elm$browser$Browser$AnimationManager$subscription(
		$elm$browser$Browser$AnimationManager$Time(tagger));
};
var $elm$browser$Browser$Events$onAnimationFrame = $elm$browser$Browser$AnimationManager$onAnimationFrame;
var $author$project$Main$dragSubs = function (model) {
	var _v0 = model.drag;
	if (_v0.$ === 'Nothing') {
		return $elm$core$Platform$Sub$none;
	} else {
		var d = _v0.a;
		return $elm$core$Platform$Sub$batch(
			_List_fromArray(
				[
					$author$project$Main$dragEvents(
					function (e) {
						var _v1 = e.kind;
						switch (_v1) {
							case 'move':
								return A3($author$project$Main$DragMoved, e.x, e.y, e.pageY);
							case 'up':
								return $author$project$Main$DragEnded;
							default:
								return $author$project$Main$DragCancel;
						}
					}),
					$elm$browser$Browser$Events$onKeyDown(
					A2(
						$elm$json$Json$Decode$andThen,
						function (k) {
							return (k === 'Escape') ? $elm$json$Json$Decode$succeed($author$project$Main$DragCancel) : $elm$json$Json$Decode$fail('not escape');
						},
						A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string))),
					d.active ? $elm$browser$Browser$Events$onAnimationFrame(
					function (_v2) {
						return $author$project$Main$DragFrame;
					}) : $elm$core$Platform$Sub$none
				]));
	}
};
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 'Every', a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {processes: processes, taggers: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 'Nothing') {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.processes;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(_Utils_Tuple0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.taggers);
		if (_v0.$ === 'Nothing') {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				A2($elm$time$Time$every, (60 * 60) * 1000, $author$project$Main$Tick),
				$author$project$Main$confirmSubs(model),
				$author$project$Main$dragSubs(model),
				$author$project$Main$copied($author$project$Main$Copied)
			]));
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$json$Json$Encode$int = _Json_wrap;
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Main$encodeCategory = function (c) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$int(c.id)),
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(c.name)),
				_Utils_Tuple2(
				'color',
				$elm$json$Json$Encode$int(c.color)),
				_Utils_Tuple2(
				'shape',
				$elm$json$Json$Encode$string(
					$author$project$Main$shapeKey(c.shape)))
			]));
};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0.a;
	return millis;
};
var $author$project$Main$encodeTime = function (t) {
	if (t.$ === 'Just') {
		var p = t.a;
		return $elm$json$Json$Encode$int(
			$elm$time$Time$posixToMillis(p));
	} else {
		return $elm$json$Json$Encode$null;
	}
};
var $author$project$Main$maybeInt = A2(
	$elm$core$Basics$composeR,
	$elm$core$Maybe$map($elm$json$Json$Encode$int),
	$elm$core$Maybe$withDefault($elm$json$Json$Encode$null));
var $author$project$Main$encodeEntry = function (e) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'description',
				$elm$json$Json$Encode$string(e.description)),
				_Utils_Tuple2(
				'completed',
				$elm$json$Json$Encode$bool(e.completed)),
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$int(e.id)),
				_Utils_Tuple2(
				'category',
				$author$project$Main$maybeInt(e.category)),
				_Utils_Tuple2(
				'completedAt',
				$author$project$Main$encodeTime(e.completedAt)),
				_Utils_Tuple2(
				'archivedAt',
				$author$project$Main$encodeTime(e.archivedAt)),
				_Utils_Tuple2(
				'order',
				$elm$json$Json$Encode$int(e.order))
			]));
};
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var $author$project$Main$encodeModel = function (m) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'entries',
				A2($elm$json$Json$Encode$list, $author$project$Main$encodeEntry, m.entries)),
				_Utils_Tuple2(
				'field',
				$elm$json$Json$Encode$string(m.field)),
				_Utils_Tuple2(
				'uid',
				$elm$json$Json$Encode$int(m.uid)),
				_Utils_Tuple2(
				'categories',
				A2($elm$json$Json$Encode$list, $author$project$Main$encodeCategory, m.categories)),
				_Utils_Tuple2(
				'nextCategoryId',
				$elm$json$Json$Encode$int(m.nextCategoryId)),
				_Utils_Tuple2(
				'newCategory',
				$author$project$Main$maybeInt(m.newCategory)),
				_Utils_Tuple2(
				'categoryFilter',
				function () {
					var _v0 = m.categoryFilter;
					switch (_v0.$) {
						case 'AnyCategory':
							return $elm$json$Json$Encode$string('all');
						case 'NoCategory':
							return $elm$json$Json$Encode$string('none');
						default:
							var id = _v0.a;
							return $elm$json$Json$Encode$int(id);
					}
				}())
			]));
};
var $elm$core$Basics$not = _Basics_not;
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $author$project$Main$isTransient = function (msg) {
	switch (msg.$) {
		case 'NoOp':
			return true;
		case 'DragStart':
			return true;
		case 'DragCancel':
			return true;
		case 'DragMoved':
			return true;
		case 'DragFrame':
			return true;
		case 'GotViewport':
			return true;
		case 'GotRects':
			return true;
		case 'GotMenuRoom':
			return true;
		case 'CopyMonth':
			return true;
		case 'Copied':
			return true;
		case 'CopyReset':
			return true;
		case 'FocusMenuItem':
			return true;
		case 'MenuPointer':
			return true;
		case 'ClearNoRing':
			return true;
		case 'Batch':
			var msgs = msg.a;
			return A2($elm$core$List$all, $author$project$Main$isTransient, msgs);
		case 'EditCategoryName':
			return true;
		case 'UpdateNewCatName':
			return true;
		case 'ToggleMenu':
			return true;
		case 'OpenMenu':
			return true;
		case 'CloseMenu':
			return true;
		case 'CloseMenuRefocus':
			return true;
		case 'CancelEditCategory':
			return true;
		case 'DismissConfirm':
			return true;
		case 'SetStatus':
			return true;
		case 'OpenArchive':
			return true;
		case 'OpenManage':
			return true;
		case 'UrlRequested':
			return true;
		case 'PressMove':
			return true;
		default:
			return false;
	}
};
var $author$project$Main$setStorage = _Platform_outgoingPort('setStorage', $elm$core$Basics$identity);
var $author$project$Main$ArchiveCompletedAt = function (a) {
	return {$: 'ArchiveCompletedAt', a: a};
};
var $author$project$Main$ArchiveItemAt = F2(
	function (a, b) {
		return {$: 'ArchiveItemAt', a: a, b: b};
	});
var $author$project$Main$CatMenu = {$: 'CatMenu'};
var $author$project$Main$CheckAt = F3(
	function (a, b, c) {
		return {$: 'CheckAt', a: a, b: b, c: c};
	});
var $author$project$Main$CopyReset = function (a) {
	return {$: 'CopyReset', a: a};
};
var $author$project$Main$EditingEntry = F2(
	function (a, b) {
		return {$: 'EditingEntry', a: a, b: b};
	});
var $author$project$Main$GotViewport = function (a) {
	return {$: 'GotViewport', a: a};
};
var $author$project$Main$LongPress = F2(
	function (a, b) {
		return {$: 'LongPress', a: a, b: b};
	});
var $author$project$Main$NoOp = {$: 'NoOp'};
var $author$project$Main$RowMenu = function (a) {
	return {$: 'RowMenu', a: a};
};
var $author$project$Main$StatusMenu = {$: 'StatusMenu'};
var $author$project$Main$Touched = F2(
	function (a, b) {
		return {$: 'Touched', a: a, b: b};
	});
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $elm$core$Task$onError = _Scheduler_onError;
var $elm$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2(
					$elm$core$Task$onError,
					A2(
						$elm$core$Basics$composeL,
						A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
						$elm$core$Result$Err),
					A2(
						$elm$core$Task$andThen,
						A2(
							$elm$core$Basics$composeL,
							A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
							$elm$core$Result$Ok),
						task))));
	});
var $author$project$Main$autoScrollStep = 8;
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $author$project$Main$nameProblem = F3(
	function (cats, self, raw) {
		return $elm$core$String$isEmpty(
			$elm$core$String$trim(raw)) ? $elm$core$Maybe$Just('Name can\u2019t be empty') : (A2(
			$elm$core$List$any,
			function (c) {
				return (!_Utils_eq(
					$elm$core$Maybe$Just(c.id),
					self)) && _Utils_eq(
					$author$project$Main$normName(c.name),
					$author$project$Main$normName(raw));
			},
			cats) ? $elm$core$Maybe$Just('Name already used') : $elm$core$Maybe$Nothing);
	});
var $author$project$Main$commitDraft = function (model) {
	var _v0 = model.editingCat;
	if (_v0.$ === 'Just') {
		var _v1 = _v0.a;
		var id = _v1.a;
		var raw = _v1.b;
		return _Utils_eq(
			A3(
				$author$project$Main$nameProblem,
				model.categories,
				$elm$core$Maybe$Just(id),
				raw),
			$elm$core$Maybe$Nothing) ? A2(
			$elm$core$List$map,
			function (c) {
				return _Utils_eq(c.id, id) ? _Utils_update(
					c,
					{
						name: $elm$core$String$trim(raw)
					}) : c;
			},
			model.categories) : model.categories;
	} else {
		return model.categories;
	}
};
var $author$project$Main$copyText = _Platform_outgoingPort('copyText', $elm$json$Json$Encode$string);
var $author$project$Main$edgeZone = 60;
var $author$project$Main$GotRects = F3(
	function (a, b, c) {
		return {$: 'GotRects', a: a, b: b, c: c};
	});
var $elm$browser$Browser$Dom$getElement = _Browser_getElement;
var $author$project$Main$inScope = F2(
	function (filter, e) {
		switch (filter.$) {
			case 'AnyCategory':
				return true;
			case 'OnlyCategory':
				var id = filter.a;
				return _Utils_eq(
					e.category,
					$elm$core$Maybe$Just(id));
			default:
				return _Utils_eq(e.category, $elm$core$Maybe$Nothing);
		}
	});
var $author$project$Main$isLive = function (e) {
	return _Utils_eq(e.archivedAt, $elm$core$Maybe$Nothing);
};
var $author$project$Main$isVisible = F2(
	function (visibility, todo) {
		switch (visibility.$) {
			case 'Completed':
				return todo.completed;
			case 'Active':
				return !todo.completed;
			case 'All':
				return true;
			case 'ArchiveView':
				return false;
			default:
				return false;
		}
	});
var $elm$core$List$sortBy = _List_sortBy;
var $author$project$Main$visibleList = function (model) {
	return A2(
		$elm$core$List$sortBy,
		function (e) {
			return _Utils_Tuple2(e.order, e.id);
		},
		A2(
			$elm$core$List$filter,
			function (e) {
				return $author$project$Main$isLive(e) && (A2($author$project$Main$inScope, model.categoryFilter, e) && A2($author$project$Main$isVisible, model.visibility, e));
			},
			model.entries));
};
var $author$project$Main$fetchRects = F2(
	function (seq, model) {
		var ids = A2(
			$elm$core$List$map,
			function ($) {
				return $.id;
			},
			$author$project$Main$visibleList(model));
		return A2(
			$elm$core$Task$attempt,
			A2($author$project$Main$GotRects, seq, ids),
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					function (i) {
						return $elm$browser$Browser$Dom$getElement(
							'row-' + $elm$core$String$fromInt(i));
					},
					ids)));
	});
var $elm$browser$Browser$Dom$focus = _Browser_call('focus');
var $author$project$Main$focusId = function (id) {
	return A2(
		$elm$core$Task$attempt,
		function (_v0) {
			return $author$project$Main$NoOp;
		},
		$elm$browser$Browser$Dom$focus(id));
};
var $author$project$Main$freeColor = F2(
	function (cats, id) {
		return A2(
			$elm$core$Maybe$withDefault,
			A2($elm$core$Basics$modBy, $author$project$Main$paletteSize, id - 1),
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (i) {
						return !A2(
							$elm$core$List$any,
							function (c) {
								return _Utils_eq(c.color, i);
							},
							cats);
					},
					A2($elm$core$List$range, 0, $author$project$Main$paletteSize - 1))));
	});
var $elm$browser$Browser$Dom$getViewport = _Browser_withWindow(_Browser_getViewport);
var $author$project$Main$indexOf = F2(
	function (x, xs) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v0) {
						var y = _v0.b;
						return _Utils_eq(y, x);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, xs))));
	});
var $elm$browser$Browser$Navigation$load = _Browser_load;
var $author$project$Main$mapEntry = F2(
	function (id, f) {
		return $elm$core$List$map(
			function (t) {
				return _Utils_eq(t.id, id) ? f(t) : t;
			});
	});
var $author$project$Main$maxOrder = function (entries) {
	return A2(
		$elm$core$Maybe$withDefault,
		-1,
		$elm$core$List$maximum(
			A2(
				$elm$core$List$map,
				function ($) {
					return $.order;
				},
				entries)));
};
var $author$project$Main$menuPrefix = function (which) {
	switch (which.$) {
		case 'StatusMenu':
			return 'sm-';
		case 'CatMenu':
			return 'tf-';
		default:
			var id = which.a;
			return 'rm-' + ($elm$core$String$fromInt(id) + '-');
	}
};
var $author$project$Main$migrate = function (now) {
	var nowMs = $elm$time$Time$posixToMillis(now);
	var valid = function (t) {
		return (($elm$time$Time$posixToMillis(t) < 0) || (_Utils_cmp(
			$elm$time$Time$posixToMillis(t),
			nowMs) > 0)) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(t);
	};
	return $elm$core$List$map(
		function (e) {
			var completedAt = A2($elm$core$Maybe$andThen, valid, e.completedAt);
			var archivedAt = A2($elm$core$Maybe$andThen, valid, e.archivedAt);
			return (e.completed && _Utils_eq(completedAt, $elm$core$Maybe$Nothing)) ? _Utils_update(
				e,
				{
					archivedAt: archivedAt,
					completedAt: $elm$core$Maybe$Just(
						A2($elm$core$Maybe$withDefault, now, archivedAt))
				}) : _Utils_update(
				e,
				{archivedAt: archivedAt, completedAt: completedAt});
		});
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Main$moveTo = F3(
	function (id, k0, model) {
		var visIds = A2(
			$elm$core$List$map,
			function ($) {
				return $.id;
			},
			$author$project$Main$visibleList(model));
		var n = $elm$core$List$length(visIds);
		var k = A3($elm$core$Basics$clamp, 0, n - 1, k0);
		var _v0 = A2($author$project$Main$indexOf, id, visIds);
		if (_v0.$ === 'Just') {
			var i = _v0.a;
			if (_Utils_eq(i, k) || ((k0 < 0) || (_Utils_cmp(k0, n) > -1))) {
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			} else {
				var live = A2(
					$elm$core$List$sortBy,
					function (e) {
						return _Utils_Tuple2(e.order, e.id);
					},
					A2($elm$core$List$filter, $author$project$Main$isLive, model.entries));
				var rest = A2(
					$elm$core$List$filter,
					function (e) {
						return !_Utils_eq(e.id, id);
					},
					live);
				var anchor = $elm$core$List$head(
					A2(
						$elm$core$List$drop,
						k - 1,
						A2(
							$elm$core$List$filter,
							function (x) {
								return !_Utils_eq(x, id);
							},
							visIds)));
				var placed = function () {
					var _v4 = _Utils_Tuple2(
						$elm$core$List$head(
							A2(
								$elm$core$List$filter,
								function (e) {
									return _Utils_eq(e.id, id);
								},
								live)),
						anchor);
					if (_v4.a.$ === 'Just') {
						if (_v4.b.$ === 'Just') {
							var m = _v4.a.a;
							var a = _v4.b.a;
							return (!k) ? A2($elm$core$List$cons, m, rest) : A2(
								$elm$core$List$concatMap,
								function (e) {
									return _Utils_eq(e.id, a) ? _List_fromArray(
										[e, m]) : _List_fromArray(
										[e]);
								},
								rest);
						} else {
							var m = _v4.a.a;
							var _v5 = _v4.b;
							return A2($elm$core$List$cons, m, rest);
						}
					} else {
						var _v6 = _v4.a;
						return rest;
					}
				}();
				var newOrder = A2(
					$elm$core$List$indexedMap,
					F2(
						function (j, e) {
							return _Utils_Tuple2(e.id, j);
						}),
					placed);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							announce: 'Moved to position ' + ($elm$core$String$fromInt(k + 1) + (' of ' + $elm$core$String$fromInt(n))),
							entries: A2(
								$elm$core$List$map,
								function (e) {
									var _v1 = $elm$core$List$head(
										A2(
											$elm$core$List$filter,
											function (_v2) {
												var x = _v2.a;
												return _Utils_eq(x, e.id);
											},
											newOrder));
									if (_v1.$ === 'Just') {
										var _v3 = _v1.a;
										var j = _v3.b;
										return _Utils_update(
											e,
											{order: j});
									} else {
										return e;
									}
								},
								model.entries)
						}),
					$elm$core$Platform$Cmd$none);
			}
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$newEntry = F4(
	function (desc, id, t, order) {
		return {archivedAt: $elm$core$Maybe$Nothing, category: t, completed: false, completedAt: $elm$core$Maybe$Nothing, description: desc, editing: false, id: id, order: order};
	});
var $author$project$Main$nextCategory = F2(
	function (cats, current) {
		var ids = A2(
			$elm$core$List$map,
			function ($) {
				return $.id;
			},
			cats);
		if (current.$ === 'Nothing') {
			return $elm$core$List$head(ids);
		} else {
			var id = current.a;
			var _v1 = A2($author$project$Main$indexOf, id, ids);
			if (_v1.$ === 'Just') {
				var i = _v1.a;
				return $elm$core$List$head(
					A2($elm$core$List$drop, i + 1, ids));
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}
	});
var $author$project$Main$GotMenuRoom = F3(
	function (a, b, c) {
		return {$: 'GotMenuRoom', a: a, b: b, c: c};
	});
var $author$project$Main$menuFilters = function (cats) {
	return A2(
		$elm$core$List$cons,
		$author$project$Main$AnyCategory,
		_Utils_ap(
			A2(
				$elm$core$List$map,
				A2(
					$elm$core$Basics$composeL,
					$author$project$Main$OnlyCategory,
					function ($) {
						return $.id;
					}),
				cats),
			_List_fromArray(
				[$author$project$Main$NoCategory])));
};
var $author$project$Main$menuIndex = F2(
	function (cats, f) {
		return A2(
			$elm$core$Maybe$withDefault,
			0,
			A2(
				$author$project$Main$indexOf,
				f,
				$author$project$Main$menuFilters(cats)));
	});
var $author$project$Main$rowMenuChoices = function (cats) {
	return A2(
		$elm$core$List$cons,
		$elm$core$Maybe$Nothing,
		A2(
			$elm$core$List$map,
			A2(
				$elm$core$Basics$composeL,
				$elm$core$Maybe$Just,
				function ($) {
					return $.id;
				}),
			cats));
};
var $author$project$Main$statusOrder = _List_fromArray(
	[$author$project$Main$Active, $author$project$Main$Completed, $author$project$Main$All]);
var $author$project$Main$openMenu = F2(
	function (which, model) {
		var prefix = $author$project$Main$menuPrefix(which);
		var current = function () {
			switch (which.$) {
				case 'StatusMenu':
					return A2(
						$elm$core$Maybe$withDefault,
						0,
						A2($author$project$Main$indexOf, model.visibility, $author$project$Main$statusOrder));
				case 'CatMenu':
					return A2($author$project$Main$menuIndex, model.categories, model.categoryFilter);
				default:
					var id = which.a;
					return A2(
						$elm$core$Maybe$withDefault,
						0,
						A2(
							$elm$core$Maybe$andThen,
							function (e) {
								return A2(
									$author$project$Main$indexOf,
									e.category,
									$author$project$Main$rowMenuChoices(model.categories));
							},
							$elm$core$List$head(
								A2(
									$elm$core$List$filter,
									function (e) {
										return _Utils_eq(e.id, id);
									},
									model.entries))));
			}
		}();
		return _Utils_Tuple2(
			_Utils_update(
				model,
				{
					menuOpen: $elm$core$Maybe$Just(which)
				}),
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$focusId(
						prefix + ('item-' + $elm$core$String$fromInt(current))),
						A2(
						$elm$core$Task$attempt,
						function (r) {
							if (r.$ === 'Ok') {
								var _v1 = r.a;
								var btn = _v1.a;
								var menu = _v1.b;
								return A3($author$project$Main$GotMenuRoom, which, btn.element.y - btn.viewport.y, menu.element.height);
							} else {
								return $author$project$Main$NoOp;
							}
						},
						A3(
							$elm$core$Task$map2,
							$elm$core$Tuple$pair,
							$elm$browser$Browser$Dom$getElement(prefix + 'button'),
							$elm$browser$Browser$Dom$getElement(prefix + 'menu')))
					])));
	});
var $author$project$Main$pickRing = F2(
	function (which, model) {
		return model.menuPointer ? $elm$core$Maybe$Just(which) : $elm$core$Maybe$Nothing;
	});
var $elm$core$Basics$pow = _Basics_pow;
var $elm$browser$Browser$Navigation$pushUrl = _Browser_pushUrl;
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$Main$setCompleted = F3(
	function (isCompleted, now, t) {
		return _Utils_eq(t.completed, isCompleted) ? t : (isCompleted ? _Utils_update(
			t,
			{
				completed: true,
				completedAt: $elm$core$Maybe$Just(now)
			}) : _Utils_update(
			t,
			{completed: false, completedAt: $elm$core$Maybe$Nothing}));
	});
var $elm$browser$Browser$Dom$setViewport = _Browser_setViewport;
var $elm$core$Process$sleep = _Process_sleep;
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $author$project$Main$statusHash = function (v) {
	switch (v.$) {
		case 'Completed':
			return '#/completed';
		case 'All':
			return '#/all';
		default:
			return '#/active';
	}
};
var $author$project$Main$thirtyDaysMs = (((30 * 24) * 60) * 60) * 1000;
var $author$project$Main$sweep = function (now) {
	return $elm$core$List$map(
		function (e) {
			var _v0 = _Utils_Tuple3(e.completed, e.archivedAt, e.completedAt);
			if ((_v0.a && (_v0.b.$ === 'Nothing')) && (_v0.c.$ === 'Just')) {
				var _v1 = _v0.b;
				var c = _v0.c.a;
				return (_Utils_cmp(
					$elm$time$Time$posixToMillis(now) - $elm$time$Time$posixToMillis(c),
					$author$project$Main$thirtyDaysMs) > 0) ? _Utils_update(
					e,
					{
						archivedAt: $elm$core$Maybe$Just(now)
					}) : e;
			} else {
				return e;
			}
		});
};
var $elm$url$Url$addPort = F2(
	function (maybePort, starter) {
		if (maybePort.$ === 'Nothing') {
			return starter;
		} else {
			var port_ = maybePort.a;
			return starter + (':' + $elm$core$String$fromInt(port_));
		}
	});
var $elm$url$Url$addPrefixed = F3(
	function (prefix, maybeSegment, starter) {
		if (maybeSegment.$ === 'Nothing') {
			return starter;
		} else {
			var segment = maybeSegment.a;
			return _Utils_ap(
				starter,
				_Utils_ap(prefix, segment));
		}
	});
var $elm$url$Url$toString = function (url) {
	var http = function () {
		var _v0 = url.protocol;
		if (_v0.$ === 'Http') {
			return 'http://';
		} else {
			return 'https://';
		}
	}();
	return A3(
		$elm$url$Url$addPrefixed,
		'#',
		url.fragment,
		A3(
			$elm$url$Url$addPrefixed,
			'?',
			url.query,
			_Utils_ap(
				A2(
					$elm$url$Url$addPort,
					url.port_,
					_Utils_ap(http, url.host)),
				url.path)));
};
var $author$project$Main$withNow = function (toMsg) {
	return A2($elm$core$Task$perform, toMsg, $elm$time$Time$now);
};
var $author$project$Main$withSlot = function (d) {
	return $elm$core$List$isEmpty(d.rects) ? d : _Utils_update(
		d,
		{
			slot: $elm$core$List$length(
				A2(
					$elm$core$List$filter,
					function (r) {
						return (!_Utils_eq(r.id, d.id)) && (_Utils_cmp(r.top + (r.height / 2), d.pageY) < 0);
					},
					d.rects))
		});
};
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 'NoOp':
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'Batch':
					var msgs = msg.a;
					return A3(
						$elm$core$List$foldl,
						F2(
							function (m, _v1) {
								var mdl = _v1.a;
								var cmds = _v1.b;
								var _v2 = A2($author$project$Main$update, m, mdl);
								var next = _v2.a;
								var cmd = _v2.b;
								return _Utils_Tuple2(
									next,
									$elm$core$Platform$Cmd$batch(
										_List_fromArray(
											[cmds, cmd])));
							}),
						_Utils_Tuple2(model, $elm$core$Platform$Cmd$none),
						msgs);
				case 'Add':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: $elm$core$String$isEmpty(
									$elm$core$String$trim(model.field)) ? model.entries : _Utils_ap(
									model.entries,
									_List_fromArray(
										[
											A4(
											$author$project$Main$newEntry,
											$elm$core$String$trim(model.field),
											model.uid,
											A2($author$project$Main$validCategory, model.categories, model.newCategory),
											1 + $author$project$Main$maxOrder(model.entries))
										])),
								field: '',
								uid: model.uid + 1
							}),
						$elm$core$Platform$Cmd$none);
				case 'UpdateField':
					var str = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{field: str}),
						$elm$core$Platform$Cmd$none);
				case 'EditingEntry':
					if (msg.b) {
						var id = msg.a;
						var backup = A2(
							$elm$core$Maybe$map,
							function (t) {
								return _Utils_Tuple2(id, t.description);
							},
							$elm$core$List$head(
								A2(
									$elm$core$List$filter,
									function (t) {
										return _Utils_eq(t.id, id);
									},
									model.entries)));
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									confirmingDelete: $elm$core$Maybe$Nothing,
									editBackup: backup,
									entries: A3(
										$author$project$Main$mapEntry,
										id,
										function (t) {
											return _Utils_update(
												t,
												{editing: true});
										},
										model.entries),
									pressing: $elm$core$Maybe$Nothing
								}),
							A2(
								$elm$core$Task$attempt,
								function (_v3) {
									return $author$project$Main$NoOp;
								},
								$elm$browser$Browser$Dom$focus(
									'todo-' + $elm$core$String$fromInt(id))));
					} else {
						var id = msg.a;
						if (A2(
							$elm$core$List$any,
							function (t) {
								return _Utils_eq(t.id, id) && t.editing;
							},
							model.entries)) {
							var edited = function (t) {
								return _Utils_eq(t.id, id) && (t.completed && ((t.description !== '') && (!_Utils_eq(
									$elm$core$Maybe$Just(t.description),
									A2($elm$core$Maybe$map, $elm$core$Tuple$second, model.editBackup)))));
							};
							var commit = function (t) {
								return _Utils_update(
									t,
									{
										description: $elm$core$String$trim(t.description),
										editing: false
									});
							};
							var committed = A3($author$project$Main$mapEntry, id, commit, model.entries);
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										editBackup: $elm$core$Maybe$Nothing,
										entries: A2(
											$elm$core$List$filter,
											function (t) {
												return (!_Utils_eq(t.id, id)) || (t.description !== '');
											},
											committed)
									}),
								A2($elm$core$List$any, edited, committed) ? $author$project$Main$withNow(
									$author$project$Main$Touched(id)) : $elm$core$Platform$Cmd$none);
						} else {
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					}
				case 'CancelEdit':
					var id = msg.a;
					var restore = function (t) {
						var _v4 = model.editBackup;
						if (_v4.$ === 'Just') {
							var _v5 = _v4.a;
							var bid = _v5.a;
							var original = _v5.b;
							return _Utils_eq(bid, id) ? _Utils_update(
								t,
								{description: original, editing: false}) : _Utils_update(
								t,
								{editing: false});
						} else {
							return _Utils_update(
								t,
								{editing: false});
						}
					};
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								editBackup: $elm$core$Maybe$Nothing,
								entries: A3($author$project$Main$mapEntry, id, restore, model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'UpdateEntry':
					var id = msg.a;
					var desc = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									function (t) {
										return _Utils_update(
											t,
											{description: desc});
									},
									model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'Delete':
					var id = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								confirmingDelete: $elm$core$Maybe$Nothing,
								entries: A2(
									$elm$core$List$filter,
									function (t) {
										return !_Utils_eq(t.id, id);
									},
									model.entries),
								pressing: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 'DragStart':
					var id = msg.a;
					var cx = msg.b;
					var cy = msg.c;
					var py = msg.d;
					var immediate = msg.e;
					var seq = model.pressSeq;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								confirmingDelete: $elm$core$Maybe$Nothing,
								drag: $elm$core$Maybe$Just(
									{active: immediate, clientY: cy, id: id, pageY: py, rects: _List_Nil, seq: seq, slot: -1, startPageY: py, startX: cx, startY: cy}),
								menuOpen: $elm$core$Maybe$Nothing,
								pressSeq: seq + 1,
								pressing: $elm$core$Maybe$Nothing
							}),
						immediate ? A2($author$project$Main$fetchRects, seq, model) : $elm$core$Platform$Cmd$none);
				case 'GotRects':
					var seq = msg.a;
					var ids = msg.b;
					var result = msg.c;
					var _v6 = _Utils_Tuple2(model.drag, result);
					if (_v6.a.$ === 'Just') {
						if (_v6.b.$ === 'Ok') {
							var d = _v6.a.a;
							var els = _v6.b.a;
							return _Utils_eq(d.seq, seq) ? _Utils_Tuple2(
								_Utils_update(
									model,
									{
										drag: $elm$core$Maybe$Just(
											$author$project$Main$withSlot(
												_Utils_update(
													d,
													{
														rects: A3(
															$elm$core$List$map2,
															F2(
																function (i, el) {
																	return {height: el.element.height, id: i, top: el.element.y};
																}),
															ids,
															els)
													})))
									}),
								$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						} else {
							var d = _v6.a.a;
							return _Utils_eq(d.seq, seq) ? _Utils_Tuple2(
								_Utils_update(
									model,
									{drag: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'DragMoved':
					var cx = msg.a;
					var cy = msg.b;
					var py = msg.c;
					var _v7 = model.drag;
					if (_v7.$ === 'Just') {
						var d = _v7.a;
						var far = $elm$core$Basics$sqrt(
							A2($elm$core$Basics$pow, cx - d.startX, 2) + A2($elm$core$Basics$pow, cy - d.startY, 2)) > 6;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									drag: $elm$core$Maybe$Just(
										$author$project$Main$withSlot(
											_Utils_update(
												d,
												{active: d.active || far, clientY: cy, pageY: py})))
								}),
							(far && (!d.active)) ? A2($author$project$Main$fetchRects, d.seq, model) : $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'DragEnded':
					var _v8 = model.drag;
					if (_v8.$ === 'Just') {
						var d = _v8.a;
						return (d.active && (!$elm$core$List$isEmpty(d.rects))) ? A3(
							$author$project$Main$moveTo,
							d.id,
							d.slot,
							_Utils_update(
								model,
								{drag: $elm$core$Maybe$Nothing})) : _Utils_Tuple2(
							_Utils_update(
								model,
								{drag: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'DragCancel':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{drag: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 'DragFrame':
					var _v9 = model.drag;
					if (_v9.$ === 'Just') {
						var d = _v9.a;
						return d.active ? _Utils_Tuple2(
							model,
							A2($elm$core$Task$perform, $author$project$Main$GotViewport, $elm$browser$Browser$Dom$getViewport)) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'GotViewport':
					var vp = msg.a;
					var _v10 = model.drag;
					if (_v10.$ === 'Just') {
						var d = _v10.a;
						var h = vp.viewport.height;
						var want = (_Utils_cmp(d.clientY, $author$project$Main$edgeZone) < 0) ? (-$author$project$Main$autoScrollStep) : ((_Utils_cmp(d.clientY, h - $author$project$Main$edgeZone) > 0) ? $author$project$Main$autoScrollStep : 0);
						var newY = A3(
							$elm$core$Basics$clamp,
							0,
							A2($elm$core$Basics$max, 0, vp.scene.height - h),
							vp.viewport.y + want);
						var delta = newY - vp.viewport.y;
						return (d.active && (!(!delta))) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									drag: $elm$core$Maybe$Just(
										$author$project$Main$withSlot(
											_Utils_update(
												d,
												{pageY: d.pageY + delta})))
								}),
							A2(
								$elm$core$Task$perform,
								function (_v11) {
									return $author$project$Main$NoOp;
								},
								A2($elm$browser$Browser$Dom$setViewport, vp.viewport.x, newY))) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'MoveBy':
					var id = msg.a;
					var delta = msg.b;
					var ids = A2(
						$elm$core$List$map,
						function ($) {
							return $.id;
						},
						$author$project$Main$visibleList(model));
					var _v12 = A2($author$project$Main$indexOf, id, ids);
					if (_v12.$ === 'Just') {
						var i = _v12.a;
						var _v13 = A3($author$project$Main$moveTo, id, i + delta, model);
						var m = _v13.a;
						var cmd = _v13.b;
						return _Utils_Tuple2(
							m,
							$elm$core$Platform$Cmd$batch(
								_List_fromArray(
									[
										cmd,
										$author$project$Main$focusId(
										'check-' + $elm$core$String$fromInt(id))
									])));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'PressStart':
					var id = msg.a;
					var x = msg.b;
					var y = msg.c;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								confirmingDelete: $elm$core$Maybe$Nothing,
								pressSeq: model.pressSeq + 1,
								pressing: $elm$core$Maybe$Just(
									{id: id, seq: model.pressSeq, x: x, y: y})
							}),
						A2(
							$elm$core$Task$perform,
							function (_v14) {
								return A2($author$project$Main$LongPress, id, model.pressSeq);
							},
							$elm$core$Process$sleep(500)));
				case 'PressMove':
					var x = msg.a;
					var y = msg.b;
					var _v15 = model.pressing;
					if (_v15.$ === 'Just') {
						var p = _v15.a;
						return (($elm$core$Basics$abs(x - p.x) > 10) || ($elm$core$Basics$abs(y - p.y) > 10)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{pressing: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'PressEnd':
					var id = msg.a;
					var _v16 = model.pressing;
					if (_v16.$ === 'Just') {
						var p = _v16.a;
						if (_Utils_eq(p.id, id)) {
							var $temp$msg = A2($author$project$Main$EditingEntry, id, true),
								$temp$model = _Utils_update(
								model,
								{pressing: $elm$core$Maybe$Nothing});
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{pressing: $elm$core$Maybe$Nothing}),
								$elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'PressCancel':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{pressing: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 'LongPress':
					var id = msg.a;
					var seq = msg.b;
					var _v17 = model.pressing;
					if (_v17.$ === 'Just') {
						var p = _v17.a;
						return (_Utils_eq(p.id, id) && _Utils_eq(p.seq, seq)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									confirmingDelete: $elm$core$Maybe$Just(id),
									pressing: $elm$core$Maybe$Nothing
								}),
							$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'DismissConfirm':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{confirmingCategory: $elm$core$Maybe$Nothing, confirmingDelete: $elm$core$Maybe$Nothing, pressing: $elm$core$Maybe$Nothing}),
						function () {
							var _v18 = model.confirmingCategory;
							if (_v18.$ === 'Just') {
								var cid = _v18.a;
								return $author$project$Main$focusId(
									'cat-del-' + $elm$core$String$fromInt(cid));
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}());
				case 'ArchiveCompleted':
					return _Utils_Tuple2(
						model,
						$author$project$Main$withNow($author$project$Main$ArchiveCompletedAt));
				case 'ArchiveCompletedAt':
					var now = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A2(
									$elm$core$List$map,
									function (t) {
										return (t.completed && ($author$project$Main$isLive(t) && A2($author$project$Main$inScope, model.categoryFilter, t))) ? _Utils_update(
											t,
											{
												archivedAt: $elm$core$Maybe$Just(now)
											}) : t;
									},
									model.entries)
							}),
						$author$project$Main$focusId('new-todo'));
				case 'ArchiveItem':
					var id = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{confirmingDelete: $elm$core$Maybe$Nothing, pressing: $elm$core$Maybe$Nothing}),
						$author$project$Main$withNow(
							$author$project$Main$ArchiveItemAt(id)));
				case 'ArchiveItemAt':
					var id = msg.a;
					var now = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									function (t) {
										return (t.completed && $author$project$Main$isLive(t)) ? _Utils_update(
											t,
											{
												archivedAt: $elm$core$Maybe$Just(now)
											}) : t;
									},
									model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'Restore':
					var id = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								confirmingDelete: $elm$core$Maybe$Nothing,
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									function (t) {
										return _Utils_update(
											t,
											{
												archivedAt: $elm$core$Maybe$Nothing,
												completed: false,
												completedAt: $elm$core$Maybe$Nothing,
												order: 1 + $author$project$Main$maxOrder(model.entries)
											});
									},
									model.entries),
								pressing: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none);
				case 'Touched':
					var id = msg.a;
					var now = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									function (t) {
										return _Utils_update(
											t,
											{
												completedAt: $elm$core$Maybe$Just(now)
											});
									},
									model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'Check':
					var id = msg.a;
					var isCompleted = msg.b;
					return _Utils_Tuple2(
						model,
						$author$project$Main$withNow(
							A2($author$project$Main$CheckAt, id, isCompleted)));
				case 'CheckAt':
					var id = msg.a;
					var isCompleted = msg.b;
					var now = msg.c;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									A2($author$project$Main$setCompleted, isCompleted, now),
									model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'GotTime':
					var zone = msg.a;
					var now = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A2(
									$author$project$Main$sweep,
									now,
									A2($author$project$Main$migrate, now, model.entries)),
								zone: zone
							}),
						$elm$core$Platform$Cmd$none);
				case 'Tick':
					var now = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A2($author$project$Main$sweep, now, model.entries)
							}),
						$elm$core$Platform$Cmd$none);
				case 'SetNewCategory':
					var c = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{newCategory: c}),
						$author$project$Main$focusId('new-todo'));
				case 'CycleNewCategory':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								newCategory: A2($author$project$Main$nextCategory, model.categories, model.newCategory)
							}),
						$elm$core$Platform$Cmd$none);
				case 'SetEntryCategory':
					var id = msg.a;
					var cat = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								entries: A3(
									$author$project$Main$mapEntry,
									id,
									function (t) {
										return _Utils_update(
											t,
											{category: cat});
									},
									model.entries),
								menuOpen: $elm$core$Maybe$Nothing,
								noRing: A2(
									$author$project$Main$pickRing,
									$author$project$Main$RowMenu(id),
									model)
							}),
						$author$project$Main$focusId(
							$author$project$Main$menuPrefix(
								$author$project$Main$RowMenu(id)) + 'button'));
				case 'SetCategoryFilter':
					var f = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								categoryFilter: f,
								menuOpen: $elm$core$Maybe$Nothing,
								newCategory: _Utils_eq(f, model.categoryFilter) ? model.newCategory : A2($author$project$Main$followFilter, f, model.newCategory),
								noRing: A2($author$project$Main$pickRing, $author$project$Main$CatMenu, model)
							}),
						$author$project$Main$focusId('tf-button'));
				case 'OpenManage':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{menuOpen: $elm$core$Maybe$Nothing}),
						A2($elm$browser$Browser$Navigation$pushUrl, model.key, '#/categories'));
				case 'UpdateNewCatName':
					var str = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{addError: $elm$core$Maybe$Nothing, newCatName: str}),
						$elm$core$Platform$Cmd$none);
				case 'AddCategory':
					var name_ = $elm$core$String$trim(model.newCatName);
					var id = model.nextCategoryId;
					if ($elm$core$String$isEmpty(name_)) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						if (_Utils_cmp(
							$elm$core$List$length(model.categories),
							$author$project$Main$maxCategories) > -1) {
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										addError: $elm$core$Maybe$Just(
											'Limit is ' + ($elm$core$String$fromInt($author$project$Main$maxCategories) + ' categories'))
									}),
								$elm$core$Platform$Cmd$none);
						} else {
							var _v19 = A3($author$project$Main$nameProblem, model.categories, $elm$core$Maybe$Nothing, name_);
							if (_v19.$ === 'Just') {
								var problem = _v19.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											addError: $elm$core$Maybe$Just(problem)
										}),
									$elm$core$Platform$Cmd$none);
							} else {
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											addError: $elm$core$Maybe$Nothing,
											categories: _Utils_ap(
												model.categories,
												_List_fromArray(
													[
														{
														color: A2($author$project$Main$freeColor, model.categories, id),
														id: id,
														name: name_,
														shape: $author$project$Main$shapeForId(id)
													}
													])),
											newCatName: '',
											nextCategoryId: id + 1
										}),
									$author$project$Main$focusId('cat-new'));
							}
						}
					}
				case 'StartEditCategory':
					var id = msg.a;
					var _v20 = A2($author$project$Main$findCategory, model.categories, id);
					if (_v20.$ === 'Just') {
						var c = _v20.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									categories: $author$project$Main$commitDraft(model),
									confirmingCategory: $elm$core$Maybe$Nothing,
									editingCat: $elm$core$Maybe$Just(
										_Utils_Tuple2(id, c.name))
								}),
							$author$project$Main$focusId(
								'cat-name-' + $elm$core$String$fromInt(id)));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'EditCategoryName':
					var raw = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								editingCat: A2(
									$elm$core$Maybe$map,
									function (_v21) {
										var id = _v21.a;
										return _Utils_Tuple2(id, raw);
									},
									model.editingCat)
							}),
						$elm$core$Platform$Cmd$none);
				case 'CommitCategory':
					var id = msg.a;
					var _v22 = model.editingCat;
					if (_v22.$ === 'Just') {
						var _v23 = _v22.a;
						var eid = _v23.a;
						var raw = _v23.b;
						return (_Utils_eq(eid, id) && _Utils_eq(
							A3(
								$author$project$Main$nameProblem,
								model.categories,
								$elm$core$Maybe$Just(id),
								raw),
							$elm$core$Maybe$Nothing)) ? _Utils_Tuple2(
							_Utils_update(
								model,
								{
									categories: $author$project$Main$commitDraft(model),
									editingCat: $elm$core$Maybe$Nothing
								}),
							$author$project$Main$focusId(
								'cat-label-' + $elm$core$String$fromInt(id))) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'BlurCategory':
					var id = msg.a;
					return _Utils_eq(
						A2($elm$core$Maybe$map, $elm$core$Tuple$first, model.editingCat),
						$elm$core$Maybe$Just(id)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{
								categories: $author$project$Main$commitDraft(model),
								editingCat: $elm$core$Maybe$Nothing
							}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'CancelEditCategory':
					var id = msg.a;
					return _Utils_eq(
						A2($elm$core$Maybe$map, $elm$core$Tuple$first, model.editingCat),
						$elm$core$Maybe$Just(id)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{editingCat: $elm$core$Maybe$Nothing}),
						$author$project$Main$focusId(
							'cat-label-' + $elm$core$String$fromInt(id))) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'SetCategoryColor':
					var id = msg.a;
					var color = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								categories: A2(
									$elm$core$List$map,
									function (c) {
										return _Utils_eq(c.id, id) ? _Utils_update(
											c,
											{
												color: A3($elm$core$Basics$clamp, 0, $author$project$Main$paletteSize - 1, color)
											}) : c;
									},
									model.categories)
							}),
						$elm$core$Platform$Cmd$none);
				case 'MoveCategory':
					var id = msg.a;
					var delta = msg.b;
					var ids = A2(
						$elm$core$List$map,
						function ($) {
							return $.id;
						},
						model.categories);
					var n = $elm$core$List$length(ids);
					var _v24 = A2($author$project$Main$indexOf, id, ids);
					if (_v24.$ === 'Just') {
						var i = _v24.a;
						var others = A2(
							$elm$core$List$filter,
							function (c) {
								return !_Utils_eq(c.id, id);
							},
							model.categories);
						var moved = A2(
							$elm$core$List$filter,
							function (c) {
								return _Utils_eq(c.id, id);
							},
							model.categories);
						var j = A3($elm$core$Basics$clamp, 0, n - 1, i + delta);
						var target = ((delta < 0) && (j > 0)) ? 'cat-up-' : (((delta > 0) && (_Utils_cmp(j, n - 1) < 0)) ? 'cat-down-' : ((delta < 0) ? 'cat-down-' : 'cat-up-'));
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									categories: _Utils_ap(
										A2($elm$core$List$take, j, others),
										_Utils_ap(
											moved,
											A2($elm$core$List$drop, j, others)))
								}),
							$author$project$Main$focusId(
								_Utils_ap(
									target,
									$elm$core$String$fromInt(id))));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'AskDeleteCategory':
					var id = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								categories: $author$project$Main$commitDraft(model),
								confirmingCategory: $elm$core$Maybe$Just(id),
								editingCat: $elm$core$Maybe$Nothing
							}),
						$author$project$Main$focusId('cat-cancel'));
				case 'DeleteCategory':
					var id = msg.a;
					var cats = A2(
						$elm$core$List$filter,
						function (c) {
							return !_Utils_eq(c.id, id);
						},
						model.categories);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								categories: cats,
								categoryFilter: A2($author$project$Main$validFilter, cats, model.categoryFilter),
								confirmingCategory: $elm$core$Maybe$Nothing,
								editingCat: $elm$core$Maybe$Nothing,
								entries: A2(
									$elm$core$List$map,
									function (e) {
										return _Utils_eq(
											e.category,
											$elm$core$Maybe$Just(id)) ? _Utils_update(
											e,
											{category: $elm$core$Maybe$Nothing}) : e;
									},
									model.entries),
								newCategory: A2($author$project$Main$validCategory, cats, model.newCategory)
							}),
						$author$project$Main$focusId('cat-new'));
				case 'ToggleMenu':
					var which = msg.a;
					return _Utils_eq(
						model.menuOpen,
						$elm$core$Maybe$Just(which)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{menuOpen: $elm$core$Maybe$Nothing}),
						$author$project$Main$focusId(
							$author$project$Main$menuPrefix(which) + 'button')) : A2($author$project$Main$openMenu, which, model);
				case 'OpenMenu':
					var which = msg.a;
					return A2($author$project$Main$openMenu, which, model);
				case 'GotMenuRoom':
					var above = msg.b;
					var menuHeight = msg.c;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								menuDown: _Utils_cmp(above, menuHeight + 8) < 0
							}),
						$elm$core$Platform$Cmd$none);
				case 'CloseMenu':
					var which = msg.a;
					return _Utils_eq(
						model.menuOpen,
						$elm$core$Maybe$Just(which)) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{menuOpen: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'CloseMenuRefocus':
					var which = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{menuOpen: $elm$core$Maybe$Nothing}),
						$author$project$Main$focusId(
							$author$project$Main$menuPrefix(which) + 'button'));
				case 'FocusMenuItem':
					var which = msg.a;
					var i = msg.b;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{menuPointer: false}),
						$author$project$Main$focusId(
							$author$project$Main$menuPrefix(which) + ('item-' + $elm$core$String$fromInt(i))));
				case 'MenuPointer':
					var on = msg.a;
					return _Utils_eq(model.menuPointer, on) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
						_Utils_update(
							model,
							{menuPointer: on}),
						$elm$core$Platform$Cmd$none);
				case 'ClearNoRing':
					return _Utils_eq(model.noRing, $elm$core$Maybe$Nothing) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
						_Utils_update(
							model,
							{noRing: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 'CopyMonth':
					var month = msg.a;
					var txt = msg.b;
					return (!_Utils_eq(model.copyPending, $elm$core$Maybe$Nothing)) ? _Utils_Tuple2(model, $elm$core$Platform$Cmd$none) : _Utils_Tuple2(
						_Utils_update(
							model,
							{
								copyPending: $elm$core$Maybe$Just(month)
							}),
						$author$project$Main$copyText(txt));
				case 'Copied':
					var ok = msg.a;
					var _v25 = model.copyPending;
					if (_v25.$ === 'Just') {
						var month = _v25.a;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									copyFlash: $elm$core$Maybe$Just(
										_Utils_Tuple2(month, ok)),
									copyPending: $elm$core$Maybe$Nothing,
									copySeq: model.copySeq + 1
								}),
							A2(
								$elm$core$Task$perform,
								function (_v26) {
									return $author$project$Main$CopyReset(model.copySeq + 1);
								},
								$elm$core$Process$sleep(1500)));
					} else {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'CopyReset':
					var seq = msg.a;
					return _Utils_eq(seq, model.copySeq) ? _Utils_Tuple2(
						_Utils_update(
							model,
							{copyFlash: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none) : _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'OpenArchive':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{menuOpen: $elm$core$Maybe$Nothing}),
						A2($elm$browser$Browser$Navigation$pushUrl, model.key, '#/archive'));
				case 'SetStatus':
					var v = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								menuOpen: $elm$core$Maybe$Nothing,
								noRing: A2($author$project$Main$pickRing, $author$project$Main$StatusMenu, model)
							}),
						_Utils_eq(v, model.visibility) ? $author$project$Main$focusId('sm-button') : $elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									A2(
									$elm$browser$Browser$Navigation$pushUrl,
									model.key,
									$author$project$Main$statusHash(v)),
									$author$project$Main$focusId('sm-button')
								])));
				case 'UrlRequested':
					var req = msg.a;
					if (req.$ === 'Internal') {
						var url = req.a;
						return _Utils_Tuple2(
							model,
							A2(
								$elm$browser$Browser$Navigation$pushUrl,
								model.key,
								$elm$url$Url$toString(url)));
					} else {
						var href = req.a;
						return _Utils_Tuple2(
							model,
							$elm$browser$Browser$Navigation$load(href));
					}
				default:
					var url = msg.a;
					var v = $author$project$Main$visibilityFromUrl(url);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								addError: $elm$core$Maybe$Nothing,
								confirmingCategory: $elm$core$Maybe$Nothing,
								confirmingDelete: $elm$core$Maybe$Nothing,
								editingCat: $elm$core$Maybe$Nothing,
								menuOpen: $elm$core$Maybe$Nothing,
								pressing: $elm$core$Maybe$Nothing,
								returnTo: function () {
									var _v28 = model.visibility;
									switch (_v28.$) {
										case 'Active':
											return '#/active';
										case 'Completed':
											return '#/completed';
										case 'All':
											return '#/all';
										default:
											return model.returnTo;
									}
								}(),
								visibility: v
							}),
						function () {
							if (_Utils_eq(v, $author$project$Main$ManageView) && (!_Utils_eq(model.visibility, $author$project$Main$ManageView))) {
								var _v29 = model.categories;
								if (_v29.b) {
									var c = _v29.a;
									return $author$project$Main$focusId(
										'cat-label-' + $elm$core$String$fromInt(c.id));
								} else {
									return $author$project$Main$focusId('cat-new');
								}
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}());
			}
		}
	});
var $author$project$Main$updateWithStorage = F2(
	function (msg, model) {
		var _v0 = A2($author$project$Main$update, msg, model);
		var newModel = _v0.a;
		var cmds = _v0.b;
		return _Utils_Tuple2(
			newModel,
			$author$project$Main$isTransient(msg) ? cmds : $elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$setStorage(
						$author$project$Main$encodeModel(newModel)),
						cmds
					])));
	});
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $elm$html$Html$div = _VirtualDom_node('div');
var $author$project$Main$isSubPage = function (v) {
	return _Utils_eq(v, $author$project$Main$ArchiveView) || _Utils_eq(v, $author$project$Main$ManageView);
};
var $elm$virtual_dom$VirtualDom$lazy3 = _VirtualDom_lazy3;
var $elm$html$Html$Lazy$lazy3 = $elm$virtual_dom$VirtualDom$lazy3;
var $elm$html$Html$section = _VirtualDom_node('section');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$html$Html$a = _VirtualDom_node('a');
var $author$project$Main$doneMs = function (e) {
	var _v0 = _Utils_Tuple2(e.completedAt, e.archivedAt);
	if (_v0.a.$ === 'Just') {
		var t = _v0.a.a;
		return $elm$time$Time$posixToMillis(t);
	} else {
		if (_v0.b.$ === 'Just') {
			var _v1 = _v0.a;
			var t = _v0.b.a;
			return $elm$time$Time$posixToMillis(t);
		} else {
			return 0;
		}
	}
};
var $author$project$Main$monthNames = function (m) {
	switch (m.$) {
		case 'Jan':
			return _Utils_Tuple2('Jan', 'January');
		case 'Feb':
			return _Utils_Tuple2('Feb', 'February');
		case 'Mar':
			return _Utils_Tuple2('Mar', 'March');
		case 'Apr':
			return _Utils_Tuple2('Apr', 'April');
		case 'May':
			return _Utils_Tuple2('May', 'May');
		case 'Jun':
			return _Utils_Tuple2('Jun', 'June');
		case 'Jul':
			return _Utils_Tuple2('Jul', 'July');
		case 'Aug':
			return _Utils_Tuple2('Aug', 'August');
		case 'Sep':
			return _Utils_Tuple2('Sep', 'September');
		case 'Oct':
			return _Utils_Tuple2('Oct', 'October');
		case 'Nov':
			return _Utils_Tuple2('Nov', 'November');
		default:
			return _Utils_Tuple2('Dec', 'December');
	}
};
var $elm$time$Time$Apr = {$: 'Apr'};
var $elm$time$Time$Aug = {$: 'Aug'};
var $elm$time$Time$Dec = {$: 'Dec'};
var $elm$time$Time$Feb = {$: 'Feb'};
var $elm$time$Time$Jan = {$: 'Jan'};
var $elm$time$Time$Jul = {$: 'Jul'};
var $elm$time$Time$Jun = {$: 'Jun'};
var $elm$time$Time$Mar = {$: 'Mar'};
var $elm$time$Time$May = {$: 'May'};
var $elm$time$Time$Nov = {$: 'Nov'};
var $elm$time$Time$Oct = {$: 'Oct'};
var $elm$time$Time$Sep = {$: 'Sep'};
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.start, posixMinutes) < 0) {
					return posixMinutes + era.offset;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$time$Time$toCivil = function (minutes) {
	var rawDay = A2($elm$time$Time$flooredDiv, minutes, 60 * 24) + 719468;
	var era = (((rawDay >= 0) ? rawDay : (rawDay - 146096)) / 146097) | 0;
	var dayOfEra = rawDay - (era * 146097);
	var yearOfEra = ((((dayOfEra - ((dayOfEra / 1460) | 0)) + ((dayOfEra / 36524) | 0)) - ((dayOfEra / 146096) | 0)) / 365) | 0;
	var dayOfYear = dayOfEra - (((365 * yearOfEra) + ((yearOfEra / 4) | 0)) - ((yearOfEra / 100) | 0));
	var mp = (((5 * dayOfYear) + 2) / 153) | 0;
	var month = mp + ((mp < 10) ? 3 : (-9));
	var year = yearOfEra + (era * 400);
	return {
		day: (dayOfYear - ((((153 * mp) + 2) / 5) | 0)) + 1,
		month: month,
		year: year + ((month <= 2) ? 1 : 0)
	};
};
var $elm$time$Time$toMonth = F2(
	function (zone, time) {
		var _v0 = $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).month;
		switch (_v0) {
			case 1:
				return $elm$time$Time$Jan;
			case 2:
				return $elm$time$Time$Feb;
			case 3:
				return $elm$time$Time$Mar;
			case 4:
				return $elm$time$Time$Apr;
			case 5:
				return $elm$time$Time$May;
			case 6:
				return $elm$time$Time$Jun;
			case 7:
				return $elm$time$Time$Jul;
			case 8:
				return $elm$time$Time$Aug;
			case 9:
				return $elm$time$Time$Sep;
			case 10:
				return $elm$time$Time$Oct;
			case 11:
				return $elm$time$Time$Nov;
			default:
				return $elm$time$Time$Dec;
		}
	});
var $elm$time$Time$toYear = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).year;
	});
var $author$project$Main$monthLabel = F2(
	function (zone, e) {
		var t = $elm$time$Time$millisToPosix(
			$author$project$Main$doneMs(e));
		return $author$project$Main$monthNames(
			A2($elm$time$Time$toMonth, zone, t)).b + (' ' + $elm$core$String$fromInt(
			A2($elm$time$Time$toYear, zone, t)));
	});
var $elm$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _v0) {
				var trues = _v0.a;
				var falses = _v0.b;
				return pred(x) ? _Utils_Tuple2(
					A2($elm$core$List$cons, x, trues),
					falses) : _Utils_Tuple2(
					trues,
					A2($elm$core$List$cons, x, falses));
			});
		return A3(
			$elm$core$List$foldr,
			step,
			_Utils_Tuple2(_List_Nil, _List_Nil),
			list);
	});
var $author$project$Main$groupSorted = F2(
	function (zone, sorted) {
		if (!sorted.b) {
			return _List_Nil;
		} else {
			var e = sorted.a;
			var label = A2($author$project$Main$monthLabel, zone, e);
			var _v1 = A2(
				$elm$core$List$partition,
				function (x) {
					return _Utils_eq(
						A2($author$project$Main$monthLabel, zone, x),
						label);
				},
				sorted);
			var same = _v1.a;
			var others = _v1.b;
			return A2(
				$elm$core$List$cons,
				_Utils_Tuple2(label, same),
				A2($author$project$Main$groupSorted, zone, others));
		}
	});
var $author$project$Main$archiveGroups = F2(
	function (zone, entries) {
		return A2(
			$author$project$Main$groupSorted,
			zone,
			A2(
				$elm$core$List$sortBy,
				A2($elm$core$Basics$composeL, $elm$core$Basics$negate, $author$project$Main$doneMs),
				entries));
	});
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $author$project$Main$isArchived = function (e) {
	return !_Utils_eq(e.archivedAt, $elm$core$Maybe$Nothing);
};
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$Main$categoryName = F2(
	function (cats, mid) {
		return A2(
			$elm$core$Maybe$withDefault,
			'None',
			A2(
				$elm$core$Maybe$map,
				function ($) {
					return $.name;
				},
				A2(
					$elm$core$Maybe$andThen,
					$author$project$Main$findCategory(cats),
					mid)));
	});
var $author$project$Main$scopeWord = F2(
	function (cats, f) {
		switch (f.$) {
			case 'AnyCategory':
				return '';
			case 'OnlyCategory':
				var id = f.a;
				return A2(
					$author$project$Main$categoryName,
					cats,
					$elm$core$Maybe$Just(id));
			default:
				return 'uncategorised';
		}
	});
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$Main$CopyMonth = F2(
	function (a, b) {
		return {$: 'CopyMonth', a: a, b: b};
	});
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $author$project$Main$icon = function (name) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('icon icon-' + name),
				A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
			]),
		_List_Nil);
};
var $elm$virtual_dom$VirtualDom$lazy5 = _VirtualDom_lazy5;
var $elm$html$Html$Lazy$lazy5 = $elm$virtual_dom$VirtualDom$lazy5;
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$time$Time$toDay = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).day;
	});
var $author$project$Main$shortDate = F2(
	function (zone, e) {
		var t = $elm$time$Time$millisToPosix(
			$author$project$Main$doneMs(e));
		return $elm$core$String$fromInt(
			A2($elm$time$Time$toDay, zone, t)) + (' ' + $author$project$Main$monthNames(
			A2($elm$time$Time$toMonth, zone, t)).a);
	});
var $author$project$Main$summaryPrompt = F3(
	function (model, month, entries) {
		var prompt = function () {
			var _v2 = model.categoryFilter;
			switch (_v2.$) {
				case 'AnyCategory':
					return 'Summarise what I got done in ' + (month + '. Group by theme, mention the categories, and keep it under 150 words.');
				case 'OnlyCategory':
					var id = _v2.a;
					return 'Summarise my ' + (A2(
						$author$project$Main$categoryName,
						model.categories,
						$elm$core$Maybe$Just(id)) + (' todos from ' + (month + '. Group by theme and keep it under 150 words.')));
				default:
					return 'Summarise my uncategorised todos from ' + (month + '. Group by theme and keep it under 150 words.');
			}
		}();
		var bracket = function (e) {
			var _v0 = _Utils_Tuple2(
				model.categoryFilter,
				A2(
					$elm$core$Maybe$andThen,
					$author$project$Main$findCategory(model.categories),
					e.category));
			if ((_v0.a.$ === 'AnyCategory') && (_v0.b.$ === 'Just')) {
				var _v1 = _v0.a;
				var c = _v0.b.a;
				return '[' + (c.name + '] ');
			} else {
				return '';
			}
		};
		var line = function (e) {
			return '- ' + (bracket(e) + (A2(
				$elm$core$String$join,
				' ',
				$elm$core$String$words(e.description)) + (' (completed ' + (A2($author$project$Main$shortDate, model.zone, e) + ')'))));
		};
		return A2(
			$elm$core$String$join,
			'\n',
			A2(
				$elm$core$List$cons,
				prompt,
				A2(
					$elm$core$List$cons,
					'',
					A2($elm$core$List$map, line, entries))));
	});
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$Keyed$node = $elm$virtual_dom$VirtualDom$keyedNode;
var $elm$html$Html$Keyed$ul = $elm$html$Html$Keyed$node('ul');
var $author$project$Main$Delete = function (a) {
	return {$: 'Delete', a: a};
};
var $author$project$Main$PressCancel = {$: 'PressCancel'};
var $author$project$Main$Restore = function (a) {
	return {$: 'Restore', a: a};
};
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Main$viewMark = function (mc) {
	if (mc.$ === 'Just') {
		var c = mc.a;
		return A2(
			$elm$html$Html$span,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					'mark cat-' + ($elm$core$String$fromInt(c.color) + (' shape-' + $author$project$Main$shapeKey(c.shape)))),
					A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
				]),
			_List_Nil);
	} else {
		return A2(
			$elm$html$Html$span,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('mark mark-none'),
					A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
				]),
			_List_Nil);
	}
};
var $author$project$Main$markFor = F2(
	function (cats, mid) {
		return $author$project$Main$viewMark(
			A2(
				$elm$core$Maybe$andThen,
				$author$project$Main$findCategory(cats),
				mid));
	});
var $author$project$Main$touchOnly = function (dec) {
	return A2(
		$elm$json$Json$Decode$andThen,
		function (t) {
			return (t === 'touch') ? dec : $elm$json$Json$Decode$fail('not touch');
		},
		A2($elm$json$Json$Decode$field, 'pointerType', $elm$json$Json$Decode$string));
};
var $author$project$Main$onPressCancel = A2(
	$elm$html$Html$Events$on,
	'pointercancel',
	$author$project$Main$touchOnly(
		$elm$json$Json$Decode$succeed($author$project$Main$PressCancel)));
var $author$project$Main$PressMove = F2(
	function (a, b) {
		return {$: 'PressMove', a: a, b: b};
	});
var $author$project$Main$onPressMove = A2(
	$elm$html$Html$Events$on,
	'pointermove',
	$author$project$Main$touchOnly(
		A3(
			$elm$json$Json$Decode$map2,
			$author$project$Main$PressMove,
			A2($elm$json$Json$Decode$field, 'clientX', $elm$json$Json$Decode$float),
			A2($elm$json$Json$Decode$field, 'clientY', $elm$json$Json$Decode$float))));
var $author$project$Main$PressStart = F3(
	function (a, b, c) {
		return {$: 'PressStart', a: a, b: b, c: c};
	});
var $author$project$Main$onPressStart = function (id) {
	return A2(
		$elm$html$Html$Events$on,
		'pointerdown',
		$author$project$Main$touchOnly(
			A3(
				$elm$json$Json$Decode$map2,
				$author$project$Main$PressStart(id),
				A2($elm$json$Json$Decode$field, 'clientX', $elm$json$Json$Decode$float),
				A2($elm$json$Json$Decode$field, 'clientY', $elm$json$Json$Decode$float))));
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 'MayPreventDefault', a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $author$project$Main$onTouchContextMenu = A2(
	$elm$html$Html$Events$preventDefaultOn,
	'contextmenu',
	$author$project$Main$touchOnly(
		$elm$json$Json$Decode$succeed(
			_Utils_Tuple2($author$project$Main$NoOp, true))));
var $author$project$Main$viewArchiveEntry = F5(
	function (zone, cats, showMark, confirming, e) {
		return A2(
			$elm$html$Html$li,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('archive-row', true),
							_Utils_Tuple2('confirming', confirming)
						])),
					$author$project$Main$onTouchContextMenu
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('view'),
							$author$project$Main$onPressStart(e.id),
							$author$project$Main$onPressMove,
							A2(
							$elm$html$Html$Events$on,
							'pointerup',
							$author$project$Main$touchOnly(
								$elm$json$Json$Decode$succeed($author$project$Main$PressCancel))),
							$author$project$Main$onPressCancel
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$label,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text(e.description)
								])),
							(showMark && (!_Utils_eq(
							A2(
								$elm$core$Maybe$andThen,
								$author$project$Main$findCategory(cats),
								e.category),
							$elm$core$Maybe$Nothing))) ? A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('archive-mark')
								]),
							_List_fromArray(
								[
									A2($author$project$Main$markFor, cats, e.category)
								])) : $elm$html$Html$text(''),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('archive-actions')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('archive-restore'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Main$Restore(e.id))
										]),
									_List_fromArray(
										[
											$author$project$Main$icon('restore'),
											$elm$html$Html$text('Restore')
										])),
									A2(
									$elm$html$Html$button,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('archive-delete'),
											$elm$html$Html$Attributes$type_('button'),
											$elm$html$Html$Events$onClick(
											$author$project$Main$Delete(e.id))
										]),
									_List_fromArray(
										[
											$author$project$Main$icon('x'),
											$elm$html$Html$text('Delete')
										]))
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('archive-date')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2($author$project$Main$shortDate, zone, e))
								]))
						])),
					confirming ? A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('confirm-delete'),
							A2($elm$html$Html$Attributes$attribute, 'role', 'group'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Archived todo actions')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-alt'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$Restore(e.id))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Restore')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-yes'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$Delete(e.id))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Delete')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-no'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick($author$project$Main$DismissConfirm)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								]))
						])) : $elm$html$Html$text('')
				]));
	});
var $author$project$Main$viewArchiveGroup = F3(
	function (model, showMark, _v0) {
		var label = _v0.a;
		var entries = _v0.b;
		var flash = function () {
			var _v2 = model.copyFlash;
			if (_v2.$ === 'Just') {
				var _v3 = _v2.a;
				var month = _v3.a;
				var ok = _v3.b;
				return _Utils_eq(month, label) ? $elm$core$Maybe$Just(ok) : $elm$core$Maybe$Nothing;
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}();
		return A2(
			$elm$html$Html$section,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('todoapp archive-card')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h2,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-month')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(label)
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('copy-summary', true),
									_Utils_Tuple2(
									'flash',
									!_Utils_eq(flash, $elm$core$Maybe$Nothing))
								])),
							$elm$html$Html$Attributes$title('Copy this month as a prompt for a summary'),
							$elm$html$Html$Events$onClick(
							A2(
								$author$project$Main$CopyMonth,
								label,
								A3($author$project$Main$summaryPrompt, model, label, entries)))
						]),
					_List_fromArray(
						[
							$author$project$Main$icon('copy'),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									function () {
										if (flash.$ === 'Just') {
											if (flash.a) {
												return 'Copied';
											} else {
												return 'Copy failed';
											}
										} else {
											return 'Copy for summary';
										}
									}())
								]))
						])),
					A2(
					$elm$html$Html$Keyed$ul,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('todo-list')
						]),
					A2(
						$elm$core$List$map,
						function (e) {
							return _Utils_Tuple2(
								$elm$core$String$fromInt(e.id),
								A6(
									$elm$html$Html$Lazy$lazy5,
									$author$project$Main$viewArchiveEntry,
									model.zone,
									model.categories,
									showMark,
									_Utils_eq(
										model.confirmingDelete,
										$elm$core$Maybe$Just(e.id)),
									e));
						},
						entries))
				]));
	});
var $author$project$Main$OpenManage = {$: 'OpenManage'};
var $author$project$Main$SetCategoryFilter = function (a) {
	return {$: 'SetCategoryFilter', a: a};
};
var $author$project$Main$catText = function (c) {
	return 'cat-text-' + $elm$core$String$fromInt(c.color);
};
var $author$project$Main$filterId = function (f) {
	if (f.$ === 'OnlyCategory') {
		var id = f.a;
		return $elm$core$Maybe$Just(id);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$filterLabel = F2(
	function (cats, f) {
		switch (f.$) {
			case 'AnyCategory':
				return 'Any category';
			case 'OnlyCategory':
				var id = f.a;
				return A2(
					$author$project$Main$categoryName,
					cats,
					$elm$core$Maybe$Just(id));
			default:
				return 'No category';
		}
	});
var $author$project$Main$labelColour = function (mc) {
	if (mc.$ === 'Just') {
		var c = mc.a;
		return ' ' + $author$project$Main$catText(c);
	} else {
		return '';
	}
};
var $author$project$Main$ClearNoRing = {$: 'ClearNoRing'};
var $author$project$Main$CloseMenu = function (a) {
	return {$: 'CloseMenu', a: a};
};
var $author$project$Main$CloseMenuRefocus = function (a) {
	return {$: 'CloseMenuRefocus', a: a};
};
var $author$project$Main$FocusMenuItem = F2(
	function (a, b) {
		return {$: 'FocusMenuItem', a: a, b: b};
	});
var $author$project$Main$MenuPointer = function (a) {
	return {$: 'MenuPointer', a: a};
};
var $author$project$Main$ToggleMenu = function (a) {
	return {$: 'ToggleMenu', a: a};
};
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $author$project$Main$Batch = function (a) {
	return {$: 'Batch', a: a};
};
var $author$project$Main$OpenMenu = function (a) {
	return {$: 'OpenMenu', a: a};
};
var $elm$virtual_dom$VirtualDom$Custom = function (a) {
	return {$: 'Custom', a: a};
};
var $elm$html$Html$Events$custom = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Custom(decoder));
	});
var $author$project$Main$menuButtonKeys = function (which) {
	var kb = function (rest) {
		return $author$project$Main$Batch(
			A2(
				$elm$core$List$cons,
				$author$project$Main$ClearNoRing,
				A2(
					$elm$core$List$cons,
					$author$project$Main$MenuPointer(false),
					rest)));
	};
	var handled = function (msg) {
		return $elm$json$Json$Decode$succeed(
			{
				message: kb(
					_List_fromArray(
						[msg])),
				preventDefault: true,
				stopPropagation: true
			});
	};
	return A2(
		$elm$html$Html$Events$custom,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var key = _v0.a;
				var alt = _v0.b;
				if (alt) {
					return $elm$json$Json$Decode$fail('alt');
				} else {
					switch (key) {
						case 'Escape':
							return handled(
								$author$project$Main$CloseMenu(which));
						case 'ArrowDown':
							return handled(
								$author$project$Main$OpenMenu(which));
						case 'ArrowUp':
							return handled(
								$author$project$Main$OpenMenu(which));
						default:
							return $elm$json$Json$Decode$succeed(
								{
									message: kb(_List_Nil),
									preventDefault: false,
									stopPropagation: false
								});
					}
				}
			},
			A3(
				$elm$json$Json$Decode$map2,
				$elm$core$Tuple$pair,
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
				A2($elm$json$Json$Decode$field, 'altKey', $elm$json$Json$Decode$bool))));
};
var $author$project$Main$menuKeys = function (table) {
	return A2(
		$elm$html$Html$Events$custom,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var key = _v0.a;
				var alt = _v0.b;
				var _v1 = _Utils_Tuple2(
					alt,
					$elm$core$List$head(
						A2(
							$elm$core$List$filter,
							function (_v2) {
								var k = _v2.a;
								return _Utils_eq(k, key);
							},
							table)));
				if ((!_v1.a) && (_v1.b.$ === 'Just')) {
					var _v3 = _v1.b.a;
					var msg = _v3.b;
					return $elm$json$Json$Decode$succeed(
						{message: msg, preventDefault: key !== 'Tab', stopPropagation: true});
				} else {
					return $elm$json$Json$Decode$fail('ignored key');
				}
			},
			A3(
				$elm$json$Json$Decode$map2,
				$elm$core$Tuple$pair,
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
				A2($elm$json$Json$Decode$field, 'altKey', $elm$json$Json$Decode$bool))));
};
var $elm$html$Html$Attributes$tabindex = function (n) {
	return A2(
		_VirtualDom_attribute,
		'tabIndex',
		$elm$core$String$fromInt(n));
};
var $author$project$Main$viewMenu = F2(
	function (which, spec) {
		var prefix = $author$project$Main$menuPrefix(which);
		var n = $elm$core$List$length(spec.rows);
		var leavesMenu = A2(
			$elm$json$Json$Decode$andThen,
			function (rel) {
				if (rel.$ === 'Just') {
					var relId = rel.a;
					return A2($elm$core$String$startsWith, prefix, relId) ? $elm$json$Json$Decode$fail('still inside') : $elm$json$Json$Decode$succeed(
						$author$project$Main$CloseMenu(which));
				} else {
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$CloseMenu(which));
				}
			},
			A2(
				$elm$json$Json$Decode$at,
				_List_fromArray(
					['relatedTarget']),
				$elm$json$Json$Decode$nullable(
					A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string))));
		var item = F2(
			function (i, r) {
				return _List_fromArray(
					[
						r.divider ? A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('menu-sep'),
								A2($elm$html$Html$Attributes$attribute, 'role', 'separator')
							]),
						_List_Nil) : $elm$html$Html$text(''),
						A2(
						$elm$html$Html$button,
						_Utils_ap(
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Attributes$id(
									prefix + ('item-' + $elm$core$String$fromInt(i))),
									$elm$html$Html$Attributes$tabindex(-1),
									$elm$html$Html$Attributes$classList(
									_List_fromArray(
										[
											_Utils_Tuple2('menu-item', true),
											_Utils_Tuple2(
											'selected',
											_Utils_eq(
												r.selected,
												$elm$core$Maybe$Just(true))),
											_Utils_Tuple2(
											'menu-edit',
											_Utils_eq(r.selected, $elm$core$Maybe$Nothing))
										])),
									$elm$html$Html$Events$onClick(r.pick),
									A2(
									$elm$html$Html$Events$on,
									'pointerdown',
									$elm$json$Json$Decode$succeed(
										$author$project$Main$MenuPointer(true))),
									A2(
									$elm$html$Html$Events$preventDefaultOn,
									'mousedown',
									$elm$json$Json$Decode$succeed(
										_Utils_Tuple2($author$project$Main$NoOp, true))),
									$author$project$Main$menuKeys(
									_List_fromArray(
										[
											_Utils_Tuple2(
											'ArrowDown',
											A2(
												$author$project$Main$FocusMenuItem,
												which,
												A2($elm$core$Basics$modBy, n, i + 1))),
											_Utils_Tuple2(
											'ArrowUp',
											A2(
												$author$project$Main$FocusMenuItem,
												which,
												A2($elm$core$Basics$modBy, n, i - 1))),
											_Utils_Tuple2(
											'Home',
											A2($author$project$Main$FocusMenuItem, which, 0)),
											_Utils_Tuple2(
											'End',
											A2($author$project$Main$FocusMenuItem, which, n - 1)),
											_Utils_Tuple2(
											'Escape',
											$author$project$Main$CloseMenuRefocus(which)),
											_Utils_Tuple2(
											'Tab',
											$author$project$Main$CloseMenu(which))
										]))
								]),
							function () {
								var _v3 = r.selected;
								if (_v3.$ === 'Just') {
									var sel = _v3.a;
									return _List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'role', 'menuitemradio'),
											A2(
											$elm$html$Html$Attributes$attribute,
											'aria-checked',
											sel ? 'true' : 'false')
										]);
								} else {
									return _List_fromArray(
										[
											A2($elm$html$Html$Attributes$attribute, 'role', 'menuitem')
										]);
								}
							}()),
						_Utils_ap(
							function () {
								var _v4 = r.selected;
								if (_v4.$ === 'Just') {
									var sel = _v4.a;
									return _List_fromArray(
										[
											A2(
											$elm$html$Html$span,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('menu-check'),
													A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(
													sel ? '\u2713' : '')
												]))
										]);
								} else {
									return _List_Nil;
								}
							}(),
							_Utils_ap(
								r.content,
								function () {
									var _v5 = r.count;
									if (_v5.$ === 'Just') {
										var c = _v5.a;
										return _List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('menu-count')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														$elm$core$String$fromInt(c))
													]))
											]);
									} else {
										return _List_Nil;
									}
								}())))
					]);
			});
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('type-menu-wrap ' + spec.wrapClass),
					A2($elm$html$Html$Events$on, 'focusout', leavesMenu)
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$id(prefix + 'button'),
							$elm$html$Html$Attributes$class(spec.buttonClass),
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('deviates', spec.deviates),
									_Utils_Tuple2('no-ring', spec.noRing)
								])),
							A2(
							$elm$html$Html$Events$on,
							'pointerdown',
							$elm$json$Json$Decode$succeed(
								$author$project$Main$MenuPointer(true))),
							A2(
							$elm$html$Html$Events$on,
							'blur',
							$elm$json$Json$Decode$succeed($author$project$Main$ClearNoRing)),
							A2($elm$html$Html$Attributes$attribute, 'aria-haspopup', 'menu'),
							A2($elm$html$Html$Attributes$attribute, 'aria-controls', prefix + 'menu'),
							A2(
							$elm$html$Html$Attributes$attribute,
							'aria-expanded',
							spec.open ? 'true' : 'false'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', spec.label),
							$elm$html$Html$Events$onClick(
							$author$project$Main$ToggleMenu(which)),
							A2(
							$elm$html$Html$Events$preventDefaultOn,
							'mousedown',
							$elm$json$Json$Decode$succeed(
								_Utils_Tuple2($author$project$Main$NoOp, true))),
							$author$project$Main$menuButtonKeys(which)
						]),
					spec.buttonContent),
					function () {
					if (spec.open) {
						var render = $elm$core$List$concatMap(
							function (_v2) {
								var i = _v2.a;
								var r = _v2.b;
								return A2(item, i, r);
							});
						var _v0 = A2(
							$elm$core$List$partition,
							function (_v1) {
								var r = _v1.b;
								return !_Utils_eq(r.selected, $elm$core$Maybe$Nothing);
							},
							A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, spec.rows));
						var choices = _v0.a;
						var actions = _v0.b;
						return A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$classList(
									_List_fromArray(
										[
											_Utils_Tuple2('type-menu', true),
											_Utils_Tuple2('menu-down', spec.down),
											_Utils_Tuple2(
											'menu-status',
											_Utils_eq(which, $author$project$Main$StatusMenu))
										])),
									$elm$html$Html$Attributes$id(prefix + 'menu'),
									A2($elm$html$Html$Attributes$attribute, 'role', 'menu')
								]),
							A2(
								$elm$core$List$cons,
								A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('menu-list'),
											A2($elm$html$Html$Attributes$attribute, 'role', 'none')
										]),
									render(choices)),
								render(actions)));
					} else {
						return $elm$html$Html$text('');
					}
				}()
				]));
	});
var $author$project$Main$viewCategoryMenu = F3(
	function (withEdit, model, base) {
		var edit = {
			content: _List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('menu-mark')
						]),
					_List_fromArray(
						[
							$author$project$Main$icon('gear')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('menu-label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Manage categories\u2026')
						]))
				]),
			count: $elm$core$Maybe$Nothing,
			divider: true,
			pick: $author$project$Main$OpenManage,
			selected: $elm$core$Maybe$Nothing
		};
		var current = model.categoryFilter;
		var cats = model.categories;
		var content = function (f) {
			switch (f.$) {
				case 'AnyCategory':
					return _List_fromArray(
						[
							$author$project$Main$icon('any'),
							$elm$html$Html$text('Any category')
						]);
				case 'OnlyCategory':
					var id = f.a;
					return _List_fromArray(
						[
							A2(
							$author$project$Main$markFor,
							cats,
							$elm$core$Maybe$Just(id)),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('tf-name')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									A2(
										$author$project$Main$categoryName,
										cats,
										$elm$core$Maybe$Just(id)))
								]))
						]);
				default:
					return _List_fromArray(
						[
							$author$project$Main$icon('dash'),
							$elm$html$Html$text('No category')
						]);
			}
		};
		var rowContent = function (f) {
			return _List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('menu-mark')
						]),
					function () {
						switch (f.$) {
							case 'AnyCategory':
								return _List_fromArray(
									[
										$author$project$Main$icon('any')
									]);
							case 'OnlyCategory':
								var id = f.a;
								return _List_fromArray(
									[
										A2(
										$author$project$Main$markFor,
										cats,
										$elm$core$Maybe$Just(id))
									]);
							default:
								return _List_fromArray(
									[
										$author$project$Main$icon('dash')
									]);
						}
					}()),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class(
							'menu-label tf-name' + $author$project$Main$labelColour(
								A2(
									$elm$core$Maybe$andThen,
									$author$project$Main$findCategory(cats),
									$author$project$Main$filterId(f))))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2($author$project$Main$filterLabel, cats, f))
						]))
				]);
		};
		var row = function (f) {
			return {
				content: rowContent(f),
				count: $elm$core$Maybe$Just(
					$elm$core$List$length(
						A2(
							$elm$core$List$filter,
							$author$project$Main$inScope(f),
							base))),
				divider: false,
				pick: $author$project$Main$SetCategoryFilter(f),
				selected: $elm$core$Maybe$Just(
					_Utils_eq(f, current))
			};
		};
		return A2(
			$author$project$Main$viewMenu,
			$author$project$Main$CatMenu,
			{
				buttonClass: function () {
					if (current.$ === 'OnlyCategory') {
						var id = current.a;
						var _v1 = A2($author$project$Main$findCategory, cats, id);
						if (_v1.$ === 'Just') {
							var c = _v1.a;
							return 'menu-button ' + $author$project$Main$catText(c);
						} else {
							return 'menu-button';
						}
					} else {
						return 'menu-button';
					}
				}(),
				buttonContent: content(current),
				deviates: !_Utils_eq(current, $author$project$Main$AnyCategory),
				down: model.menuDown,
				label: 'Category filter: ' + A2($author$project$Main$filterLabel, cats, current),
				noRing: _Utils_eq(
					model.noRing,
					$elm$core$Maybe$Just($author$project$Main$CatMenu)),
				open: _Utils_eq(
					model.menuOpen,
					$elm$core$Maybe$Just($author$project$Main$CatMenu)),
				rows: _Utils_ap(
					A2(
						$elm$core$List$map,
						row,
						$author$project$Main$menuFilters(cats)),
					withEdit ? _List_fromArray(
						[edit]) : _List_Nil),
				wrapClass: ''
			});
	});
var $author$project$Main$viewArchive = function (model) {
	var showMark = _Utils_eq(model.categoryFilter, $author$project$Main$AnyCategory) && (!$elm$core$List$isEmpty(model.categories));
	var archived = A2(
		$elm$core$List$filter,
		function (e) {
			return $author$project$Main$isArchived(e) && A2($author$project$Main$inScope, model.categoryFilter, e);
		},
		model.entries);
	return A2(
		$elm$core$List$cons,
		A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('archive-bar')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-back'),
							$elm$html$Html$Attributes$href(model.returnTo)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('\u2190 Back')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-count'),
							A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$fromInt(
								$elm$core$List$length(archived)) + ' archived')
						])),
					$elm$core$List$isEmpty(model.categories) ? $elm$html$Html$text('') : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-bar-menu')
						]),
					_List_fromArray(
						[
							A3(
							$author$project$Main$viewCategoryMenu,
							false,
							model,
							A2($elm$core$List$filter, $author$project$Main$isArchived, model.entries))
						]))
				])),
		$elm$core$List$isEmpty(archived) ? _List_fromArray(
			[
				A2(
				$elm$html$Html$section,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('todoapp archive-card')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('archive-empty')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								((!_Utils_eq(model.categoryFilter, $author$project$Main$AnyCategory)) && A2($elm$core$List$any, $author$project$Main$isArchived, model.entries)) ? ('No archived ' + (A2($author$project$Main$scopeWord, model.categories, model.categoryFilter) + ' todos.')) : 'Nothing archived yet.')
							]))
					]))
			]) : A2(
			$elm$core$List$map,
			A2($author$project$Main$viewArchiveGroup, model, showMark),
			A2($author$project$Main$archiveGroups, model.zone, archived)));
};
var $author$project$Main$ArchiveCompleted = {$: 'ArchiveCompleted'};
var $author$project$Main$OpenArchive = {$: 'OpenArchive'};
var $author$project$Main$SetStatus = function (a) {
	return {$: 'SetStatus', a: a};
};
var $author$project$Main$statusIcon = function (v) {
	switch (v.$) {
		case 'Completed':
			return $author$project$Main$icon('completed');
		case 'All':
			return $author$project$Main$icon('all');
		default:
			return $author$project$Main$icon('active');
	}
};
var $author$project$Main$statusName = function (v) {
	switch (v.$) {
		case 'Completed':
			return 'Completed';
		case 'All':
			return 'All';
		default:
			return 'Active';
	}
};
var $author$project$Main$viewStatusMenu = F2(
	function (model, scoped) {
		var row = function (v) {
			return {
				content: _List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('menu-mark')
							]),
						_List_fromArray(
							[
								$author$project$Main$statusIcon(v)
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('menu-label')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Main$statusName(v))
							]))
					]),
				count: $elm$core$Maybe$Just(
					$elm$core$List$length(
						A2(
							$elm$core$List$filter,
							$author$project$Main$isVisible(v),
							scoped))),
				divider: false,
				pick: $author$project$Main$SetStatus(v),
				selected: $elm$core$Maybe$Just(
					_Utils_eq(model.visibility, v))
			};
		};
		var archivedCount = $elm$core$List$length(
			A2(
				$elm$core$List$filter,
				function (e) {
					return $author$project$Main$isArchived(e) && A2($author$project$Main$inScope, model.categoryFilter, e);
				},
				model.entries));
		var archivedRow = {
			content: _List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('menu-mark')
						]),
					_List_fromArray(
						[
							$author$project$Main$icon('archive')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('menu-label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Archived')
						]))
				]),
			count: $elm$core$Maybe$Just(archivedCount),
			divider: true,
			pick: $author$project$Main$OpenArchive,
			selected: $elm$core$Maybe$Nothing
		};
		return A2(
			$author$project$Main$viewMenu,
			$author$project$Main$StatusMenu,
			{
				buttonClass: 'menu-button',
				buttonContent: _List_fromArray(
					[
						$author$project$Main$statusIcon(model.visibility),
						$elm$html$Html$text(
						$author$project$Main$statusName(model.visibility))
					]),
				deviates: !_Utils_eq(model.visibility, $author$project$Main$Active),
				down: model.menuDown,
				label: 'Status: ' + $author$project$Main$statusName(model.visibility),
				noRing: _Utils_eq(
					model.noRing,
					$elm$core$Maybe$Just($author$project$Main$StatusMenu)),
				open: _Utils_eq(
					model.menuOpen,
					$elm$core$Maybe$Just($author$project$Main$StatusMenu)),
				rows: _Utils_ap(
					A2($elm$core$List$map, row, $author$project$Main$statusOrder),
					(archivedCount > 0) ? _List_fromArray(
						[archivedRow]) : _List_Nil),
				wrapClass: ''
			});
	});
var $author$project$Main$viewControls = function (model) {
	var statusScoped = A2(
		$elm$core$List$filter,
		function (e) {
			return $author$project$Main$isLive(e) && A2($author$project$Main$isVisible, model.visibility, e);
		},
		model.entries);
	var scoped = A2(
		$elm$core$List$filter,
		function (e) {
			return $author$project$Main$isLive(e) && A2($author$project$Main$inScope, model.categoryFilter, e);
		},
		model.entries);
	var completed = $elm$core$List$length(
		A2(
			$elm$core$List$filter,
			function ($) {
				return $.completed;
			},
			scoped));
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('filter-line')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('filter-menus')
					]),
				_List_fromArray(
					[
						A2($author$project$Main$viewStatusMenu, model, scoped),
						$elm$core$List$isEmpty(model.categories) ? A2(
						$elm$html$Html$a,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('add-categories'),
								$elm$html$Html$Attributes$href('#/categories')
							]),
						_List_fromArray(
							[
								$author$project$Main$icon('plus'),
								$elm$html$Html$text('Add categories\u2026')
							])) : A3($author$project$Main$viewCategoryMenu, true, model, statusScoped)
					])),
				(_Utils_eq(model.visibility, $author$project$Main$Completed) && (completed > 0)) ? A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$class('clear-completed'),
						$elm$html$Html$Events$onClick($author$project$Main$ArchiveCompleted)
					]),
				_List_fromArray(
					[
						$author$project$Main$icon('archive'),
						$elm$html$Html$text('Archive all')
					])) : $elm$html$Html$text('')
			]));
};
var $author$project$Main$UpdateField = function (a) {
	return {$: 'UpdateField', a: a};
};
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$autofocus = $elm$html$Html$Attributes$boolProperty('autofocus');
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $author$project$Main$Add = {$: 'Add'};
var $author$project$Main$CycleNewCategory = {$: 'CycleNewCategory'};
var $author$project$Main$newTodoKeydown = A2(
	$elm$json$Json$Decode$andThen,
	$elm$core$Basics$identity,
	A5(
		$elm$json$Json$Decode$map4,
		F4(
			function (key, alt, code, shift) {
				return ((key === 'Enter') && (!shift)) ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2($author$project$Main$Add, true)) : ((alt && ((code === 'KeyT') || (key === '†'))) ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2($author$project$Main$CycleNewCategory, true)) : $elm$json$Json$Decode$fail('ignored key'));
			}),
		A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'altKey', $elm$json$Json$Decode$bool),
		A2($elm$json$Json$Decode$field, 'code', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'shiftKey', $elm$json$Json$Decode$bool)));
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 'MayStopPropagation', a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$SetNewCategory = function (a) {
	return {$: 'SetNewCategory', a: a};
};
var $author$project$Main$viewTypeChoice = F3(
	function (cats, selected, choice) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$type_('button'),
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('type-choice', true),
							_Utils_Tuple2(
							'selected',
							_Utils_eq(selected, choice))
						])),
					A2(
					$elm$html$Html$Attributes$attribute,
					'aria-label',
					A2($author$project$Main$categoryName, cats, choice)),
					A2(
					$elm$html$Html$Attributes$attribute,
					'aria-pressed',
					_Utils_eq(selected, choice) ? 'true' : 'false'),
					$elm$html$Html$Events$onClick(
					$author$project$Main$SetNewCategory(choice))
				]),
			_List_fromArray(
				[
					A2($author$project$Main$markFor, cats, choice),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('label')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2($author$project$Main$categoryName, cats, choice))
						]))
				]));
	});
var $author$project$Main$viewInput = F3(
	function (task, cats, newCat) {
		return A2(
			$elm$html$Html$header,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('header', true),
							_Utils_Tuple2(
							'no-picker',
							$elm$core$List$isEmpty(cats))
						]))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h1,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('todos')
						])),
					A2(
					$elm$html$Html$textarea,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('new-todo'),
							$elm$html$Html$Attributes$rows(1),
							$elm$html$Html$Attributes$placeholder('What needs to be done?'),
							$elm$html$Html$Attributes$autofocus(true),
							$elm$html$Html$Attributes$value(task),
							$elm$html$Html$Attributes$name('newTodo'),
							$elm$html$Html$Attributes$id('new-todo'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'New todo'),
							$elm$html$Html$Events$onInput($author$project$Main$UpdateField),
							A2($elm$html$Html$Events$preventDefaultOn, 'keydown', $author$project$Main$newTodoKeydown)
						]),
					_List_Nil),
					$elm$core$List$isEmpty(cats) ? $elm$html$Html$text('') : A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('type-picker-wrap')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('type-picker'),
									A2($elm$html$Html$Attributes$attribute, 'role', 'group'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Category for new todos'),
									$elm$html$Html$Attributes$title('Category for new todos (Alt+T)')
								]),
							A2(
								$elm$core$List$map,
								A2($author$project$Main$viewTypeChoice, cats, newCat),
								A2(
									$elm$core$List$cons,
									$elm$core$Maybe$Nothing,
									A2(
										$elm$core$List$map,
										A2(
											$elm$core$Basics$composeL,
											$elm$core$Maybe$Just,
											function ($) {
												return $.id;
											}),
										cats))))
						]))
				]));
	});
var $author$project$Main$isRowMenu = function (w) {
	if ((w.$ === 'Just') && (w.a.$ === 'RowMenu')) {
		return true;
	} else {
		return false;
	}
};
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $author$project$Main$statusWord = function (v) {
	switch (v.$) {
		case 'All':
			return '';
		case 'Active':
			return 'active';
		case 'Completed':
			return 'completed';
		case 'ArchiveView':
			return '';
		default:
			return '';
	}
};
var $author$project$Main$viewEmptyFiltered = F4(
	function (visibility, cats, filter, total) {
		var words = A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$filter,
				A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
				_List_fromArray(
					[
						'No',
						$author$project$Main$statusWord(visibility),
						A2($author$project$Main$scopeWord, cats, filter),
						'todos.'
					])));
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('empty empty-filtered')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('empty-title')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(words)
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('empty-sub')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							(total === 1) ? '1 todo is hidden by the filter.' : ($elm$core$String$fromInt(total) + ' todos are hidden by the filter.'))
						]))
				]));
	});
var $author$project$Main$Floating = F2(
	function (a, b) {
		return {$: 'Floating', a: a, b: b};
	});
var $author$project$Main$Shifted = function (a) {
	return {$: 'Shifted', a: a};
};
var $author$project$Main$Still = {$: 'Still'};
var $author$project$Main$gapShift = F2(
	function (d, id) {
		var ids = A2(
			$elm$core$List$map,
			function ($) {
				return $.id;
			},
			d.rects);
		var h = A2(
			$elm$core$Maybe$withDefault,
			0,
			A2(
				$elm$core$Maybe$map,
				function ($) {
					return $.height;
				},
				$elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (r) {
							return _Utils_eq(r.id, d.id);
						},
						d.rects))));
		var _v0 = _Utils_Tuple2(
			A2($author$project$Main$indexOf, d.id, ids),
			A2($author$project$Main$indexOf, id, ids));
		if ((_v0.a.$ === 'Just') && (_v0.b.$ === 'Just')) {
			var o = _v0.a.a;
			var i = _v0.b.a;
			return ((_Utils_cmp(o, d.slot) < 0) && ((_Utils_cmp(i, o) > 0) && (_Utils_cmp(i, d.slot) < 1))) ? (-h) : (((_Utils_cmp(o, d.slot) > 0) && ((_Utils_cmp(i, d.slot) > -1) && (_Utils_cmp(i, o) < 0))) ? h : 0);
		} else {
			return 0;
		}
	});
var $elm$core$List$sum = function (numbers) {
	return A3($elm$core$List$foldl, $elm$core$Basics$add, 0, numbers);
};
var $author$project$Main$slotOffset = function (d) {
	var ids = A2(
		$elm$core$List$map,
		function ($) {
			return $.id;
		},
		d.rects);
	var between = F2(
		function (lo, hi) {
			return $elm$core$List$sum(
				A2(
					$elm$core$List$map,
					A2(
						$elm$core$Basics$composeR,
						$elm$core$Tuple$second,
						function ($) {
							return $.height;
						}),
					A2(
						$elm$core$List$filter,
						function (_v1) {
							var i = _v1.a;
							return (_Utils_cmp(i, lo) > -1) && (_Utils_cmp(i, hi) < 1);
						},
						A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, d.rects))));
		});
	var _v0 = A2($author$project$Main$indexOf, d.id, ids);
	if (_v0.$ === 'Just') {
		var o = _v0.a;
		return (_Utils_cmp(o, d.slot) < 0) ? A2(between, o + 1, d.slot) : ((_Utils_cmp(o, d.slot) > 0) ? (-A2(between, d.slot, o - 1)) : 0);
	} else {
		return 0;
	}
};
var $author$project$Main$rowDrag = F2(
	function (drag, id) {
		if (drag.$ === 'Just') {
			var d = drag.a;
			if (!d.active) {
				return $author$project$Main$Still;
			} else {
				if (_Utils_eq(d.id, id)) {
					return A2(
						$author$project$Main$Floating,
						d.pageY - d.startPageY,
						$author$project$Main$slotOffset(d));
				} else {
					var dy = A2($author$project$Main$gapShift, d, id);
					return (!dy) ? $author$project$Main$Still : $author$project$Main$Shifted(dy);
				}
			}
		} else {
			return $author$project$Main$Still;
		}
	});
var $elm$virtual_dom$VirtualDom$lazy7 = _VirtualDom_lazy7;
var $elm$html$Html$Lazy$lazy7 = $elm$virtual_dom$VirtualDom$lazy7;
var $author$project$Main$ArchiveItem = function (a) {
	return {$: 'ArchiveItem', a: a};
};
var $author$project$Main$Check = F2(
	function (a, b) {
		return {$: 'Check', a: a, b: b};
	});
var $author$project$Main$UpdateEntry = F2(
	function (a, b) {
		return {$: 'UpdateEntry', a: a, b: b};
	});
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $elm$core$String$fromFloat = _String_fromNumber;
var $elm$html$Html$input = _VirtualDom_node('input');
var $author$project$Main$isFloating = function (rd) {
	if (rd.$ === 'Floating') {
		return true;
	} else {
		return false;
	}
};
var $elm$html$Html$Events$onBlur = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'blur',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Events$onDoubleClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'dblclick',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$Main$CancelEdit = function (a) {
	return {$: 'CancelEdit', a: a};
};
var $author$project$Main$onEditKeydown = function (id) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var key = _v0.a;
				var shift = _v0.b;
				return ((key === 'Enter') && (!shift)) ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2(
						A2($author$project$Main$EditingEntry, id, false),
						true)) : ((key === 'Escape') ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2(
						$author$project$Main$CancelEdit(id),
						false)) : $elm$json$Json$Decode$fail('ignored key'));
			},
			A3(
				$elm$json$Json$Decode$map2,
				$elm$core$Tuple$pair,
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
				A2($elm$json$Json$Decode$field, 'shiftKey', $elm$json$Json$Decode$bool))));
};
var $author$project$Main$DragStart = F5(
	function (a, b, c, d, e) {
		return {$: 'DragStart', a: a, b: b, c: c, d: d, e: e};
	});
var $author$project$Main$Down = F5(
	function (pointerType, button, x, y, pageY) {
		return {button: button, pageY: pageY, pointerType: pointerType, x: x, y: y};
	});
var $author$project$Main$downDecoder = A2(
	$author$project$Main$andMap,
	A2($elm$json$Json$Decode$field, 'pageY', $elm$json$Json$Decode$float),
	A2(
		$author$project$Main$andMap,
		A2($elm$json$Json$Decode$field, 'clientY', $elm$json$Json$Decode$float),
		A2(
			$author$project$Main$andMap,
			A2($elm$json$Json$Decode$field, 'clientX', $elm$json$Json$Decode$float),
			A2(
				$author$project$Main$andMap,
				A2($elm$json$Json$Decode$field, 'button', $elm$json$Json$Decode$int),
				A2(
					$author$project$Main$andMap,
					A2($elm$json$Json$Decode$field, 'pointerType', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed($author$project$Main$Down))))));
var $author$project$Main$onHandleDown = function (id) {
	return A2(
		$elm$html$Html$Events$on,
		'pointerdown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (d) {
				return (!(!d.button)) ? $elm$json$Json$Decode$fail('not primary') : $elm$json$Json$Decode$succeed(
					A5($author$project$Main$DragStart, id, d.x, d.y, d.pageY, d.pointerType === 'touch'));
			},
			$author$project$Main$downDecoder));
};
var $author$project$Main$PressEnd = function (a) {
	return {$: 'PressEnd', a: a};
};
var $author$project$Main$onPressEnd = function (id) {
	return A2(
		$elm$html$Html$Events$on,
		'pointerup',
		$author$project$Main$touchOnly(
			$elm$json$Json$Decode$succeed(
				$author$project$Main$PressEnd(id))));
};
var $author$project$Main$climbToDraggable = function (_v0) {
	return A2(
		$elm$json$Json$Decode$andThen,
		function (tag) {
			return A2(
				$elm$core$List$member,
				tag,
				_List_fromArray(
					['INPUT', 'TEXTAREA', 'BUTTON'])) ? $elm$json$Json$Decode$succeed(false) : A2(
				$elm$json$Json$Decode$andThen,
				function (cls) {
					return A2(
						$elm$core$List$any,
						function (c) {
							return A2(
								$elm$core$List$member,
								c,
								_List_fromArray(
									['drag-handle', 'confirm-delete', 'type-menu']));
						},
						$elm$core$String$words(cls)) ? $elm$json$Json$Decode$succeed(false) : ((tag === 'LI') ? $elm$json$Json$Decode$succeed(true) : $elm$json$Json$Decode$oneOf(
						_List_fromArray(
							[
								A2(
								$elm$json$Json$Decode$field,
								'parentElement',
								$elm$json$Json$Decode$lazy($author$project$Main$climbToDraggable)),
								$elm$json$Json$Decode$succeed(true)
							])));
				},
				A2(
					$elm$json$Json$Decode$field,
					'className',
					$elm$json$Json$Decode$oneOf(
						_List_fromArray(
							[
								$elm$json$Json$Decode$string,
								$elm$json$Json$Decode$succeed('')
							]))));
		},
		A2($elm$json$Json$Decode$field, 'tagName', $elm$json$Json$Decode$string));
};
var $author$project$Main$onRowDown = F2(
	function (id, editing) {
		return A2(
			$elm$html$Html$Events$on,
			'pointerdown',
			A2(
				$elm$json$Json$Decode$andThen,
				function (d) {
					return (editing || ((!(!d.button)) || (d.pointerType === 'touch'))) ? $elm$json$Json$Decode$fail('not a mouse/pen primary press') : A2(
						$elm$json$Json$Decode$andThen,
						function (ok) {
							return ok ? $elm$json$Json$Decode$succeed(
								A5($author$project$Main$DragStart, id, d.x, d.y, d.pageY, false)) : $elm$json$Json$Decode$fail('interactive target');
						},
						A2(
							$elm$json$Json$Decode$field,
							'target',
							$author$project$Main$climbToDraggable(_Utils_Tuple0)));
				},
				$author$project$Main$downDecoder));
	});
var $author$project$Main$MoveBy = F2(
	function (a, b) {
		return {$: 'MoveBy', a: a, b: b};
	});
var $elm$json$Json$Decode$map3 = _Json_map3;
var $author$project$Main$onRowKeydown = function (id) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (_v0) {
				var key = _v0.a;
				var alt = _v0.b;
				var tag = _v0.c;
				return (alt && ((tag !== 'TEXTAREA') && (key === 'ArrowUp'))) ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2(
						A2($author$project$Main$MoveBy, id, -1),
						true)) : ((alt && ((tag !== 'TEXTAREA') && (key === 'ArrowDown'))) ? $elm$json$Json$Decode$succeed(
					_Utils_Tuple2(
						A2($author$project$Main$MoveBy, id, 1),
						true)) : $elm$json$Json$Decode$fail('ignored key'));
			},
			A4(
				$elm$json$Json$Decode$map3,
				F3(
					function (key, alt, tag) {
						return _Utils_Tuple3(key, alt, tag);
					}),
				A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
				A2($elm$json$Json$Decode$field, 'altKey', $elm$json$Json$Decode$bool),
				A2(
					$elm$json$Json$Decode$at,
					_List_fromArray(
						['target', 'tagName']),
					$elm$json$Json$Decode$string))));
};
var $author$project$Main$SetEntryCategory = F2(
	function (a, b) {
		return {$: 'SetEntryCategory', a: a, b: b};
	});
var $author$project$Main$viewRowCategoryMenu = F5(
	function (cats, menu, ringless, todo, mc) {
		var row = function (choice) {
			return {
				content: _List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('menu-mark')
							]),
						_List_fromArray(
							[
								A2($author$project$Main$markFor, cats, choice)
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class(
								'menu-label tf-name' + $author$project$Main$labelColour(
									A2(
										$elm$core$Maybe$andThen,
										$author$project$Main$findCategory(cats),
										choice)))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								_Utils_eq(choice, $elm$core$Maybe$Nothing) ? 'No category' : A2($author$project$Main$categoryName, cats, choice))
							]))
					]),
				count: $elm$core$Maybe$Nothing,
				divider: false,
				pick: A2($author$project$Main$SetEntryCategory, todo.id, choice),
				selected: $elm$core$Maybe$Just(
					_Utils_eq(choice, todo.category))
			};
		};
		return A2(
			$author$project$Main$viewMenu,
			$author$project$Main$RowMenu(todo.id),
			{
				buttonClass: 'row-type',
				buttonContent: function () {
					if (mc.$ === 'Just') {
						var c = mc.a;
						return _List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class(
										'label ' + $author$project$Main$catText(c))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(c.name)
									])),
								$author$project$Main$viewMark(mc)
							]);
					} else {
						return _List_fromArray(
							[
								$author$project$Main$viewMark($elm$core$Maybe$Nothing)
							]);
					}
				}(),
				deviates: false,
				down: A2($elm$core$Maybe$withDefault, false, menu),
				label: 'Category: ' + (A2($author$project$Main$categoryName, cats, todo.category) + '. Change category'),
				noRing: ringless,
				open: !_Utils_eq(menu, $elm$core$Maybe$Nothing),
				rows: A2(
					$elm$core$List$map,
					row,
					$author$project$Main$rowMenuChoices(cats)),
				wrapClass: _Utils_eq(mc, $elm$core$Maybe$Nothing) ? 'row-cat row-cat-none' : 'row-cat'
			});
	});
var $author$project$Main$viewEntry = F7(
	function (cats, showMark, confirming, rd, menu, ringless, todo) {
		return A2(
			$elm$html$Html$li,
			_Utils_ap(
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('completed', todo.completed),
								_Utils_Tuple2('editing', todo.editing),
								_Utils_Tuple2('confirming', confirming),
								_Utils_Tuple2(
								'dragging',
								$author$project$Main$isFloating(rd))
							])),
						$elm$html$Html$Attributes$id(
						'row-' + $elm$core$String$fromInt(todo.id)),
						$author$project$Main$onTouchContextMenu,
						A2($author$project$Main$onRowDown, todo.id, todo.editing),
						$author$project$Main$onRowKeydown(todo.id)
					]),
				function () {
					switch (rd.$) {
						case 'Shifted':
							var dy = rd.a;
							return _List_fromArray(
								[
									A2(
									$elm$html$Html$Attributes$style,
									'transform',
									'translateY(' + ($elm$core$String$fromFloat(dy) + 'px)'))
								]);
						case 'Floating':
							var slotOff = rd.b;
							return _List_fromArray(
								[
									A2(
									$elm$html$Html$Attributes$style,
									'transform',
									'translateY(' + ($elm$core$String$fromFloat(slotOff) + 'px)'))
								]);
						default:
							return _List_Nil;
					}
				}()),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					A2(
						$elm$core$List$cons,
						$elm$html$Html$Attributes$class('view'),
						function () {
							if (rd.$ === 'Floating') {
								var dy = rd.a;
								var slotOff = rd.b;
								return _List_fromArray(
									[
										A2(
										$elm$html$Html$Attributes$style,
										'transform',
										'translateY(' + ($elm$core$String$fromFloat(dy - slotOff) + 'px) scale(1.04)'))
									]);
							} else {
								return _List_Nil;
							}
						}()),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('drag-handle'),
									A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true'),
									$author$project$Main$onHandleDown(todo.id)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('\u22EE\u22EE')
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('toggle'),
									$elm$html$Html$Attributes$id(
									'check-' + $elm$core$String$fromInt(todo.id)),
									$elm$html$Html$Attributes$type_('checkbox'),
									$elm$html$Html$Attributes$checked(todo.completed),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Completed'),
									$elm$html$Html$Events$onClick(
									A2($author$project$Main$Check, todo.id, !todo.completed))
								]),
							_List_Nil),
							A2(
							$elm$html$Html$label,
							_List_fromArray(
								[
									$elm$html$Html$Events$onDoubleClick(
									A2($author$project$Main$EditingEntry, todo.id, true)),
									$author$project$Main$onPressStart(todo.id),
									$author$project$Main$onPressMove,
									$author$project$Main$onPressEnd(todo.id),
									$author$project$Main$onPressCancel
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(todo.description)
								])),
							function () {
							if (showMark) {
								var mc = A2(
									$elm$core$Maybe$andThen,
									$author$project$Main$findCategory(cats),
									todo.category);
								return A5($author$project$Main$viewRowCategoryMenu, cats, menu, ringless, todo, mc);
							} else {
								return $elm$html$Html$text('');
							}
						}(),
							todo.completed ? A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('archive-item'),
									$elm$html$Html$Attributes$type_('button'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Archive'),
									$elm$html$Html$Attributes$title('Archive'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$ArchiveItem(todo.id))
								]),
							_List_Nil) : $elm$html$Html$text(''),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('destroy'),
									$elm$html$Html$Attributes$type_('button'),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$Delete(todo.id))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$textarea,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('edit'),
							$elm$html$Html$Attributes$rows(1),
							$elm$html$Html$Attributes$value(todo.description),
							$elm$html$Html$Attributes$name('title'),
							$elm$html$Html$Attributes$id(
							'todo-' + $elm$core$String$fromInt(todo.id)),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Edit todo'),
							$elm$html$Html$Events$onInput(
							$author$project$Main$UpdateEntry(todo.id)),
							$elm$html$Html$Events$onBlur(
							A2($author$project$Main$EditingEntry, todo.id, false)),
							$author$project$Main$onEditKeydown(todo.id)
						]),
					_List_Nil),
					confirming ? A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('confirm-delete'),
							A2($elm$html$Html$Attributes$attribute, 'role', 'group'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete this todo?')
						]),
					_List_fromArray(
						[
							todo.completed ? A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-alt'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$ArchiveItem(todo.id))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Archive')
								])) : $elm$html$Html$text(''),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-yes'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$Delete(todo.id))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Delete')
								])),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('confirm-no'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick($author$project$Main$DismissConfirm)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Cancel')
								]))
						])) : $elm$html$Html$text('')
				]));
	});
var $author$project$Main$viewKeyedEntry = F7(
	function (cats, showMark, confirming, rd, menu, ringless, todo) {
		return _Utils_Tuple2(
			$elm$core$String$fromInt(todo.id),
			A8($elm$html$Html$Lazy$lazy7, $author$project$Main$viewEntry, cats, showMark, confirming, rd, menu, ringless, todo));
	});
var $author$project$Main$viewRows = F2(
	function (model, visible) {
		var row = function (t) {
			return A7(
				$author$project$Main$viewKeyedEntry,
				model.categories,
				_Utils_eq(model.categoryFilter, $author$project$Main$AnyCategory) && (!$elm$core$List$isEmpty(model.categories)),
				_Utils_eq(
					model.confirmingDelete,
					$elm$core$Maybe$Just(t.id)),
				A2($author$project$Main$rowDrag, model.drag, t.id),
				_Utils_eq(
					model.menuOpen,
					$elm$core$Maybe$Just(
						$author$project$Main$RowMenu(t.id))) ? $elm$core$Maybe$Just(model.menuDown) : $elm$core$Maybe$Nothing,
				_Utils_eq(
					model.noRing,
					$elm$core$Maybe$Just(
						$author$project$Main$RowMenu(t.id))),
				t);
		};
		return A2($elm$core$List$map, row, visible);
	});
var $author$project$Main$viewMain = function (model) {
	var visible = $author$project$Main$visibleList(model);
	var live = A2($elm$core$List$filter, $author$project$Main$isLive, model.entries);
	var cssVisibility = function (empty) {
		return empty ? 'hidden' : 'visible';
	};
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('main'),
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'row-menu-open',
						$author$project$Main$isRowMenu(model.menuOpen))
					])),
				A2(
				$elm$html$Html$Attributes$style,
				'visibility',
				cssVisibility(
					$elm$core$List$isEmpty(live))),
				A2(
				$elm$html$Html$Attributes$style,
				'display',
				$elm$core$List$isEmpty(live) ? 'none' : 'block')
			]),
		_List_fromArray(
			[
				($elm$core$List$isEmpty(visible) && (!$elm$core$List$isEmpty(live))) ? A4(
				$author$project$Main$viewEmptyFiltered,
				model.visibility,
				model.categories,
				model.categoryFilter,
				$elm$core$List$length(live)) : A2(
				$elm$html$Html$Keyed$ul,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('todo-list', true),
								_Utils_Tuple2(
								'drag-armed',
								!_Utils_eq(model.drag, $elm$core$Maybe$Nothing)),
								_Utils_Tuple2(
								'drag-active',
								_Utils_eq(
									A2(
										$elm$core$Maybe$map,
										function ($) {
											return $.active;
										},
										model.drag),
									$elm$core$Maybe$Just(true)))
							]))
					]),
				A2($author$project$Main$viewRows, model, visible)),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('drag-live'),
						A2($elm$html$Html$Attributes$attribute, 'role', 'status'),
						A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(model.announce)
					]))
			]));
};
var $author$project$Main$AddCategory = {$: 'AddCategory'};
var $author$project$Main$UpdateNewCatName = function (a) {
	return {$: 'UpdateNewCatName', a: a};
};
var $elm$html$Html$Attributes$autocomplete = function (bool) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var $elm$html$Html$Attributes$maxlength = function (n) {
	return A2(
		_VirtualDom_attribute,
		'maxlength',
		$elm$core$String$fromInt(n));
};
var $author$project$Main$onKeyPrevent = function (table) {
	var pick = function (key) {
		var _v0 = $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (_v1) {
					var k = _v1.a;
					return _Utils_eq(k, key);
				},
				table));
		if (_v0.$ === 'Just') {
			var _v2 = _v0.a;
			var msg = _v2.b;
			return $elm$json$Json$Decode$succeed(
				_Utils_Tuple2(msg, key !== 'Tab'));
		} else {
			return $elm$json$Json$Decode$fail('ignored key');
		}
	};
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			pick,
			A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string)));
};
var $author$project$Main$AskDeleteCategory = function (a) {
	return {$: 'AskDeleteCategory', a: a};
};
var $author$project$Main$BlurCategory = function (a) {
	return {$: 'BlurCategory', a: a};
};
var $author$project$Main$CancelEditCategory = function (a) {
	return {$: 'CancelEditCategory', a: a};
};
var $author$project$Main$CommitCategory = function (a) {
	return {$: 'CommitCategory', a: a};
};
var $author$project$Main$DeleteCategory = function (a) {
	return {$: 'DeleteCategory', a: a};
};
var $author$project$Main$EditCategoryName = function (a) {
	return {$: 'EditCategoryName', a: a};
};
var $author$project$Main$MoveCategory = F2(
	function (a, b) {
		return {$: 'MoveCategory', a: a, b: b};
	});
var $author$project$Main$SetCategoryColor = F2(
	function (a, b) {
		return {$: 'SetCategoryColor', a: a, b: b};
	});
var $author$project$Main$StartEditCategory = function (a) {
	return {$: 'StartEditCategory', a: a};
};
var $author$project$Main$deleteCategoryText = function (used) {
	return (!used) ? 'Delete category? No todos use it.' : ((used === 1) ? 'Delete category? Its 1 todo keeps its text and loses the category.' : ('Delete category? Its ' + ($elm$core$String$fromInt(used) + ' todos keep their text and lose the category.')));
};
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $author$project$Main$paletteNames = _List_fromArray(
	['Blue', 'Orange', 'Green', 'Pink', 'Purple', 'Teal', 'Ochre', 'Brown']);
var $author$project$Main$viewCategoryRow = F4(
	function (model, n, i, c) {
		var used = $elm$core$List$length(
			A2(
				$elm$core$List$filter,
				function (e) {
					return _Utils_eq(
						e.category,
						$elm$core$Maybe$Just(c.id));
				},
				model.entries));
		var sid = $elm$core$String$fromInt(c.id);
		var tools = _List_fromArray(
			[
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('cat-up-' + sid),
						$elm$html$Html$Attributes$class('cat-icon cat-tool'),
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$disabled(!i),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Move ' + (c.name + ' up')),
						$elm$html$Html$Events$onClick(
						A2($author$project$Main$MoveCategory, c.id, -1))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('\u2191')
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('cat-down-' + sid),
						$elm$html$Html$Attributes$class('cat-icon cat-tool'),
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$disabled(
						_Utils_eq(i, n - 1)),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Move ' + (c.name + ' down')),
						$elm$html$Html$Events$onClick(
						A2($author$project$Main$MoveCategory, c.id, 1))
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('\u2193')
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$id('cat-del-' + sid),
						$elm$html$Html$Attributes$class('cat-icon cat-tool cat-delete'),
						$elm$html$Html$Attributes$type_('button'),
						A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete ' + c.name),
						A2(
						$elm$html$Html$Events$stopPropagationOn,
						'click',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2(
								$author$project$Main$AskDeleteCategory(c.id),
								true)))
					]),
				_List_fromArray(
					[
						$author$project$Main$icon('x')
					]))
			]);
		var inputId = 'cat-name-' + sid;
		var ownsId = function (elId) {
			return _Utils_eq(elId, inputId) || A2($elm$core$String$startsWith, inputId + '-sw-', elId);
		};
		var stillInside = A2(
			$elm$json$Json$Decode$andThen,
			function (rel) {
				if (rel.$ === 'Just') {
					var relId = rel.a;
					return ownsId(relId) ? $elm$json$Json$Decode$fail('still editing') : $elm$json$Json$Decode$succeed(
						$author$project$Main$BlurCategory(c.id));
				} else {
					return $elm$json$Json$Decode$succeed(
						$author$project$Main$BlurCategory(c.id));
				}
			},
			A2(
				$elm$json$Json$Decode$andThen,
				function (tid) {
					return ownsId(tid) ? A2(
						$elm$json$Json$Decode$at,
						_List_fromArray(
							['relatedTarget']),
						$elm$json$Json$Decode$nullable(
							A2($elm$json$Json$Decode$field, 'id', $elm$json$Json$Decode$string))) : $elm$json$Json$Decode$fail('not ours');
				},
				A2(
					$elm$json$Json$Decode$at,
					_List_fromArray(
						['target', 'id']),
					$elm$json$Json$Decode$string)));
		var swatch = F2(
			function (idx, colorName) {
				return A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Attributes$id(
							inputId + ('-sw-' + $elm$core$String$fromInt(idx))),
							$elm$html$Html$Attributes$classList(
							_List_fromArray(
								[
									_Utils_Tuple2('swatch', true),
									_Utils_Tuple2(
									'selected',
									_Utils_eq(c.color, idx))
								])),
							A2($elm$html$Html$Attributes$attribute, 'role', 'radio'),
							A2(
							$elm$html$Html$Attributes$attribute,
							'aria-checked',
							_Utils_eq(c.color, idx) ? 'true' : 'false'),
							A2($elm$html$Html$Attributes$attribute, 'aria-label', colorName),
							$elm$html$Html$Attributes$title(colorName),
							$elm$html$Html$Events$onClick(
							A2($author$project$Main$SetCategoryColor, c.id, idx)),
							A2(
							$elm$html$Html$Events$preventDefaultOn,
							'mousedown',
							$elm$json$Json$Decode$succeed(
								_Utils_Tuple2($author$project$Main$NoOp, true))),
							$author$project$Main$onKeyPrevent(
							_List_fromArray(
								[
									_Utils_Tuple2(
									'Escape',
									$author$project$Main$CancelEditCategory(c.id))
								]))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'swatch-dot cat-' + $elm$core$String$fromInt(idx))
								]),
							_List_Nil)
						]));
			});
		var draft = function () {
			var _v1 = model.editingCat;
			if (_v1.$ === 'Just') {
				var _v2 = _v1.a;
				var eid = _v2.a;
				var raw = _v2.b;
				return _Utils_eq(eid, c.id) ? $elm$core$Maybe$Just(raw) : $elm$core$Maybe$Nothing;
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}();
		var problem = A2(
			$elm$core$Maybe$andThen,
			A2(
				$author$project$Main$nameProblem,
				model.categories,
				$elm$core$Maybe$Just(c.id)),
			draft);
		if (_Utils_eq(
			model.confirmingCategory,
			$elm$core$Maybe$Just(c.id))) {
			return A2(
				$elm$html$Html$li,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('cat-row confirming')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('confirm-delete cat-confirm'),
								A2($elm$html$Html$Attributes$attribute, 'role', 'group'),
								A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Delete category?')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-confirm-text')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text(
										$author$project$Main$deleteCategoryText(used))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-confirm-actions')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('confirm-yes'),
												$elm$html$Html$Attributes$id('cat-confirm'),
												$elm$html$Html$Attributes$type_('button'),
												$elm$html$Html$Events$onClick(
												$author$project$Main$DeleteCategory(c.id))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Delete')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('confirm-no'),
												$elm$html$Html$Attributes$id('cat-cancel'),
												$elm$html$Html$Attributes$type_('button'),
												$elm$html$Html$Events$onClick($author$project$Main$DismissConfirm)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel')
											]))
									]))
							]))
					]));
		} else {
			if (draft.$ === 'Nothing') {
				return A3(
					$elm$html$Html$Keyed$node,
					'li',
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cat-row')
						]),
					_List_fromArray(
						[
							_Utils_Tuple2(
							'line',
							A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-line')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('cat-preview')
											]),
										_List_fromArray(
											[
												$author$project$Main$viewMark(
												$elm$core$Maybe$Just(c))
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$id('cat-label-' + sid),
												$elm$html$Html$Attributes$class(
												'cat-label ' + $author$project$Main$catText(c)),
												$elm$html$Html$Attributes$type_('button'),
												A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Edit ' + c.name),
												$elm$html$Html$Events$onClick(
												$author$project$Main$StartEditCategory(c.id))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(c.name)
											]))
									]))),
							_Utils_Tuple2(
							'tools',
							A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-tools')
									]),
								tools))
						]));
			} else {
				var raw = draft.a;
				return A3(
					$elm$html$Html$Keyed$node,
					'li',
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cat-row editing'),
							A2($elm$html$Html$Events$on, 'focusout', stillInside)
						]),
					_List_fromArray(
						[
							_Utils_Tuple2(
							'line',
							A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-line')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('cat-preview')
											]),
										_List_fromArray(
											[
												$author$project$Main$viewMark(
												$elm$core$Maybe$Just(c))
											])),
										A2(
										$elm$html$Html$input,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$id(inputId),
												$elm$html$Html$Attributes$class('cat-name'),
												$elm$html$Html$Attributes$type_('text'),
												$elm$html$Html$Attributes$value(raw),
												$elm$html$Html$Attributes$maxlength(40),
												$elm$html$Html$Attributes$autocomplete(false),
												A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Category name'),
												A2($elm$html$Html$Attributes$attribute, 'aria-describedby', 'cat-error-' + sid),
												A2(
												$elm$html$Html$Attributes$attribute,
												'aria-invalid',
												_Utils_eq(problem, $elm$core$Maybe$Nothing) ? 'false' : 'true'),
												$elm$html$Html$Events$onInput($author$project$Main$EditCategoryName),
												$author$project$Main$onKeyPrevent(
												_List_fromArray(
													[
														_Utils_Tuple2(
														'Enter',
														$author$project$Main$CommitCategory(c.id)),
														_Utils_Tuple2(
														'Escape',
														$author$project$Main$CancelEditCategory(c.id))
													]))
											]),
										_List_Nil)
									]))),
							_Utils_Tuple2(
							'edit',
							A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-edit')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$div,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('cat-swatches'),
												A2($elm$html$Html$Attributes$attribute, 'role', 'radiogroup'),
												A2($elm$html$Html$Attributes$attribute, 'aria-label', 'Colour of ' + c.name)
											]),
										A2($elm$core$List$indexedMap, swatch, $author$project$Main$paletteNames)),
										A2(
										$elm$html$Html$p,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('cat-error'),
												$elm$html$Html$Attributes$id('cat-error-' + sid),
												A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												A2($elm$core$Maybe$withDefault, '', problem))
											]))
									]))),
							_Utils_Tuple2(
							'tools',
							A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('cat-tools')
									]),
								tools))
						]));
			}
		}
	});
var $author$project$Main$viewManage = function (model) {
	var n = $elm$core$List$length(model.categories);
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('archive-bar')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$a,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-back'),
							$elm$html$Html$Attributes$href(model.returnTo)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('\u2190 Back')
						])),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-count')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$fromInt(n) + (' of ' + $elm$core$String$fromInt($author$project$Main$maxCategories)))
						]))
				])),
			A2(
			$elm$html$Html$section,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('todoapp archive-card manage-card')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h2,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('archive-month')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Categories')
						])),
					A2(
					$elm$html$Html$Keyed$ul,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cat-list')
						]),
					A2(
						$elm$core$List$indexedMap,
						F2(
							function (i, c) {
								return _Utils_Tuple2(
									$elm$core$String$fromInt(c.id),
									A4($author$project$Main$viewCategoryRow, model, n, i, c));
							}),
						model.categories)),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cat-add')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('cat-preview')
								]),
							_List_fromArray(
								[
									$author$project$Main$icon('plus')
								])),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$id('cat-new'),
									$elm$html$Html$Attributes$class('cat-name'),
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$placeholder('Add category'),
									$elm$html$Html$Attributes$value(model.newCatName),
									$elm$html$Html$Attributes$maxlength(40),
									$elm$html$Html$Attributes$autocomplete(false),
									A2($elm$html$Html$Attributes$attribute, 'aria-label', 'New category name'),
									A2($elm$html$Html$Attributes$attribute, 'aria-describedby', 'cat-new-error'),
									A2(
									$elm$html$Html$Attributes$attribute,
									'aria-invalid',
									_Utils_eq(model.addError, $elm$core$Maybe$Nothing) ? 'false' : 'true'),
									$elm$html$Html$Events$onInput($author$project$Main$UpdateNewCatName),
									$author$project$Main$onKeyPrevent(
									_List_fromArray(
										[
											_Utils_Tuple2('Enter', $author$project$Main$AddCategory)
										]))
								]),
							_List_Nil),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('cat-add-btn'),
									$elm$html$Html$Attributes$type_('button'),
									$elm$html$Html$Events$onClick($author$project$Main$AddCategory)
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Add')
								]))
						])),
					A2(
					$elm$html$Html$p,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('cat-error'),
							$elm$html$Html$Attributes$id('cat-new-error'),
							A2($elm$html$Html$Attributes$attribute, 'aria-live', 'polite')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							A2($elm$core$Maybe$withDefault, '', model.addError))
						]))
				]))
		]);
};
var $author$project$Main$view = function (model) {
	return {
		body: _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('todomvc-wrapper', true),
								_Utils_Tuple2(
								'is-empty',
								$elm$core$List$isEmpty(model.entries) && (!$author$project$Main$isSubPage(model.visibility)))
							]))
					]),
				_List_fromArray(
					[
						function () {
						var _v0 = model.visibility;
						switch (_v0.$) {
							case 'ArchiveView':
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('archive-page')
										]),
									$author$project$Main$viewArchive(model));
							case 'ManageView':
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('archive-page manage-page')
										]),
									$author$project$Main$viewManage(model));
							default:
								return A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('app-stack')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$section,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('todoapp')
												]),
											_List_fromArray(
												[
													A4($elm$html$Html$Lazy$lazy3, $author$project$Main$viewInput, model.field, model.categories, model.newCategory),
													$author$project$Main$viewMain(model)
												])),
											A2($elm$core$List$any, $author$project$Main$isLive, model.entries) ? $author$project$Main$viewControls(model) : $elm$html$Html$text('')
										]));
						}
					}()
					]))
			]),
		title: 'Elm • TodoMVC'
	};
};
var $author$project$Main$main = $elm$browser$Browser$application(
	{init: $author$project$Main$init, onUrlChange: $author$project$Main$UrlChanged, onUrlRequest: $author$project$Main$UrlRequested, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$updateWithStorage, view: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main($elm$json$Json$Decode$value)(0)}});}(this));