/*
    QuoJS 2.3.0
    http://quojs.tapquo.com
*/

var Quo;

Quo = Quo || (function() {
    var $, EMPTY_ARRAY, Q, IQ, $CACHES = {};
    EMPTY_ARRAY = [];
    Q = function(dom, selector) {
        dom = dom || EMPTY_ARRAY;
        dom.__proto__ = IQ.prototype;
        dom.selector = selector || '';
        return dom;
    };
    IQ = function(dom, selector) {
        dom = dom || EMPTY_ARRAY;
        this.selector = selector || '';
        this.length = dom.length;
        for(var i in dom)this[i] = dom[i];
    };
    getQ = function(dom, selector) {
        if(EMPTY_ARRAY.__proto__){
            return Q(dom, selector);
        }else{
            return new IQ(dom, selector);
        }
    }
    $ = function(selector, children) {
        var dom, o, isSelectorFlag,type;
        if($.isArray(selector) && selector.selector && !children){
            return selector;
        }
        if (!selector) {
            return getQ();
        } else {
            type = $.toType(selector);
            isSelectorFlag = type === "string" && !/^\s*<(\w+|!)[^>]*>/.test(selector);
            if(isSelectorFlag) {
                if (children) {
                    selector += ' ' + children;
                }
                if($CACHES[selector]==null || $CACHES[selector].length<1){
                    dom = $.getDOMObject(selector);
                    $CACHES[selector] = getQ(dom, selector);
                }
                return $CACHES[selector];
            }else{
                dom = $.getDOMObject(selector, children);
                if (children && type === "object") {
                    selector.selector = children;
                }
                return getQ(dom, selector);
            }
        }
    };
    $.extend = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !$.isFunction(target) ) {
            target = {};
        }

        // extend $ itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( $.isPlainObject(copy) || (copyIsArray = $.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];

                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = $.extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };
    $.destroyAll = function(){
        $CACHES = null;
    };

    IQ.prototype = $.fn = {};
    $.fn.destroy = function(){
        if(this.selector!=''){
            delete $CACHES[this.selector];
        }
    };
    return $;
})();

$ = Quo;

(function($) {
    var EMPTY_ARRAY, HTML_CONTAINERS, IS_HTML_FRAGMENT, OBJECT_PROTOTYPE, TABLE, TABLE_ROW, _compact, _flatten;
    EMPTY_ARRAY = [];
    OBJECT_PROTOTYPE = Object.prototype;
    IS_HTML_FRAGMENT = /^\s*<(\w+|!)[^>]*>/;
    TABLE = document.createElement('table');
    TABLE_ROW = document.createElement('tr');
    HTML_CONTAINERS = {
        "tr": document.createElement("tbody"),
        "tbody": TABLE,
        "thead": TABLE,
        "tfoot": TABLE,
        "td": TABLE_ROW,
        "th": TABLE_ROW,
        "*": document.createElement("div")
    };
    $.now = function() {
        return (new Date()).getTime()
    };
    $.toType = function(obj) {
        return OBJECT_PROTOTYPE.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };
    $.isString = function(val) {
        return $.toType(val) === "string";
    };
    $.isArray = function(val) {
        return Array.isArray(val);// || OBJECT_PROTOTYPE.toString.call(val) === '[object Array]'
    };
    $.isObject = function(val) {
        return val === Object(val);
    };

    $.isPlainObject = function( obj ) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if ( $.toType( obj ) !== "object" || obj.nodeType || $.isWindow( obj ) ) {
            return false;
        }

        // Support: Firefox <20
        // The try/catch suppresses exceptions thrown when attempting to access
        // the "constructor" property of certain host objects, ie. |window.location|
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        try {
            if ( obj.constructor &&
                !{}.hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
                return false;
            }
        } catch ( e ) {
            return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    };

    $.isFunction = function(val) {
        return OBJECT_PROTOTYPE.toString.call(val) === '[object Function]';
    };
    $.isNumeric = function(val) {
        return typeof(val) === 'number';
    };
    $.isWindow = function( obj ) {
        return obj != null && obj === obj.window;
    };
    $.grep = function(obj, fn){
        if(!$.isFunction(fn) || !($.isObject(obj) || $.isArray(obj)))return obj;
        var i;
        for(i in obj){
            if(!fn(obj[i])){
                delete obj[i];
            }
        }
        return obj;
    }
    $.merge = function(first, second){
        var l = second.length,
            i = first.length,
            j = 0;

        if ( typeof l === "number" ) {
            for ( ; j < l; j++ ) {
                first[ i++ ] = second[ j ];
            }
        } else {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    }
    $.isOwnProperty = function(object, property) {
        return OBJECT_PROTOTYPE.hasOwnProperty.call(object, property);
    };
    $.getDOMObject = function(selector, children) {
        var domain, elementTypes, type;
        domain = null;
        elementTypes = [1, 9, 11];
        type = $.toType(selector);
        if (type === "array") {
            domain = _compact(selector);
        } else if (type === "string" && IS_HTML_FRAGMENT.test(selector)) {
            domain = $.fragment(selector.trim(), RegExp.$1);
            selector = null;
        } else if (type === "string") {
            domain = $.query(document, selector);
            if (children) {
                if (domain.length === 1) {
                    domain = $.query(domain[0], children);
                } else {
                    domain = $.map(domain,function(dom,i) {
                        return $.query(dom, children);
                    });
                }
            }
        } else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window) {
            if (children) {
                domain = $.query(selector, children);
            }else{
                domain = [selector];
            }
            selector = null;
        }
        return domain;
    };
    $.map = function(elements, callback) {
        var i, key, value, values;
        values = [];
        if ($.toType(elements) === "array") {
            i = 0;
            while (i < elements.length) {
                value = callback(elements[i], i);
                if (value != null) {
                    values.push(value);
                }
                i++;
            }
        } else {
            for (key in elements) {
                value = callback(elements[key], key);
                if (value != null) {
                    values.push(value);
                }
            }
        }
        return _flatten(values);
    };
    $.each = function(elements, callback) {
        var i, key;
        if ($.toType(elements) === "array") {
            i = 0;
            while (i < elements.length) {
                if (callback.call(elements[i], i, elements[i]) === false) {
                    return elements;
                }
                i++;
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[key], key, elements[key]) === false) {
                    return elements;
                }
            }
        }
        return elements;
    };
    $.parseParam = function(o) {
        var h, j, l, m, mk, n, p, _i, _len;
        o = o || window.location.search;
        j = {};
        n = o.substring(1);
        m = n.split("&");
        for (_i = 0, _len = m.length; _i < _len; _i++) {
            mk = m[_i];
            if (mk.indexOf("=") !== -1) {
                p = mk.split("=");
                h = p[0];
                l = decodeURIComponent(p[1]);
                if(l=='undefined' || l=='null')l='';
                j[h] = l;
            }
        }
        return j;
    },
        //合并多个对象，返回合并后得到的对象
        $.mix = function() {
            var arg, argument, child, len, prop;
            child = {};
            arg = 0;
            len = arguments.length;
            while (arg < len) {
                argument = arguments[arg];
                for (prop in argument) {
                    if ($.isOwnProperty(argument, prop) && argument[prop] !== undefined) {
                        child[prop] = argument[prop];
                    }
                }
                arg++;
            }
            return child;
        };
    $.fragment = function(markup, tag) {
        var container;
        if (tag == null) {
            tag = "*";
        }
        if (!(tag in HTML_CONTAINERS)) {
            tag = "*";
        }
        container = HTML_CONTAINERS[tag];
        container.innerHTML = "" + markup;
        return $.each(Array.prototype.slice.call(container.childNodes), function() {
            return container.removeChild(this);
        });
    };
    //得到窗口的宽高等信息
    $.getScroll = function () {
        var o = document.documentElement,
            k = document.body;
        var m, j, g, n;
        if (o && o.scrollTop) {
            m = o.scrollTop;
            j = o.scrollLeft;
            g = o.scrollWidth;
            n = o.scrollHeight
        } else {
            if (k) {
                m = k.scrollTop;
                j = k.scrollLeft;
                g = k.scrollWidth;
                n = k.scrollHeight
            }
        }
        return {
            t: m || window.pageYOffset,
            l: j || window.pageXOffset,
            w: g,
            h: n
        }
    };
    $.fn.map = function(fn) {
        return $.map(this, function(el, i) {
            if(isNaN(i))return null;
            return fn.call(el, el, i);
        });
    };
    //获取对象中的一组属性
    $.fn.instance = function(property) {
        return this.map(function() {
            return this[property];
        });
    };
    //过滤当前对象，参数SELECTOR有可能是函数也可能是一个选择符
    $.fn.filter = function(selector) {
        return $([].filter.call(this, function(element) {
            var res;
            if($.isString(selector))
                res = element.parentNode && $.query(element.parentNode, selector).indexOf(element) >= 0;
            else if($.isFunction(selector)){
                res = selector.call(element);
            }
            return res;
        }));
    };
    $.fn.forEach = EMPTY_ARRAY.forEach;
    $.fn.indexOf = EMPTY_ARRAY.indexOf;
    _compact = function(array) {
        return array.filter(function(item) {
            return item !== undefined && item !== null;
        });
    };
    _flatten = function(array) {
        if (array.length > 0) {
            return [].concat.apply([], array);
        } else {
            return array;
        }
    };
})(Quo);

(function($) {
    $.fn.attr = function(name, value) {
        if ($.toType(name) === "string" && value === undefined) {
            return this[0].getAttribute(name);
        } else {
            return this.each(function() {
                return this.setAttribute(name, value);
            });
        }
    };
    $.fn.removeAttr = function(name) {
        if ($.toType(name) === "string" && name!='') {
            return this.each(function() {
                return this.removeAttribute(name);
            });
        }
        return this;
    };
    $.fn.data = function(name, value) {
        return this.attr("data-" + name, value);
    };
    $.fn.val = function(value) {
        if ($.toType(value) === "string") {
            return this.each(function() {
                return this.value = value;
            });
        } else {
            if (this.length > 0) {
                return this[0].value;
            } else {
                return null;
            }
        }
    };
    $.fn.show = function() {
        return this.style("display", "block");
    };
    $.fn.hide = function() {
        return this.style("display", "none");
    };
    $.fn.toggle = function() {
        if(this.style("display")=='block'){
            this.style("display", "none");
        }else{
            this.style("display", "block");
        }
    };
    $.fn.height = function() {
        var offset;
        offset = this.offset();
        return offset.height;
    };
    $.fn.width = function() {
        var offset;
        offset = this.offset();
        return offset.width;
    };
    $.fn.offset = function() {
        var b = this[0];
        if(b == window){
            return {
                left:  window.pageXOffset,
                top: window.pageYOffset,
                width: document.documentElement.clientWidth || document.body.clientWidth,
                height: document.documentElement.clientHeight || document.body.clientHeight
            };
        }
        try{
            var bounding;
            bounding = this[0].getBoundingClientRect();
            return {
                left: bounding.left + window.pageXOffset,
                top: bounding.top + window.pageYOffset,
                width: bounding.width,
                height: bounding.height
            };
        }catch(e){
            if ((b.parentNode == null || b.offsetParent == null || b.style.display == "none") && b != document.body) {
                return {left:0, top:0, width:0, height:0}
            }
            var a = null;
            var j = [];
            var d, isSafari = /safari/.test($.environment().ua);
            var g = b.ownerDocument;
            j = [b.offsetLeft, b.offsetTop];
            a = b.offsetParent;
            var h = this.style("position") == "absolute";
            if (a != b) {
                while (a) {
                    j[0] += a.offsetLeft;
                    j[1] += a.offsetTop;
                    if (isSafari && !h && a.style.position == "absolute") {
                        h = true
                    }
                    a = a.offsetParent
                }
            }
            if (isSafari && h) {
                j[0] -= b.ownerDocument.body.offsetLeft;
                j[1] -= b.ownerDocument.body.offsetTop
            }
            a = b.parentNode;
            while (a.tagName && !/^body|html$/i.test(a.tagName)) {
                if (a.style.display.search(/^inline|table-row.*$/i)) {
                    j[0] -= a.scrollLeft;
                    j[1] -= a.scrollTop
                }
                a = a.parentNode
            }
            return {
                left: j[0],
                top: j[1],
                width: parseInt(b.offsetWidth),
                height: parseInt(b.offsetHeight)
            };
        }
    };
    $.fn.remove = function() {
        return this.each(function() {
            if (this.parentNode != null) {
                return this.parentNode.removeChild(this);
            }
        });
    };
})(Quo);

(function($) {
    var IS_WEBKIT, SUPPORTED_OS, _current, _detectBrowser, _detectEnvironment, _detectOS, _detectScreen;
    _current = null;
    IS_WEBKIT = /WebKit\/([\d.]+)/i;
    SUPPORTED_OS = {
        android: /(Android)\s+([\d.]+)/i,
        ipad: /(iPad).*OS\s([\d_]+)/i,
        iphone: /(iPhone\sOS)\s([\d_]+)/i,
        winphone: /(Windows Phone\sOS)\s([\d_]+)/i,
        blackberry: /(BlackBerry).*Version\/([\d.]+)/i,
        webos: /(webOS|hpwOS)[\s\/]([\d.]+)/i
    };
    $.isMobile = function() {
        _current = _current || _detectEnvironment();
        var pa = /iPod|iPad|iPhone|Android|winphone|iph|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/ig;
        return pa.test(_current.ua) || _current.isMobile;
    };
    $.environment = function() {
        _current = _current || _detectEnvironment();
        return _current;
    };
    $.isOnline = function() {
        return navigator.onLine;
    };
    $.prefixStyle = function(style){
        vendor = $.environment().vendor;
        if ( vendor === '' ) return style;

        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    },

        _detectEnvironment = function() {
            var environment, user_agent;
            user_agent = navigator.userAgent;
            environment = {};
            environment.ua = user_agent.toLowerCase();
            environment.browser = _detectBrowser(user_agent);
            environment.os = _detectOS(user_agent);
            environment.isMobile = !!environment.os;
            environment.screen = _detectScreen();
            environment.vendor = '';
            var t,
                i = 0,
                dummyStyle = document.createElement('div').style,
                vendors = 't,webkitT,MozT,msT,OT'.split(','),
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    environment.vendor = vendors[i].substr(0, vendors[i].length - 1);
                    break;
                }
            }

            return environment;
        };

    _detectBrowser = function(user_agent) {
        var is_webkit;
        is_webkit = user_agent.match(IS_WEBKIT);
        if (is_webkit) {
            return is_webkit[0];
        } else {
            return user_agent;
        }
    };
    _detectOS = function(user_agent) {
        var detected_os, os, supported;
        detected_os = null;
        for (os in SUPPORTED_OS) {
            supported = user_agent.match(SUPPORTED_OS[os]);
            if (supported) {
                detected_os = {
                    platName: os,
                    name: (os === "iphone" || os === "ipad" ? "ios" : os),
                    version: supported[2].replace("_", ".")
                };
                break;
            }
        }
        return detected_os;
    };
    _detectScreen = function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };
})(Quo);

(function($) {
    var _createElement;
    $.fn.text = function(value) {
        if (value || $.toType(value) === "number") {
            return this.each(function() {
                return this.textContent = value;
            });
        } else {
            return this[0].textContent;
        }
    };
    $.fn.html = function(value) {
        var type;
        type = $.toType(value);
        if (value || type === "number" || type === "null") {
            return this.each(function() {
                if (type === "string" || type === "number" || type === "null") {
                    return this.innerHTML = value;
                } else {
                    this.innerHTML = null;
                    return this.appendChild(value);
                }
            });
        } else {
            return this[0].innerHTML;
        }
    };
    $.fn.append = function(value) {
        return this.each(function() {
            if ($.toType(value) === "string") {
                if (value) {
                    //return this.innerHTML += value;
                    return this.appendChild(_createElement(value));
                }
            } else {
                return this.appendChild(value);
            }
        });
    };
    $.fn.appendTo = function(value) {
        return this.each(function() {
            if ($.toType(value) === "string") {
                if (value) {
                    $(value).append(this);
                }
            } else {
                if(value.selector!=undefined)
                    value.append(this);
                else
                    value.appendChild(this);
            }
        });
    };
    $.fn.prepend = function(value) {
        return this.each(function() {
            var parent;
            if ($.toType(value) === "string") {
                return this.innerHTML = value + this.innerHTML;
            } else {
                if(this.firstChild){
                    this.insertBefore(value, this.firstChild);
                }else{
                    this.appendChild(value);
                }
            }
        });
    };
    $.fn.insertBefore = function(value) {
        if ($.toType(value) === "string") {
            value = $(value).get(0);
        } else {
            if(value.selector!=undefined)
                value = value.get(0);
        }
        return this.each(function() {
            value.parentNode.insertBefore(this, value);
        });
    };
    $.fn.replaceWith = function(content) {
        return this.each(function() {
            var parent;
            if ($.toType(content) === "string") {
                content = _createElement(content);
            }
            parent = this.parentNode;
            if (parent) {
                parent.insertBefore(content, this);
            }
            return $(this).remove();
        });
    };
    $.fn.empty = function() {
        return this.each(function() {
            this.innerHTML = '';
        });
    };
    _createElement = function(content) {
        var div;
        div = document.createElement("div");
        div.innerHTML = content;
        var doc = document.createDocumentFragment();
        var childs = div.childNodes;
        while(n=childs.length){
            doc.appendChild(childs[0]);
        }
        return doc;
    };
})(Quo);

(function($) {
    var PARENT_NODE, _filtered, _findAncestors;
    PARENT_NODE = "parentNode";
    $.query = function(domain, selector) {
        var dom_elements;
        dom_elements = domain.querySelectorAll(selector);
        dom_elements = Array.prototype.slice.call(dom_elements);
        return dom_elements;
    };
    $.fn.find = function(selector) {
        var result;
        if (this.length === 1) {
            result = Quo.query(this[0], selector);
        } else {
            result = this.map(function() {
                return Quo.query(this, selector);
            });
        }
        return $(result);
    };
    $.fn.parent = function(selector) {
        var ancestors;
        ancestors = (selector ? _findAncestors(this) : this.instance(PARENT_NODE));
        return _filtered(ancestors, selector);
    };
    $.fn.siblings = function(selector) {
        var siblings_elements;
        siblings_elements = this.map(function(element,index) {
            return Array.prototype.slice.call(element.parentNode.children).filter(function(child) {
                return child !== element;
            });
        });
        return _filtered(siblings_elements, selector);
    };
    $.fn.children = function(selector) {
        var children_elements;
        children_elements = this.map(function() {
            return Array.prototype.slice.call(this.children);
        });
        return _filtered(children_elements, selector);
    };
    $.fn.get = function(index) {
        if (index === undefined) {
            return this;
        } else {
            return this[index];
        }
    };
    $.fn.first = function() {
        return $(this[0]);
    };
    $.fn.last = function() {
        return $(this[this.length - 1]);
    };
    //委托事件关键函数，selector委托选择标签，
    $.fn.closest = function(selector, context) {
        var candidates, node;
        node = this[0];
        candidates = $(selector);
        if (!candidates.length) {
            node = null;
        }
        while (node && candidates.indexOf(node) < 0) {
            node = node !== context && node !== document && node.parentNode;
        }
        return $(node);
    };
    $.fn.each = function(callback) {
        this.forEach(function(element, index) {
            if(isNaN(index))return null;
            return callback.call(element, index, element);
        });
        return this;
    };
    _findAncestors = function(nodes) {
        var ancestors;
        ancestors = [];
        while (nodes.length > 0) {
            nodes = $.map(nodes, function(node) {
                if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
                    ancestors.push(node);
                    return node;
                }
            });
        }
        return ancestors;
    };
    _filtered = function(nodes, selector) {
        if (selector === undefined) {
            return $(nodes);
        } else {
            return $(nodes).filter(selector);
        }
    };
})(Quo);

(function($) {
    var _computedStyle, _existsClass;
    $.fn.addClass = function(name) {
        return this.each(function() {
            if (!_existsClass(name, this)) {
                this.className += " " + name;
                return this.className = this.className.trim();
            }
        });
    };
    $.fn.removeClass = function(name) {
        return this.each(function() {
            if (!name) {
                return this.className = "";
            } else {
                if (_existsClass(name, this)) {
                    return this.className = this.className.replace(name, " ").replace(/\s+/g, " ").trim();
                }
            }
        });
    };
    $.fn.toggleClass = function(name) {
        return this.each(function() {
            if (_existsClass(name, this)) {
                return this.className = this.className.replace(name, " ").replace(/\s+/g, " ").trim();
            } else {
                this.className += " " + name;
                return this.className = this.className.trim();
            }
        });
    };
    $.fn.hasClass = function(name) {
        return _existsClass(name, this[0]);
    };
    $.fn.style = function(property, value) {
        if (value===undefined) {
            return this[0].style[property] || _computedStyle(this[0], property);
        } else {
            return this.each(function() {
                return this.style[property] = value;
            });
        }
    };
    $.fn.css = function(propertys,value) {
        if ($.toType(propertys) === "string") {
            return this.style(propertys,value);
        } else if($.isObject(propertys)) {
            if(value){
                var cssText = '';
                for(var p in propertys){
                    cssText += p+":"+propertys[p]+';';
                }
                this.each(function() {
                    this.style.cssText += cssText;
                })
            }else{
                this.each(function() {
                    for(var p in propertys){
                        this.style[p] = propertys[p];
                    }
                });
            }
            return this;
        }
    };
    _existsClass = function(name, dom) {
        var classes;
        if(!dom || !dom.className){
            return false;
        }
        classes = dom.className.split(/\s+/g);
        return classes.indexOf(name) >= 0;
    };
    _computedStyle = function(element, property) {
        return document.defaultView.getComputedStyle(element, "")[property];
    };
})(Quo);

(function($) {
    var DEFAULT, JSONP_ID, MIME_TYPES, _isJsonP, _parseResponse, _xhrError, _xhrForm, _xhrHeaders, _xhrStatus, _xhrSuccess, _xhrTimeout,requestObj;
    DEFAULT = {
        TYPE: "GET",
        MIME: "json"
    };
    MIME_TYPES = {
        script: "text/javascript, application/javascript",
        json: "application/json",
        xml: "application/xml, text/xml",
        html: "text/html",
        text: "text/plain"
    };
    JSONP_ID = 0;
    requestObj = {};
    $.ajaxSettings = {
        type: DEFAULT.TYPE,
        async: true,
        success: function(){},
        error: function(){},
        context: null,
        dataType: DEFAULT.MIME,
        data: {},
        headers: {},
        xhr: function() {
            return new window.XMLHttpRequest();
        },
        crossDomain: false,
        abortBefore: false,
        timeout: 0
    };
    $.ajax = function(options) {
        var abortTimeout, settings, xhr;
        settings = $.mix($.ajaxSettings, options);
        settings.type = settings.type.toUpperCase();
        if (settings.type === DEFAULT.TYPE) {
            settings.url += $.serializeParameters(settings.data, "?");
        } else {
            settings.data = $.serializeParameters(settings.data);
        }
        if (_isJsonP(settings.url)) {
            return $.jsonp(settings);
        }
        xhr = settings.xhr();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                clearTimeout(abortTimeout);
                return _xhrStatus(xhr, settings);
            }
        };
        xhr.open(settings.type, settings.url, settings.async);
        _xhrHeaders(xhr, settings);
        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function() {
                return _xhrTimeout(xhr, settings);
            }, settings.timeout);
        }
        try {
            xhr.send(settings.data);
        } catch (error) {
            xhr = error;
            _xhrError("Resource not found", xhr, settings);
        }
        if (settings.async) {
            return xhr;
        } else {
            return _parseResponse(xhr, settings);
        }
    };
    $.jsonp = function(settings) {
        var abortTimeout, callbackName, script, xhr, uniqueId;
        settings = $.mix($.ajaxSettings, settings);
        if (settings.async) {
            callbackName = "jsonp" + (++JSONP_ID);
            script = document.createElement("script");
            xhr = {
                abort: function() {
                    $(script).remove();
                    if (callbackName in window) {
                        return window[callbackName] = {};
                    }
                }
            };
            if(settings.abortBefore || settings.uniqueId){
                uniqueId = settings.uniqueId || encodeURIComponent(settings.url);
                if($.isObject(requestObj[uniqueId])){
                    try{
                        requestObj[uniqueId].abort();
                    }catch(e){}
                }
                requestObj[uniqueId] = xhr;
            }
            abortTimeout = undefined;
            window[callbackName] = function(response) {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
                if(uniqueId && requestObj[uniqueId])requestObj[uniqueId] = null
                return _xhrSuccess(response, xhr, settings);
            };
            if(/callback=\\?/.test(settings.url)){
                settings.url = settings.url.replace(RegExp("=\\?"), "=" + callbackName);
            }else{
                if(settings.url.indexOf('?')<0)
                    settings.url = settings.url+"?callback=" + callbackName;
                else
                    settings.url = settings.url+"&callback=" + callbackName;
            }
            if(settings.data)settings.url += $.serializeParameters(settings.data, "&");
            script.src = settings.url+'&rnd='+Math.random();

            $("head").append(script);
            if (settings.timeout > 0) {
                abortTimeout = setTimeout(function() {
                    return _xhrTimeout(xhr, settings);
                }, settings.timeout);
            }
            return xhr;
        } else {
            return console.error("QuoJS.ajax: Unable to make jsonp synchronous call.");
        }
    };
    $.get = function(url, data, success, dataType) {
        return $.ajax({
            url: url,
            data: data,
            success: success,
            dataType: dataType
        });
    };
    $.post = function(url, data, success, dataType) {
        return _xhrForm("POST", url, data, success, dataType);
    };
    $.put = function(url, data, success, dataType) {
        return _xhrForm("PUT", url, data, success, dataType);
    };
    $["delete"] = function(url, data, success, dataType) {
        return _xhrForm("DELETE", url, data, success, dataType);
    };
    $.json = function(url, data, success) {
        return $.ajax({
            url: url,
            data: data,
            success: success,
            dataType: DEFAULT.MIME
        });
    };
    $.serializeParameters = function(parameters, character) {
        var parameter, serialize;
        if (character == null) {
            character = "";
        }
        serialize = character;
        for (parameter in parameters) {
            if (parameters.hasOwnProperty(parameter)) {
                if (serialize !== character) {
                    serialize += "&";
                }
                serialize += parameter + "=" + encodeURIComponent(decodeURIComponent(parameters[parameter]));
            }
        }
        if (serialize === character) {
            return "";
        } else {
            return serialize;
        }
    };
    _xhrStatus = function(xhr, settings) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
            if (settings.async) {
                _xhrSuccess(_parseResponse(xhr, settings), xhr, settings);
            }
        } else {
            _xhrError("QuoJS.ajax: Unsuccesful request", xhr, settings);
        }
    };
    _xhrSuccess = function(response, xhr, settings) {
        settings.success.call(settings.context, response, xhr);
    };
    _xhrError = function(type, xhr, settings) {
        settings.error.call(settings.context, type, xhr, settings);
    };
    _xhrHeaders = function(xhr, settings) {
        var header;
        if(settings.type == 'POST'){
            settings.contentType = (settings.contentType || 'application/x-www-form-urlencoded');
        }
        if (settings.contentType) {
            settings.headers["Content-Type"] = settings.contentType;
        }
        if (settings.dataType) {
            settings.headers["Accept"] = MIME_TYPES[settings.dataType];
        }
        for (header in settings.headers) {
            xhr.setRequestHeader(header, settings.headers[header]);
        }
    };
    _xhrTimeout = function(xhr, settings) {
        xhr.onreadystatechange = {};
        xhr.abort();
        _xhrError("QuoJS.ajax: Timeout exceeded", xhr, settings);
    };
    _xhrForm = function(method, url, data, success, dataType) {
        return $.ajax({
            type: method,
            url: url,
            data: data,
            success: success,
            dataType: dataType,
            contentType: "application/x-www-form-urlencoded"
        });
    };
    _parseResponse = function(xhr, settings) {
        var response;
        response = xhr.responseText;
        if (response) {
            if (settings.dataType === DEFAULT.MIME) {
                try {
                    response = JSON.parse(response);
                } catch (error) {
                    response = error;
                    _xhrError("QuoJS.ajax: Parse Error", xhr, settings);
                }
            } else {
                if (settings.dataType === "xml") {
                    response = xhr.responseXML;
                }
            }
        }
        return response;
    };
    _isJsonP = function(url) {
        return RegExp("=\\?").test(url);
    };
})(Quo);

(function($) {
    var READY_EXPRESSION, SHORTCUTS, SHORTCUTS_EVENTS;
    READY_EXPRESSION = /complete|loaded|interactive/;
    SHORTCUTS = ["touch", "tap", "click"];
    SHORTCUTS_EVENTS = {
        touch: "touchstart",
        click: "click",
        tap: "tap"
    };
    SHORTCUTS.forEach(function(event) {
        $.fn[event] = function(callback) {
            if($.isFunction(callback))
                return $(document.body).delegate(this.selector, SHORTCUTS_EVENTS[event], callback);
            else{
                this.trigger($.getfixEvent(SHORTCUTS_EVENTS[event]));
            }

        };
        return this;
    });
    $.fn.on = function(event, selector, callback) {
        if (selector === undefined || $.toType(selector) === "function") {
            return this.bind(event, selector);
        } else {
            return this.delegate(selector, event, callback);
        }
    };
    $.fn.off = function(event, selector, callback) {
        if (selector === undefined || $.toType(selector) === "function") {
            return this.unbind(event, selector);
        } else {
            return this.undelegate(selector, event, callback);
        }
    };
    $.fn.ready = function(callback) {
        if (READY_EXPRESSION.test(document.readyState)) {
            callback($);
        } else {
            $.fn.addEvent(document, "DOMContentLoaded", function() {
                return callback($);
            });
        }
        return this;
    };
})(Quo);

(function($) {
    var ELEMENT_ID, EVENTS_DESKTOP, EVENT_METHODS, HANDLERS, _createProxy, _createProxyCallback, _environmentEvent, _findHandlers, _getElementId, _subscribe, _unsubscribe;
    ELEMENT_ID = 1;
    HANDLERS = {};
    EVENT_METHODS = {
        preventDefault: "isDefaultPrevented",
        stopImmediatePropagation: "isImmediatePropagationStopped",
        stopPropagation: "isPropagationStopped"
    };
    EVENTS_DESKTOP = {
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup",
        tap: "click",
        doubletap: "dblclick",
        orientationchange: "resize"
    };
    $.Event = function(type, touch) {
        var event, property;
        event = document.createEvent("Events");
        event.initEvent(type, true, true, null, null, null, null, null, null, null, null, null, null, null, null);
        if (touch) {
            for (property in touch) {
                event[property] = touch[property];
            }
        }
        return event;
    };
    $.getfixEvent = function(event){
        return _environmentEvent(event);
    };
    $.fn.bind = function(event, callback) {
        return this.each(function() {
            _subscribe(this, event, callback);
        });
    };
    $.fn.one = function(event, callback) {
        return this.each(function() {
            _subscribe(this, event, function () {
                if (this._done) { return; }
                callback();
                this._done = 1;
            });
        });
    };
    $.fn.unbind = function(event, callback) {
        return this.each(function() {
            _unsubscribe(this, event, callback);
        });
    };
    $.fn.delegate = function(selector, event, callback) {
        return this.each(function(i, element) {
            _subscribe(element, event, callback, selector, function(fn) {
                return function(e) {
                    var evt, match;
                    match = $(e.target).closest(selector, element).get(0);
                    if (match) {
                        evt = $.extend(_createProxy(e), {
                            currentTarget: match,
                            liveFired: element
                        });
                        return fn.apply(match, [evt].concat([].slice.call(arguments, 1)));
                    }
                };
            });
        });
    };
    $.fn.undelegate = function(selector, event, callback) {
        return this.each(function() {
            _unsubscribe(this, event, callback, selector);
        });
    };
    $.fn.trigger = function(event, touch) {
        if ($.toType(event) === "string") {
            event = $.Event(event, touch);
        }
        return this.each(function() {
            this.dispatchEvent(event);
        });
    };
    $.fn.addEvent = function(element, event_name, callback) {
        event_name = _environmentEvent(event_name);
        if (element.addEventListener) {
            element.addEventListener(event_name, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event_name, callback);
        } else {
            element["on" + event_name] = callback;
        }
        return this;
    };
    $.fn.removeEvent = function(element, event_name, callback) {
        event_name = _environmentEvent(event_name);
        if (element.removeEventListener) {
            element.removeEventListener(event_name, callback, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + event_name, callback);
        } else {
            element["on" + event_name] = null;
        }
        return this;
    };
    _subscribe = function(element, event, callback, selector, delegate_callback) {
        var delegate, element_handlers, element_id, handler;
        event = _environmentEvent(event);
        element_id = _getElementId(element);
        element_handlers = HANDLERS[element_id] || (HANDLERS[element_id] = []);
        delegate = delegate_callback && delegate_callback(callback, event);
        handler = {
            event: event,
            callback: callback,
            selector: selector,
            proxy: _createProxyCallback(delegate, callback, element),
            delegate: delegate,
            index: element_handlers.length
        };
        element_handlers.push(handler);
        return $.fn.addEvent(element, handler.event, handler.proxy);
    };
    _unsubscribe = function(element, event, callback, selector) {
        var element_id;
        event = _environmentEvent(event);
        element_id = _getElementId(element);
        return _findHandlers(element_id, event, callback, selector).forEach(function(handler) {
            delete HANDLERS[element_id][handler.index];
            return $.fn.removeEvent(element, handler.event, handler.proxy);
        });
    };
    _getElementId = function(element) {
        return element._id || (element._id = ELEMENT_ID++);
    };
    _environmentEvent = function(event) {
        var environment_event;
        environment_event = ($.isMobile() ? event : EVENTS_DESKTOP[event]);
        return environment_event || event;
    };
    _createProxyCallback = function(delegate, callback, element) {
        var proxy;
        callback = delegate || callback;
        proxy = function(event) {
            var result;
            result = callback.apply(element, [event].concat(event.data));
            if (result === false) {
                event.preventDefault();
            }
            return result;
        };
        return proxy;
    };
    _findHandlers = function(element_id, event, fn, selector) {
        return (HANDLERS[element_id] || []).filter(function(handler) {
            return handler && (!event || handler.event === event) && (!fn || handler.fn === fn) && (!selector || handler.selector === selector);
        });
    };
    _createProxy = function(event) {
        var proxy;
        proxy = $.extend({
            originalEvent: event
        }, event);
        $.each(EVENT_METHODS, function(name, method) {
            proxy[name] = function() {
                this[method] = function() {
                    return true;
                };
                return event[name].apply(event, arguments);
            };
            return proxy[method] = function() {
                return false;
            };
        });
        return proxy;
    };
})(Quo);

(function($) {
    var CURRENT_TOUCH, FIRST_TOUCH, GESTURE, GESTURES, HOLD_DELAY, TOUCH_TIMEOUT, _angle, _capturePinch, _captureRotation, _cleanGesture, _distance, _fingersPosition, _getTouches, _hold, _isSwipe, _listenTouches, _onTouchEnd, _onTouchMove, _onTouchStart, _parentIfText, _swipeDirection, _trigger;
    GESTURE = {};
    FIRST_TOUCH = [];
    CURRENT_TOUCH = [];
    TOUCH_TIMEOUT = undefined;
    HOLD_DELAY = 650;
    GESTURES = ["doubleTap", "hold", "swipe", "swiping", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "rotate", "rotating", "rotateLeft", "rotateRight", "pinch", "pinching", "pinchIn", "pinchOut", "drag", "dragLeft", "dragRight", "dragUp", "dragDown"];
    GESTURES.forEach(function(event) {
        $.fn[event] = function(callback) {
            if($.isFunction(callback))
                return this.on(event, callback);
            else
                this.trigger($.getfixEvent(event));
        };
    });
    _listenTouches = function() {
        var environment;
        environment = $(document.body);
        environment.bind("touchstart", _onTouchStart);
        environment.bind("touchmove", _onTouchMove);
        environment.bind("touchend", _onTouchEnd);
        return environment.bind("touchcancel", _cleanGesture);
    };
    _onTouchStart = function(event) {
        var delta, fingers, now, touches;
        now = Date.now();
        delta = now - (GESTURE.last || now);
        TOUCH_TIMEOUT && clearTimeout(TOUCH_TIMEOUT);
        touches = _getTouches(event);
        fingers = touches.length;
        FIRST_TOUCH = _fingersPosition(touches, fingers);
        GESTURE.el = $(_parentIfText(touches[0].target));
        GESTURE.fingers = fingers;
        GESTURE.last = now;
        if (fingers === 1) {
            GESTURE.isDoubleTap = delta > 0 && delta <= 250;
            return setTimeout(_hold, HOLD_DELAY);
        } else if (fingers === 2) {
            GESTURE.initial_angle = parseInt(_angle(FIRST_TOUCH), 10);
            GESTURE.initial_distance = parseInt(_distance(FIRST_TOUCH), 10);
            GESTURE.angle_difference = 0;
            return GESTURE.distance_difference = 0;
        }
    };
    _onTouchMove = function(event) {
        var fingers, touches;
        if (GESTURE.el) {
            touches = _getTouches(event);
            fingers = touches.length;
            if (fingers === GESTURE.fingers) {
                CURRENT_TOUCH = _fingersPosition(touches, fingers);
                if (_isSwipe(event)) {
                    _trigger("swiping");
                }
                if (fingers === 2) {
                    _captureRotation();
                    _capturePinch();
                    event.preventDefault();
                }
            } else {
                _cleanGesture();
            }
        }
        return true;
    };
    _isSwipe = function(event) {
        var move_horizontal, move_vertical, ret;
        ret = false;
        if (CURRENT_TOUCH[0]) {
            move_horizontal = Math.abs(FIRST_TOUCH[0].x - CURRENT_TOUCH[0].x) > 30;
            move_vertical = Math.abs(FIRST_TOUCH[0].y - CURRENT_TOUCH[0].y) > 30;
            ret = GESTURE.el && (move_horizontal || move_vertical);
        }
        return ret;
    };
    _onTouchEnd = function(event) {
        var anyevent, drag_direction, pinch_direction, rotation_direction, swipe_direction;
        if (GESTURE.isDoubleTap) {
            _trigger("doubleTap");
            return _cleanGesture();
        } else if (GESTURE.fingers === 1) {
            if (_isSwipe()) {
                _trigger("swipe");
                swipe_direction = _swipeDirection(FIRST_TOUCH[0].x, CURRENT_TOUCH[0].x, FIRST_TOUCH[0].y, CURRENT_TOUCH[0].y);
                _trigger("swipe" + swipe_direction);
                return _cleanGesture();
            } else {
                _trigger("tap");
                return TOUCH_TIMEOUT = setTimeout(_cleanGesture, 250);
            }
        } else if (GESTURE.fingers === 2) {
            anyevent = false;
            if (GESTURE.angle_difference !== 0) {
                _trigger("rotate", {
                    angle: GESTURE.angle_difference
                });
                rotation_direction = GESTURE.angle_difference > 0 ? "rotateRight" : "rotateLeft";
                _trigger(rotation_direction, {
                    angle: GESTURE.angle_difference
                });
                anyevent = true;
            }
            if (GESTURE.distance_difference !== 0) {
                _trigger("pinch", {
                    angle: GESTURE.distance_difference
                });
                pinch_direction = GESTURE.distance_difference > 0 ? "pinchOut" : "pinchIn";
                _trigger(pinch_direction, {
                    distance: GESTURE.distance_difference
                });
                anyevent = true;
            }
            if (!anyevent && CURRENT_TOUCH[0]) {
                if (Math.abs(FIRST_TOUCH[0].x - CURRENT_TOUCH[0].x) > 10 || Math.abs(FIRST_TOUCH[0].y - CURRENT_TOUCH[0].y) > 10) {
                    _trigger("drag");
                    drag_direction = _swipeDirection(FIRST_TOUCH[0].x, CURRENT_TOUCH[0].x, FIRST_TOUCH[0].y, CURRENT_TOUCH[0].y);
                    _trigger("drag" + drag_direction);
                }
            }
            return _cleanGesture();
        }
    };
    _fingersPosition = function(touches, fingers) {
        var i, result;
        result = [];
        i = 0;
        while (i < fingers) {
            result.push({
                x: touches[i].pageX,
                y: touches[i].pageY
            });
            i++;
        }
        return result;
    };
    _captureRotation = function() {
        var angle, diff, i, symbol;
        angle = parseInt(_angle(CURRENT_TOUCH), 10);
        diff = parseInt(GESTURE.initial_angle - angle, 10);
        if (Math.abs(diff) > 20 || GESTURE.angle_difference !== 0) {
            i = 0;
            symbol = GESTURE.angle_difference < 0 ? "-" : "+";
            while (Math.abs(diff - GESTURE.angle_difference) > 90 && i++ < 10) {
                eval("diff " + symbol + "= 180;");
            }
            GESTURE.angle_difference = parseInt(diff, 10);
            return _trigger("rotating", {
                angle: GESTURE.angle_difference
            });
        }
    };
    _capturePinch = function() {
        var diff, distance;
        distance = parseInt(_distance(CURRENT_TOUCH), 10);
        diff = GESTURE.initial_distance - distance;
        if (Math.abs(diff) > 10) {
            GESTURE.distance_difference = diff;
            return _trigger("pinching", {
                distance: diff
            });
        }
    };
    _trigger = function(type, params) {
        if (GESTURE.el) {
            params = params || {};
            if (CURRENT_TOUCH[0]) {
                params.iniTouch = (GESTURE.fingers > 1 ? FIRST_TOUCH : FIRST_TOUCH[0]);
                params.currentTouch = (GESTURE.fingers > 1 ? CURRENT_TOUCH : CURRENT_TOUCH[0]);
            }
            return GESTURE.el.trigger(type, params);
        }
    };
    _cleanGesture = function(event) {
        FIRST_TOUCH = [];
        CURRENT_TOUCH = [];
        GESTURE = {};
        return clearTimeout(TOUCH_TIMEOUT);
    };
    _angle = function(touches_data) {
        var A, B, angle;
        A = touches_data[0];
        B = touches_data[1];
        angle = Math.atan((B.y - A.y) * -1 / (B.x - A.x)) * (180 / Math.PI);
        if (angle < 0) {
            return angle + 180;
        } else {
            return angle;
        }
    };
    _distance = function(touches_data) {
        var A, B;
        A = touches_data[0];
        B = touches_data[1];
        return Math.sqrt((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)) * -1;
    };
    _getTouches = function(event) {
        if ($.isMobile()) {
            return event.touches;
        } else {
            return [event];
        }
    };
    _parentIfText = function(node) {
        if ("tagName" in node) {
            return node;
        } else {
            return node.parentNode;
        }
    };
    _swipeDirection = function(x1, x2, y1, y2) {
        var xDelta, yDelta;
        xDelta = Math.abs(x1 - x2);
        yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            if (x1 - x2 > 0) {
                return "Left";
            } else {
                return "Right";
            }
        } else {
            if (y1 - y2 > 0) {
                return "Up";
            } else {
                return "Down";
            }
        }
    };
    _hold = function() {
        if (GESTURE.last && (Date.now() - GESTURE.last >= HOLD_DELAY)) {
            return _trigger("hold");
        }
    };
    $(document).ready(function() {
        return _listenTouches();
    });
})(Quo);

(function($, undefined){
    var prefix = '', eventPrefix, endEventName, endAnimationName,
        document = window.document, testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        clearProperties = {}

    function downcase(str) { return str.toLowerCase() }
    function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }
    eventPrefix = $.environment().vendor;
    if(eventPrefix)prefix = '-' + downcase(eventPrefix) + '-';

    clearProperties[prefix + 'transition-property'] =
        clearProperties[prefix + 'transition-duration'] =
            clearProperties[prefix + 'transition-timing-function'] =
                clearProperties[prefix + 'animation-name'] =
                    clearProperties[prefix + 'animation-duration'] = ''

    $.fx = {
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    }

    $.fn.animate = function(properties, duration, ease, callback){
        if ($.isObject(duration))
            ease = duration.easing, callback = duration.complete, duration = duration.duration
        if (duration) duration = duration / 1000
        return this.anim(properties, duration, ease, callback)
    }

    $.fn.anim = function(properties, duration, ease, callback){
        var isCallBackSucces = false,transforms, cssProperties = {}, key, that = this, wrappedCallback, endEvent = $.fx.transitionEnd
        if (duration === undefined) duration = 0.4
        if ($.fx.off) duration = 0

        if (typeof properties == 'string') {
            // keyframe animation
            cssProperties[prefix + 'animation-name'] = properties
            cssProperties[prefix + 'animation-duration'] = duration + 's'
            endEvent = $.fx.animationEnd
        } else {
            if (!$.fx.off && typeof properties === 'object') {
                cssProperties[prefix + 'transition-property'] = Object.keys(properties).join(', ')
                cssProperties[prefix + 'transition-duration'] = duration + 's'
                cssProperties[prefix + 'transition-timing-function'] = (ease || 'linear')
            }
            // CSS transitions
            for (key in properties)
                if (supportedTransforms.test(key)) {
                    transforms || (transforms = [])
                    transforms.push(key + '(' + properties[key] + ')')
                }
                else cssProperties[key] = properties[key]

            if (transforms) cssProperties[prefix + 'transform'] = transforms.join(' ')
        }

        wrappedCallback = function(event){
            if(isCallBackSucces)return;
            isCallBackSucces = true
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, arguments.callee)
            }
            $(this).css(clearProperties, true)
            callback && callback.call(this)
        }
        if (duration > 0) this.bind(endEvent, wrappedCallback)

        setTimeout(function() {
            that.css(cssProperties, true)
            if (duration <= 0) setTimeout(function() {
                that.each(function(){ wrappedCallback.call(this) })
            }, 0)
        }, 0)
        setTimeout(function() {
            if(!isCallBackSucces){
                that.each(function(){ wrappedCallback.call(this) })
            }
        }, duration*1000+500)
        return this
    }

    testEl = null
})(Quo);

// Create scrollLeft and scrollTop methods
Quo.each( ["Left", "Top"], function( i, name ) {
    var method = "scroll" + name;

    Quo.fn[ method ] = function( val ) {
        var elem, win;

        if ( val === undefined ) {
            elem = this[ 0 ];

            if ( !elem ) {
                return null;
            }

            win = getWindow( elem );

            // Return the scroll offset
            return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
            win.document.body[ method ] || win.document.documentElement[ method ]:
                elem[ method ];
        }

        // Set the scroll offset
        return this.each(function() {
            win = getWindow( this );

            if ( win ) {
                win.scrollTo(
                    !i ? val : Quo( win ).scrollLeft(),
                    i ? val : Quo( win ).scrollTop()
                );

            } else {
                this[ method ] = val;
            }
        });
    };
});

function getWindow( elem ) {
    return Quo.isWindow( elem ) ?
        elem :
        elem.nodeType === 9 ?
        elem.defaultView || elem.parentWindow :
            false;
}
