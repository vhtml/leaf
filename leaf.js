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
			return doc.getElementById(selector.replace(/^#/, ''));
		} else {
			return doc.querySelectorAll(selector);
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
				for (var name in options) {
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
		isFunction: function(obj) {
			return $.classOf(obj) === 'Function';
		},
		//设置、获取cookie
		cookie: function(key, value, options) {
			if (value !== undefined && !$.isFunction(value)) {
				options = $.extend({}, options);
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
				var name = decodeURIComponent(parts[0]);
				var cookie = parts.join('=');

				if (key && key === name) {
					result = decodeURIComponent(parts[1] || '');
					break;
				}
			}
			return result;
		},
		removeCookie: function(key, options) {
			if ($.cookie(key) !== undefined) {
				$.cookie(key, '', $.extend({}, options, {
					expires: -1
				}));
				return true;
			}
			return false;
		},
		serialize: function(json) {
			var result = '';
			for (var name in json) {
				result += encodeURIComponent(name) + '=' + encodeURIComponent((json[name])) + '&';
			}
			return result.replace(/&$/, '');
		},
		ajax: function(options) {
			var xmlhttp = new XMLHttpRequest();
			options = $.extend({
				url: '',
				data: {},
				dataType: 'json',
				async: true,
				type: 'GET',
				success: function() {},
				error: function() {}
			}, options);
			options.data = $.serialize(options.data);
			var url = options.url;
			var query = url.match(/\?[^#]+/);
			if (options.type == 'GET') {
				url = url + (query ? '&' : '?') + options.data;
			}
			if (options.async) {
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == 4) {
						if (xmlhttp.status == 200) {
							doSucc(xmlhttp);
						} else {
							$.isFunction(options.error) && options.error();
						}
					}
				};
			}
			xmlhttp.open(options.type, url, options.async);
			if (options.type == 'POST') {
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			xmlhttp.send(options.type == 'POST' ? options.data : null);
			if (!options.async) {
				return doSucc(xmlhttp);
			}

			function doSucc() {
				var data = xmlhttp.responseText;
				if (options.dataType == 'json') {
					data = JSON.parse(data);
				}
				$.isFunction(options.success) && options.success(data);
				return data;
			}
		},
		//返回元素e的第n层祖先元素
		parent: function(e, n) {
			if (n === undefined) {
				n = 1;
			}
			while (n-- && e) {
				e = e.parentNode;
			}
			if (!e || e.nodeType !== 1) {
				return null;
			}
			return e;
		},
		//返回元素e的第n个兄弟元素
		sibling: function(e, n) {
			while (e && n !== 0) {
				if (n > 0) { //查找后续的兄弟元素
					if (e.nextElementSibling) {
						e = e.nextElementSibling;
					} else {
						for (e = e.nextSibling; e && e.nodeType !== 1; e = e.nextSibling); //空循环
					}
					n--;
				} else {
					if (e.previousElementSibling) {
						e = e.previousElementSibling;
					} else {
						for (e = e.previousSibling; e && e.nodeType !== 1; e = e.previousSibling);
					}
					n++;
				}
			}
			return e;
		},
		after: function(e, html) {
			e.insertAdjacentHTML('afterEnd',html);
		},
		before: function(e, html) {
			e.insertAdjacentHTML('beforeBegin',html);
		},
		//滚动条回到顶部、左边
		goTop: function(acceleration, time) {
			acceleration = acceleration || 0.1;
			time = time || 16;
			var dx = 0,
				dy = 0,
				bx = 0,
				by = 0,
				wx = 0,
				wy = 0;
			if (document.documentElement) {
				dx = document.documentElement.scrollLeft || 0;
				dy = document.documentElement.scrollTop || 0;
			}
			if (document.body) {
				bx = document.body.scrollLeft || 0;
				by = document.body.scrollTop || 0;
			}
			var wx = window.scrollX || 0,
				wy = window.scrollY || 0;
			var x = Math.max(wx, Math.max(bx, dx)),
				y = Math.max(wy, Math.max(by, dy));

			var speed = 1 + acceleration;
			window.scrollTo(Math.floor(x / speed), Math.floor(y / speed));
			if (x > 0 || y > 0) {
				var invokeFunction = arguments.callee.call(acceleration, time);
				window.setTimeout(invokeFunction, time);
			}
		},
		//获取元素的文档坐标,e.getBoundingClientRect()返回的是视口坐标
		getElementPostion: function(e) {
			var x = y = 0;
			while (e != null) {
				x += e.offsetLeft;
				y += e.offsetTop;
				e = e.offsetParent;
			}
			return {
				x: x,
				y: y
			};
		},
		//异步加载js
		loadScript: function(url, callback) {
			var script = document.createElement("script");
			script.onload = function() {
				callback();
			};
			script.src = url;
			document.head.appendChild(script);
		},
		//判断是否支持触摸事件
		isTouchDevice: function() {
			var isTouchDevice = true;
			try {
				document.createEvent("TouchEvent");
			} catch (e) {
				isTouchDevice = false;
			}
			return isTouchDevice;
		},
		alert: (function(doc) {
			var cssOverlay = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:20150824;background-color:rgba(0,0,0,0.2);',
				cssCon = 'position: absolute;padding:5px;background-color: rgba(123,123,123,0.3);top:50%;left: 50%;border-radius: 5px;-webkit-transition:opacity 0.2s linear;transition:opacity 0.2s linear',
				cssP = 'padding:5px 10px;line-height: 20px;max-width: 250px;color:#fff;font-size:14px;font-family: "Microsoft YaHei";background-color: #ED9A19;border-radius: 2px';


			var lc = {
				tips: function(text, timer, cb) {
					clearTimeout(this.t);
					this.oPrev && doc.body.removeChild(this.oPrev);
					this.generateHTML(text);
					this.show();
					var duration = typeof timer === 'number' ? timer : 1000;
					this.cb = typeof cb === 'function' ? cb : typeof timer === 'function' ? timer : null;
					this.hide(duration);
				},
				generateHTML: function(text) {
					this.oP = document.createElement("p");
					this.oCon = document.createElement("div");
					this.oTip = document.createElement("div");
					this.setCss(this.oP, cssP);
					this.setCss(this.oCon, cssCon);
					this.setCss(this.oTip, cssOverlay);
					this.oP.innerHTML = text;
					this.oCon.appendChild(this.oP);
					this.oTip.appendChild(this.oCon);
				},
				show: function() {
					doc.body.appendChild(this.oTip);
					var h = this.oCon.offsetHeight;
					var w = this.oCon.offsetWidth;
					this.oCon.style.marginLeft = -w / 2 + "px";
					this.oCon.style.marginTop = -h / 2 + "px";
					this.oCon.style.left = '50%';
					this.oCon.style.top = '50%';
					this.oPrev = this.oTip;
				},
				hide: function(timer) {
					var _this = this;
					this.t = setTimeout(function() {
						_this.oCon.style.opacity = '0';
						setTimeout(function() {
							doc.body.removeChild(_this.oTip);
							_this.oPrev = null;
							_this.cb && _this.cb();
						}, 200);
					}, timer);
				},
				setCss: function(o, csstext) {
					o.style.cssText = csstext;
				}
			};
			return function(text) {
				lc.tips.call(lc, text, cb);
			};
		})(doc)
	});

	window.leaf = window.$ = $;

})(window, document);