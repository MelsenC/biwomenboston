window.jQuery && !function($) {
    "use strict";
    var c_init = !1
      , Class = function() {};
    Class.extend = function(members) {
        function Class() {
            c_init || ("function" == typeof this._init && this._init.apply(this, arguments),
            "function" == typeof this._c && this._c.apply(this, arguments))
        }
        var _super = this.prototype;
        c_init = !0;
        var proto = new this;
        c_init = !1;
        var val, name;
        for (name in proto)
            $.isPlainObject(proto[name]) && (val = $.extend({}, proto[name]),
            proto[name] = val);
        var make_handler = function(nm, fn) {
            return function() {
                var tmp = this._super;
                this._super = _super[nm];
                var ret = fn.apply(this, arguments);
                return this._super = tmp,
                ret
            }
        };
        for (name in members)
            "function" == typeof members[name] && "function" == typeof _super[name] ? proto[name] = make_handler(name, members[name]) : proto[name] = $.isPlainObject(members[name]) ? $.extend({}, members[name]) : members[name];
        return Class.prototype = proto,
        Class.prototype.constructor = Class,
        Class.extend = this.extend,
        Class
    }
    ;
    var Base = {
        base: !1,
        _parent: null,
        prefix: "slb",
        _init: function() {
            this._set_parent()
        },
        _set_parent: function(p) {
            this.util.is_set(p) && (this._parent = p),
            this.util._parent = this
        },
        attach: function(member, data, simple) {
            var ret = data;
            return simple = "undefined" != typeof simple && !!simple,
            "string" === $.type(member) && ($.isPlainObject(data) && !simple && (data._parent = this,
            data = this.Class.extend(data)),
            this[member] = "function" === $.type(data) ? new data : data,
            ret = this[member]),
            ret
        },
        has_child: function(child) {
            if (!this.util.is_string(child))
                return !1;
            var children = child.split(".");
            child = null;
            var x, o = this;
            for (x = 0; x < children.length; x++)
                if (child = children[x],
                "" !== child) {
                    if (!this.util.is_obj(o) || !o[child])
                        return !1;
                    o = o[child]
                }
            return !0
        },
        is_base: function() {
            return !!this.base
        },
        get_parent: function() {
            var p = this._parent;
            return p || (this._parent = {}),
            this._parent
        }
    }
      , Utilities = {
        _base: null,
        _parent: null,
        get_base: function() {
            if (!this._base) {
                for (var p = this.get_parent(), p_prev = null, methods = ["is_base", "get_parent"]; p_prev !== p && this.is_method(p, methods) && !p.is_base(); )
                    p_prev = p,
                    p = p.get_parent();
                this._base = p
            }
            return this._base
        },
        get_parent: function(prop) {
            var ret = this._parent;
            return ret || (ret = this._parent = {}),
            this.is_string(prop) && (ret = this.in_obj(ret, prop) ? ret[prop] : null),
            ret
        },
        get_sep: function(sep) {
            var sep_default = "_";
            return this.is_string(sep, !1) ? sep : sep_default
        },
        get_prefix: function() {
            var p = this.get_parent("prefix");
            return this.is_string(p, !1) ? p : ""
        },
        has_prefix: function(val, sep) {
            return this.is_string(val) && 0 === val.indexOf(this.get_prefix() + this.get_sep(sep))
        },
        add_prefix: function(val, sep, once) {
            return this.is_string(val) ? (sep = this.get_sep(sep),
            this.is_bool(once) || (once = !0),
            once && this.has_prefix(val, sep) ? val : [this.get_prefix(), val].join(sep)) : this.get_prefix()
        },
        remove_prefix: function(val, sep, once) {
            if (!this.is_string(val, !0))
                return "";
            if (sep = this.get_sep(sep),
            this.is_bool(once) || (once = !0),
            this.has_prefix(val, sep)) {
                var prfx = this.get_prefix() + sep;
                do
                    val = val.substr(prfx.length);
                while (!once && this.has_prefix(val, sep))
            }
            return val
        },
        get_attribute: function(attr_base) {
            var sep = "-"
              , top = "data"
              , attr = [top, this.get_prefix()].join(sep);
            return this.is_string(attr_base) && 0 !== attr_base.indexOf(attr + sep) && (attr = [attr, attr_base].join(sep)),
            attr
        },
        get_context: function() {
            var b = this.get_base();
            return $.isArray(b.context) || (b.context = []),
            b.context
        },
        is_context: function(ctx) {
            return this.is_string(ctx) && (ctx = [ctx]),
            this.is_array(ctx) && this.arr_intersect(this.get_context(), ctx).length > 0
        },
        is_set: function(val) {
            return "undefined" != typeof val
        },
        is_type: function(val, type, nonempty) {
            var ret = !1;
            if (this.is_set(val) && null !== val && this.is_set(type))
                switch ($.type(type)) {
                case "function":
                    ret = val instanceof type;
                    break;
                case "string":
                    ret = $.type(val) === type;
                    break;
                default:
                    ret = !1
                }
            return !ret || this.is_set(nonempty) && !nonempty || (ret = !this.is_empty(val)),
            ret
        },
        is_string: function(value, nonempty) {
            return this.is_type(value, "string", nonempty)
        },
        is_array: function(value, nonempty) {
            return this.is_type(value, "array", nonempty)
        },
        is_bool: function(value) {
            return this.is_type(value, "boolean", !1)
        },
        is_obj: function(value, nonempty) {
            return this.is_type(value, "object", nonempty)
        },
        is_func: function(value) {
            return this.is_type(value, "function", !1)
        },
        is_method: function(obj, key) {
            var ret = !1;
            if (this.is_string(key) && (key = [key]),
            this.in_obj(obj, key)) {
                ret = !0;
                for (var x = 0; ret && x < key.length; )
                    ret = this.is_func(obj[key[x]]),
                    x++
            }
            return ret
        },
        is_instance: function(obj, parent) {
            return !!this.is_func(parent) && (this.is_obj(obj) && obj instanceof parent)
        },
        is_class: function(cls, parent) {
            var ret = this.is_func(cls) && "prototype"in cls;
            return ret && this.is_set(parent) && (ret = this.is_instance(cls.prototype, parent)),
            ret
        },
        is_num: function(value, nonempty) {
            var f = {
                nan: Number.isNaN ? Number.isNaN : isNaN,
                finite: Number.isFinite ? Number.isFinite : isFinite
            };
            return this.is_type(value, "number", nonempty) && !f.nan(value) && f.finite(value)
        },
        is_int: function(value, nonempty) {
            return this.is_num(value, nonempty) && Math.floor(value) === value
        },
        is_scalar: function(value, nonempty) {
            return this.is_num(value, nonempty) || this.is_string(value, nonempty) || this.is_bool(value)
        },
        is_empty: function(value, type) {
            var ret = !1;
            if (this.is_set(value))
                for (var empties = [null, "", !1, 0], x = 0; !ret && x < empties.length; )
                    ret = empties[x] === value,
                    x++;
            else
                ret = !0;
            if (!ret)
                if (this.is_set(type) || (type = $.type(value)),
                this.is_type(value, type, !1))
                    switch (type) {
                    case "string":
                    case "array":
                        ret = 0 === value.length;
                        break;
                    case "number":
                        ret = 0 == value;
                        break;
                    case "object":
                        if ($.isPlainObject(value)) {
                            if (Object.getOwnPropertyNames)
                                ret = 0 === Object.getOwnPropertyNames(value).length;
                            else if (value.hasOwnProperty) {
                                ret = !0;
                                for (var key in value)
                                    if (value.hasOwnProperty(key)) {
                                        ret = !1;
                                        break
                                    }
                            }
                        } else
                            ret = !1
                    }
                else
                    ret = !0;
            return ret
        },
        is_promise: function(obj) {
            return this.is_method(obj, ["then", "done", "always", "fail", "pipe"])
        },
        format: function(fmt, val) {
            if (!this.is_string(fmt))
                return "";
            var params = []
              , ph = "%s"
              , strip = function(txt) {
                return txt.indexOf(ph) !== -1 ? txt.replace(ph, "") : txt
            };
            if (arguments.length < 2 || fmt.indexOf(ph) === -1)
                return strip(fmt);
            params = Array.prototype.slice.call(arguments, 1),
            val = null;
            for (var x = 0; x < params.length; x++)
                this.is_scalar(params[x], !1) || (params[x] = "");
            if (1 === params.length)
                fmt = fmt.replace(ph, params[0].toString());
            else {
                for (var idx = 0, len = params.length, rlen = ph.length, pos = 0; (pos = fmt.indexOf(ph)) && pos !== -1 && idx < len; )
                    fmt = fmt.substr(0, pos) + params[idx].toString() + fmt.substr(pos + rlen),
                    idx++;
                fmt = strip(fmt)
            }
            return fmt
        },
        in_obj: function(obj, key, all) {
            this.is_bool(all) || (all = !0),
            this.is_string(key) && (key = [key]);
            var ret = !1;
            if (this.is_obj(obj) && this.is_array(key))
                for (var val, x = 0; x < key.length && (val = key[x],
                ret = !!(this.is_string(val) && val in obj),
                !(!all && ret || all && !ret)); x++)
                    ;
            return ret
        },
        obj_keys: function(obj) {
            var keys = [];
            if (!this.is_obj(obj))
                return keys;
            if (Object.keys)
                keys = Object.keys(obj);
            else {
                var prop;
                for (prop in obj)
                    obj.hasOwnProperty(prop) && keys.push(prop)
            }
            return keys
        },
        arr_intersect: function(arr1, arr2) {
            var x, ret = [], params = Array.prototype.slice.call(arguments), arrs = [];
            for (x = 0; x < params.length; x++)
                this.is_array(params[x], !1) && arrs.push(params[x]);
            if (arrs.length < 2)
                return ret;
            params = arr1 = arr2 = null;
            var add, sub, base = arrs.shift();
            for (x = 0; x < base.length; x++) {
                for (add = !0,
                sub = 0; sub < arrs.length; sub++)
                    if (arrs[sub].indexOf(base[x]) === -1) {
                        add = !1;
                        break
                    }
                add && ret.push(base[x])
            }
            return ret
        },
        guid: function() {
            function _p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p
            }
            return _p8() + _p8(!0) + _p8(!0) + _p8()
        },
        parse_uri: function(uri) {
            return $('<a href="' + uri + '"/>').get(0)
        },
        parse_query: function(uri) {
            var delim = {
                vars: "&",
                val: "="
            }
              , query = {
                raw: [],
                parsed: {},
                string: ""
            };
            if (uri = this.parse_uri(uri),
            0 === uri.search.indexOf("?")) {
                query.raw = uri.search.substr(1).split(delim.vars);
                var i, temp, key, val;
                for (i = 0; i < query.raw.length; i++)
                    temp = query.raw[i].split(delim.val),
                    key = temp.shift(),
                    val = temp.length > 0 ? temp.join(delim.val) : null,
                    query.parsed[key] = val
            }
            return query.parsed
        },
        build_query: function(query) {
            var val, q = [], delim = {
                vars: "&",
                val: "="
            };
            for (var key in query)
                val = null !== query[key] ? delim.val + query[key] : "",
                q.push(key + val);
            return q.join(delim.vars)
        }
    };
    Base.attach("util", Utilities, !0);
    var SLB_Base = Class.extend(Base)
      , Core = {
        base: !0,
        context: [],
        Class: SLB_Base,
        _init: function() {
            this._super(),
            $("html").addClass(this.util.get_prefix())
        }
    }
      , SLB_Core = SLB_Base.extend(Core);
    window.SLB = new SLB_Core
}(jQuery);
