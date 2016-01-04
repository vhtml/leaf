(function(win, doc, undefined) {

	var idReg = /^#[\w-]+$/; //匹配单个ID
	var emptyArray = [];
	var slice = emptyArray.slice;
	var concat = emptyArray.concat;
	var push = emptyArray.push;
	var indexOf = emptyArray.indexOf;
	var emptyObject = {};
	var toString = emptyObject.toString;
	var hasOwn = emptyObject.hasOwnProperty;

	function $(selector) {
		//匹配单个id，使用getElementById，据说性能好
		if (idReg.test(selector)) {
			return doc.getElementById(selector);
		} else {
			return doc.querySelector(selector);
		}
	}

	$.extend = function() {
		var options, src, copy,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length;

		//只有一个参数，就是对自身的扩展处理
		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			//从i开始取参数,不为空开始遍历
			if ((options = arguments[i]) != null) {
				for (name in options) {
					copy = options[name];
					//覆盖拷贝
					target[name] = copy;
				}
			}
		}

		return target;
	};

	$.extend({
		//事件绑定
		addEvent: function(dom, type, fn) {
			dom.addEventListener(type, fn, false);
		},
		//接触事件绑定
		removeEvent: function(dom, type, fn) {
			dom.removeEventListener(type, fn, false);
		},
		trigger: function(eventName, data) {
			var event = document.createEvent('HTMLEvents');
			event.initEvent(eventName, true, true);
			event.eventType = data;
			document.dispatchEvent(event);
		},
		//获取对象的类型信息
		classOf: function(o) {
			if (o === null) return "Null";
			if (o === undefined) return "Undefined";
			return Object.prototype.toString.call(o).slice(8, -1);
		},
		isFunction:function(obj){
			return $.classOf(obj) === 'Function';
		},
		//设置、获取cookie
		cookie: function(key, value, options) {
			if (value !== undefined && !$.isFunction(value)) {

				if (typeof options.expires === 'number') {
					var days = options.expires,
						t = options.expires = new Date();
					t.setDate(t.getDate() + days);
				}

				return (document.cookie = [
					encodeURIComponent(key), '=', encodeURIComponent(value),
					options.expires ? '; expires=' + options.expires.toUTCString() : '', 
					options.path ? '; path=' + options.path : '',
					options.domain ? '; domain=' + options.domain : '',
					options.secure ? '; secure' : ''
				].join(''));
			}

			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var result;

			for (var i = 0, l = cookies.length; i < l; i++) {
				var parts = cookies[i].split('=');
				var name = decodeURIComponent(parts.shift());
				var cookie = parts.join('=');

				if (key && key === name) {
					result = read(cookie, value);
					break;
				}
			}

			return result;
		}

	});

	window.leaf = window.$ = $;

})(window, document);