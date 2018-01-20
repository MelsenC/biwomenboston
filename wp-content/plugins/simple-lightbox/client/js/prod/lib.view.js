window.SLB && SLB.attach && !function($) {
    var View = {
        assets: {},
        component_defaults: [],
        loading: [],
        cache: {},
        component_temps: {},
        options: {},
        _init: function() {
            this._super(),
            this.init_refs(),
            this.init_components()
        },
        init_refs: function() {
            var r, ref, prop;
            for (prop in this)
                if (prop = this[prop],
                this.is_component(prop) && !this.util.is_empty(prop.prototype._refs))
                    for (r in prop.prototype._refs)
                        ref = prop.prototype._refs[r],
                        this.util.is_string(ref) && ref in this && (ref = prop.prototype._refs[r] = this[ref]),
                        this.util.is_class(ref) || delete prop.prototype_refs[r]
        },
        init_components: function() {
            this.component_defaults = [this.Viewer]
        },
        init: function(options) {
            var t = this;
            $.when.apply($, this.loading).always(function() {
                $.extend(!0, t.options, options),
                $(window).on("popstate", function(e) {
                    var state = e.originalEvent.state;
                    if (t.util.in_obj(state, ["item", "viewer"])) {
                        var v = t.get_viewer(state.viewer);
                        return v.history_handle(e),
                        e.preventDefault()
                    }
                }),
                t.init_items()
            })
        },
        can_make_default_component: function(type) {
            return -1 !== $.inArray(type, this.component_defaults)
        },
        is_component: function(comp) {
            return this.util.is_class(comp, this.Component)
        },
        get_components: function(type) {
            var ret = {};
            if (this.is_component(type)) {
                var coll = type.prototype._slug + "s";
                coll in this.cache || (this.cache[coll] = {}),
                ret = this.cache[coll]
            }
            return ret
        },
        get_component: function(type, id) {
            var ret = null;
            if (!this.util.is_func(type))
                return ret;
            this.util.is_string(id) || (id = null);
            var coll = this.get_components(type);
            if (this.util.is_obj(coll)) {
                var tid = this.util.is_string(id) ? id : this.util.add_prefix("default");
                tid in coll && (ret = coll[tid])
            }
            return this.util.is_empty(ret) && (this.util.is_string(id) || this.can_make_default_component(type)) && (ret = this.add_component(type, id)),
            ret
        },
        add_component: function(type, id, options) {
            if (!this.util.is_func(type))
                return !1;
            if (this.util.is_empty(id) && !this.can_make_default_component(type))
                return !1;
            var ret = null;
            this.util.is_empty(id) && (id = this.util.add_prefix("default")),
            this.util.is_obj(options) || (options = {});
            var m = "component" !== type.prototype._slug ? "add_" + type.prototype._slug : null;
            if (ret = !this.util.is_empty(m) && m in this && this.util.is_func(this[m]) ? this[m](id, options) : new type(id,options),
            this.util.is_type(ret, type)) {
                var coll = this.get_components(type);
                switch ($.type(coll)) {
                case "object":
                    coll[id] = ret;
                    break;
                case "array":
                    coll.push(ret)
                }
            } else
                ret = null;
            return ret
        },
        add_component_temp: function(type) {
            var ret = null;
            return this.is_component(type) && (ret = new type(""),
            this.component_temps[ret._slug] = ret),
            ret
        },
        get_component_temp: function(type) {
            return this.has_component_temp(type) ? this.component_temps[type.prototype._slug] : this.add_component_temp(type)
        },
        has_component_temp: function(type) {
            return !!(this.is_component(type) && type.prototype._slug in this.component_temps)
        },
        get_options: function(opts) {
            var ret = {};
            if (this.util.is_string(opts) && (opts = [opts]),
            !this.util.is_array(opts))
                return ret;
            for (var x = 0; x < opts.length; x++)
                opts[x]in this.options && (ret[opts[x]] = this.options[opts[x]]);
            return ret
        },
        get_option: function(opt, def) {
            var ret = this.get_options(opt);
            return ret = this.util.is_obj(ret) && opt in ret ? ret[opt] : this.util.is_set(def) ? def : null
        },
        add_viewer: function(id, options) {
            var v = new this.Viewer(id,options);
            return this.get_viewers()[v.get_id()] = v,
            v
        },
        get_viewers: function() {
            return this.get_components(this.Viewer)
        },
        has_viewer: function(v) {
            return !!(this.util.is_string(v) && v in this.get_viewers())
        },
        get_viewer: function(v) {
            return this.has_viewer(v) || (v = this.util.add_prefix("default"),
            this.has_viewer(v) || (v = this.add_viewer(v),
            v = v.get_id())),
            this.get_viewers()[v]
        },
        init_items: function() {
            var t = this
              , handler = function() {
                var ret = t.show_item(this);
                return t.util.is_bool(ret) || (ret = !0),
                !ret
            }
              , sel = this.util.format('a[href][%s="%s"]', this.util.get_attribute("active"), 1);
            $(document).on("click", sel, null, handler)
        },
        get_items: function() {
            return this.get_components(this.Content_Item)
        },
        get_item: function(ref) {
            if (this.util.is_type(ref, this.Content_Item))
                return ref;
            var item = null;
            if (this.util.in_obj(ref, "nodeType")) {
                var key = this.get_component_temp(this.Content_Item).get_data_key();
                item = $(ref).data(key)
            } else if (this.util.is_string(ref, !1)) {
                var items = this.get_items();
                ref in items && (item = items[ref])
            }
            return this.util.is_instance(item, this.Content_Item) || (item = this.add_item(ref)),
            item
        },
        add_item: function(el) {
            return new this.Content_Item(el)
        },
        show_item: function(el) {
            return this.get_item(el).show()
        },
        save_item: function(item) {
            return this.util.is_instance(item, this.Content_Item) ? (this.get_items()[item.get_id()] = item,
            item) : item
        },
        get_content_handlers: function() {
            return this.get_components(this.Content_Handler)
        },
        get_content_handler: function(item) {
            var type = this.util.is_instance(item, this.Content_Item) ? item.get_attribute("type", "") : item.toString()
              , types = this.get_content_handlers();
            return type in types ? types[type] : null
        },
        extend_content_handler: function(id, attr) {
            var hdl = null;
            if (!this.util.is_string(id) || !this.util.is_obj(attr))
                return hdl;
            if (hdl = this.get_content_handler(id),
            null === hdl) {
                var hdls = this.get_content_handlers();
                hdls[id] = hdl = new this.Content_Handler(id,attr)
            } else
                hdl.set_attributes(attr);
            return this.util.in_obj(attr, "styles") && this.load_styles(attr.styles),
            hdl
        },
        add_group: function(g, attrs) {
            return g = new this.Group(g,attrs),
            this.get_groups()[g.get_id()] = g,
            g
        },
        get_groups: function() {
            return this.get_components(this.Group)
        },
        get_group: function(g) {
            return this.has_group(g) ? this.get_groups()[g] : this.add_group(g)
        },
        has_group: function(g) {
            return this.util.is_string(g) && g in this.get_groups()
        },
        extend_theme: function(id, attr) {
            if (!this.util.is_string(id))
                return !1;
            var dfr = $.Deferred();
            this.loading.push(dfr);
            var model = this.get_theme_model(id);
            return this.util.is_empty(model) && (model = this.save_theme_model({
                parent: null,
                id: id
            })),
            this.util.is_obj(attr) && ("id"in attr && delete attr.id,
            $.extend(model, attr)),
            this.util.in_obj(attr, "styles") && this.load_styles(attr.styles),
            this.util.is_obj(model.parent) || (model.parent = this.get_theme_model(model.parent)),
            dfr.resolve(),
            model
        },
        get_theme_models: function() {
            return this.Theme.prototype._models
        },
        get_theme_model: function(id) {
            var ms = this.get_theme_models();
            return this.util.in_obj(ms, id) ? ms[id] : {}
        },
        save_theme_model: function(model) {
            return this.util.in_obj(model, "id") && this.util.is_string(model.id) && (this.get_theme_models()[model.id] = model),
            model
        },
        extend_template_tag_handler: function(id, attr) {
            if (!this.util.is_string(id) || !this.util.is_obj(attr))
                return !1;
            var hdl, hdls = this.get_template_tag_handlers();
            return this.util.in_obj(hdls, id) ? (hdl = hdls[id],
            hdl.set_attributes(attr)) : (hdl = new this.Template_Tag_Handler(id,attr),
            hdls[hdl.get_id()] = hdl),
            this.util.in_obj(attr, "styles") && this.load_styles(attr.styles),
            this.util.in_obj(attr, "_hooks") && attr._hooks.call(hdl),
            hdl
        },
        get_template_tag_handlers: function() {
            return this.Template_Tag.prototype.handlers
        },
        get_template_tag_handler: function(id) {
            var handlers = this.get_template_tag_handlers();
            return this.util.in_obj(handlers, id) ? handlers[id] : null
        },
        load_styles: function(styles) {
            if (this.util.is_array(styles)) {
                for (var style, out = [], x = 0; x < styles.length; x++)
                    style = styles[x],
                    this.util.in_obj(style, "uri") && this.util.is_string(style.uri) && out.push('<link rel="stylesheet" type="text/css" href="' + style.uri + '" />');
                $("head").append(out.join(""))
            }
        }
    }
      , Component = {
        _slug: "component",
        _ns: null,
        _refs: {},
        _reciprocal: !1,
        _dom: null,
        _attributes: !1,
        _attr_default: {},
        _attr_default_parsed: !1,
        _attr_init: null,
        _attr_map: {},
        _events: {},
        _status: null,
        _id: "",
        _c: function(id, attributes) {
            this._set_id(id),
            this.util.is_obj(attributes) && (this._attr_init = attributes),
            this._hooks()
        },
        _set_parent: function() {
            this._super(View)
        },
        _hooks: function() {},
        _set_id: function(id) {
            return this.util.is_empty(this._id) && (this._id = this.util.is_string(id) ? id : this.util.guid()),
            this._id
        },
        get_id: function(ns) {
            var id = this._id;
            return this.util.is_bool(ns) && ns && (id = this.add_ns(id)),
            id
        },
        get_ns: function() {
            return null === this._ns && (this._ns = this.util.add_prefix(this._slug)),
            this._ns
        },
        add_ns: function(val) {
            return this.util.is_string(val) ? this.get_ns() + "_" + val : ""
        },
        get_status: function(id, raw) {
            var ret = !1;
            return this.util.in_obj(this._status, id) && (ret = raw ? this._status[id] : !!this._status[id]),
            ret
        },
        set_status: function(id, val) {
            return this.util.is_string(id) ? (this.util.is_set(val) || (val = !0),
            this.util.is_obj(this._status, !1) || (this._status = {}),
            this._status[id] = val) : this.util.is_set(val) || (val = !1),
            val
        },
        get_controller: function() {
            return this.get_parent()
        },
        has_reference: function(ref) {
            return !!(this.util.is_string(ref) && ref in this && ref in this.get_references())
        },
        get_references: function() {
            return this._refs
        },
        get_reference: function(ref) {
            return this.has_reference(ref) ? this._refs[ref] : null
        },
        get_component: function(cname, options) {
            var c = null;
            if (!this.has_reference(cname))
                return c;
            var opt_defaults = {
                check_attr: !0,
                get_default: !1
            };
            options = $.extend({}, opt_defaults, options);
            var ctype = this.get_reference(cname);
            return this.util.is_type(this[cname], ctype) ? this[cname] : (c = this[cname] = null,
            options.check_attr && (c = this.get_attribute(cname),
            this.util.is_empty(c) || (c = this.set_component(cname, c))),
            this.util.is_empty(c) && options.get_default && (c = this.get_controller().get_component(ctype)),
            c)
        },
        set_component: function(name, ref, validate) {
            var invalid = null;
            if (!this.has_reference(name))
                return invalid;
            if (this.util.is_empty(ref))
                ref = invalid;
            else {
                var ctype = this.get_reference(name);
                this.util.is_string(ref, !1) && (ref = this.get_controller().get_component(ctype, ref)),
                (!this.util.is_type(ref, ctype) || this.util.is_func(validate) && !validate.call(this, ref)) && (ref = invalid)
            }
            return this[name] = ref,
            this[name]
        },
        clear_component: function(name) {
            this.set_component(name, null)
        },
        init_attributes: function(force) {
            if (this.util.is_bool(force) || (force = !1),
            force || !this.util.is_obj(this._attributes)) {
                var a = this._attributes = {};
                $.extend(a, this.init_default_attributes()),
                this.util.is_obj(this._attr_init) && $.extend(a, this._attr_init),
                $.extend(a, this.get_dom_attributes())
            }
        },
        init_default_attributes: function() {
            if (!this._attr_default_parsed && this.util.is_obj(this._attr_map)) {
                var opts = this.get_controller().get_options(this.util.obj_keys(this._attr_map));
                if (this.util.is_obj(opts)) {
                    for (var opt in this._attr_map)
                        opt in opts && null !== this._attr_map[opt] && (opts[this._attr_map[opt]] = opts[opt],
                        delete opts[opt]);
                    $.extend(!0, this._attr_default, opts)
                }
                this._attr_default_parsed = !0
            }
            return this._attr_default
        },
        get_dom_attributes: function() {
            var attrs = {}
              , el = this.dom_get(null, {
                init: !1
            });
            if (el.length > 0) {
                var attrs_full = $(el).get(0).attributes;
                if (this.util.is_obj(attrs_full)) {
                    var attr_key, attr_prefix = this.util.get_attribute();
                    $.each(attrs_full, function(idx, attr) {
                        return attr.name.indexOf(attr_prefix) === -1 || (attr_key = attr.name.substr(attr_prefix.length + 1),
                        void (attrs[attr_key] = attr.value))
                    })
                }
            }
            return attrs
        },
        get_attributes: function() {
            return this.init_attributes(),
            this._attributes
        },
        get_attribute: function(key, def, enforce_type) {
            if (this.util.is_set(def) || (def = null),
            !this.util.is_string(key))
                return def;
            this.util.is_bool(enforce_type) || (enforce_type = !0);
            var ret = this.has_attribute(key) ? this.get_attributes()[key] : def;
            return enforce_type && ret !== def && null !== def && !this.util.is_type(ret, $.type(def), !1) && (this.util.is_scalar(def, !1) && this.util.is_scalar(ret, !1) ? this.util.is_string(def, !1) ? ret = ret.toString() : this.util.is_num(def, !1) && !this.util.is_num(ret, !1) ? (ret = this.util.is_int(def, !1) ? parseInt(ret) : parseFloat(ret),
            this.util.is_num(ret, !1) || (ret = def)) : ret = this.util.is_bool(def, !1) ? this.util.is_string(ret) || this.util.is_num(ret) : def : ret = def),
            ret
        },
        call_attribute: function(attr, args) {
            return attr = this.get_attribute(attr),
            this.util.is_func(attr) && (args = Array.prototype.slice.call(arguments, 1),
            attr = attr.apply(this, args)),
            attr
        },
        has_attribute: function(key) {
            return this.util.is_string(key) && key in this.get_attributes()
        },
        set_attributes: function(attributes, full) {
            this.util.is_bool(full) || (full = !1),
            this.init_attributes(full),
            this.util.is_obj(attributes) && $.extend(this._attributes, attributes)
        },
        set_attribute: function(key, val) {
            return this.util.is_string(key) && this.util.is_set(val) && (this.get_attributes()[key] = val),
            val
        },
        dom_get_selector: function(element) {
            return this.util.is_string(element) ? "." + this.add_ns(element) : ""
        },
        dom_get_attribute: function() {
            return this.util.get_attribute(this._slug)
        },
        dom_set: function(el) {
            return el = $(el),
            el.data(this.get_data_key(), this),
            this._reciprocal && (this._dom = el),
            el
        },
        dom_get: function(element, options) {
            var opts_default = {
                init: !0,
                put: !1
            };
            options = this.util.is_obj(options) ? $.extend({}, opts_default, options) : opts_default,
            options.init && !this.get_status("dom_init") && (this.set_status("dom_init"),
            this.dom_init());
            var ret = this._dom;
            if (ret && this.util.is_string(element)) {
                var ch = $(ret).find(this.dom_get_selector(element));
                ch.length ? ret = ch : (!0 === options.put || this.util.is_obj(options.put)) && (ret = this.dom_put(element, options.put))
            }
            return $(ret)
        },
        dom_init: function() {},
        dom_put: function(element, content) {
            var r = null;
            if (!this.dom_has() || !this.util.is_string(element))
                return $(r);
            var strip = ["tag", "content", "success"]
              , options = {
                tag: "div",
                content: "",
                class: this.add_ns(element)
            };
            this.util.is_empty(content) || (this.util.is_type(content, jQuery, !1) || this.util.is_string(content, !1) ? options.content = content : this.util.is_obj(content, !1) && $.extend(options, content));
            for (var attrs = $.extend({}, options), x = 0; x < strip.length; x++)
                delete attrs[strip[x]];
            var d = this.dom_get();
            return r = $(this.dom_get_selector(element), d),
            r.length || (r = $(this.util.format("<%s />", options.tag), attrs).appendTo(d),
            r.length && this.util.is_method(options, "success") && options.success.call(r, r)),
            $(r).append(options.content),
            $(r)
        },
        dom_has: function() {
            return !!this.dom_get().length
        },
        get_data_key: function() {
            return this.get_ns()
        },
        on: function(event, fn, options) {
            if (!this.util.is_string(event) || !this.util.is_func(fn)) {
                var t = this
                  , args = Array.prototype.slice.call(arguments, 1);
                return this.util.is_array(event) ? $.each(event, function(idx, val) {
                    t.on.apply(t, [val].concat(args))
                }) : this.util.is_obj(event) && $.each(event, function(ev, hdl) {
                    t.on.apply(t, [ev, hdl].concat(args))
                }),
                this
            }
            var options_std = {
                clear: !1
            };
            this.util.is_obj(options, !1) || (options = {}),
            options = $.extend({}, options_std, options),
            this.util.is_obj(this._events, !1) || (this._events = {});
            var es = this._events;
            return event in es && this.util.is_obj(es[event], !1) && !options.clear || (es[event] = []),
            es[event].push(fn),
            this
        },
        trigger: function(event, data) {
            var dfr = $.Deferred()
              , dfrs = []
              , t = this;
            if (this.util.is_array(event))
                return $.each(event, function(idx, val) {
                    dfrs.push(t.trigger(val, data))
                }),
                $.when.apply(t, dfrs).done(function() {
                    dfr.resolve()
                }),
                dfr.promise();
            if (!(this.util.is_string(event) && event in this._events))
                return dfr.resolve(),
                dfr.promise();
            var ev = {
                type: event,
                data: null
            };
            return this.util.is_set(data) && (ev.data = data),
            $.each(this._events[event], function(idx, fn) {
                dfrs.push(fn.call(t, ev, t))
            }),
            $.when.apply(this, dfrs).done(function() {
                dfr.resolve()
            }),
            dfr.promise()
        }
    };
    View.Component = Component = SLB.Class.extend(Component);
    var Viewer = {
        _slug: "viewer",
        _refs: {
            item: "Content_Item",
            theme: "Theme"
        },
        _reciprocal: !0,
        _attr_default: {
            loop: !0,
            animate: !0,
            autofit: !0,
            overlay_enabled: !0,
            overlay_opacity: "0.8",
            title_default: !1,
            container: null,
            slideshow_enabled: !0,
            slideshow_autostart: !1,
            slideshow_duration: 2,
            slideshow_active: !1,
            slideshow_timer: null,
            labels: {
                close: "close",
                nav_prev: "&laquo; prev",
                nav_next: "next &raquo;",
                slideshow_start: "start slideshow",
                slideshow_stop: "stop slideshow",
                group_status: "Image %current% of %total%",
                loading: "loading"
            }
        },
        _attr_map: {
            theme: null,
            group_loop: "loop",
            ui_autofit: "autofit",
            ui_animate: "animate",
            ui_overlay_opacity: "overlay_opacity",
            ui_labels: "labels",
            ui_title_default: "title_default",
            slideshow_enabled: null,
            slideshow_autostart: null,
            slideshow_duration: null
        },
        item: null,
        item_queued: null,
        theme: null,
        item_working: null,
        active: !1,
        init: !1,
        open: !1,
        loading: !1,
        _hooks: function() {
            var t = this;
            this.on(["item-prev", "item-next"], function() {
                t.trigger("item-change")
            }).on(["close", "item-change"], function() {
                t.unload().done(function() {
                    t.unlock()
                })
            })
        },
        get_item: function() {
            return this.get_component("item")
        },
        set_item: function(item) {
            this.clear_item(!1);
            var i = this.set_component("item", item, function(item) {
                return item.has_type()
            });
            return !this.util.is_empty(i)
        },
        clear_item: function(full) {
            this.util.is_bool(full) || (full = !0);
            var item = this.get_item();
            item && item.reset(),
            full && this.clear_component("item")
        },
        get_theme: function() {
            var ret = this.get_component("theme", {
                check_attr: !1
            });
            return this.util.is_empty(ret) && (ret = this.set_component("theme", new View.Theme(this))),
            ret
        },
        set_theme: function(theme) {
            this.set_component("theme", theme)
        },
        lock: function() {
            return this.set_status("item_working", $.Deferred())
        },
        get_lock: function(simple, full) {
            this.util.is_bool(simple) || (simple = !1),
            this.util.is_bool(full) || (full = !1);
            var s = "item_working";
            if (simple)
                return this.get_status(s);
            var r = this.get_status(s, !0);
            return this.util.is_promise(r) || (r = this.lock()),
            full ? r : r.promise()
        },
        is_locked: function() {
            return this.get_lock(!0)
        },
        unlock: function() {
            return this.get_lock(!1, !0).resolve()
        },
        set_active: function(mode) {
            return this.util.is_bool(mode) || (mode = !0),
            this.set_status("active", mode)
        },
        is_active: function() {
            return this.get_status("active")
        },
        set_loading: function(mode) {
            var dfr = $.Deferred();
            this.util.is_bool(mode) || (mode = !0),
            this.loading = mode,
            this.slideshow_active() && this.slideshow_pause(mode);
            var m = mode ? "addClass" : "removeClass";
            return $(this.dom_get())[m]("loading"),
            mode ? this.get_theme().transition("load").always(function() {
                dfr.resolve()
            }) : dfr.resolve(),
            dfr.promise()
        },
        unset_loading: function() {
            return this.set_loading(!1)
        },
        get_loading: function() {
            return !!this.util.is_bool(this.loading) && this.loading
        },
        is_loading: function() {
            return this.get_loading()
        },
        show: function(item) {
            this.item_queued = item;
            var fin_set = "show_deferred"
              , vt = "theme_valid"
              , valid = !0;
            if (this.has_attribute(vt) ? valid = this.get_attribute(vt, !0) : (valid = !(!this.get_theme() || "" === this.get_theme().get_template().get_layout(!1)),
            this.set_attribute(vt, valid)),
            !valid)
                return this.close(),
                !1;
            var v = this
              , fin = function() {
                return v.lock(),
                v.set_status(fin_set, !1),
                v.set_item(v.item_queued) ? (v.history_add(),
                v.set_active(),
                void v.render()) : (v.close(),
                !1)
            };
            this.is_locked() ? this.get_status(fin_set) || (this.set_status(fin_set),
            this.get_lock().always(function() {
                fin()
            })) : fin()
        },
        history_handle: function(e) {
            var state = e.originalEvent.state;
            if (this.util.is_string(state.item, !1))
                this.get_controller().get_item(state.item).show({
                    event: e
                }),
                this.trigger("item-change");
            else {
                var count = this.history_get(!0);
                this.history_set(0),
                -1 !== count && this.close()
            }
        },
        history_get: function(full) {
            return this.get_status("history_count", full)
        },
        history_set: function(val) {
            return this.set_status("history_count", val)
        },
        history_add: function() {
            if (!history.pushState)
                return !1;
            var item = this.get_item()
              , opts = item.get_attribute("options_show")
              , count = this.history_get() ? this.history_get(!0) : 0;
            if (this.util.in_obj(opts, "event")) {
                var e = opts.event.originalEvent;
                this.util.in_obj(e, "state") && this.util.in_obj(e.state, "count") && (count = e.state.count)
            } else {
                var state = {
                    viewer: this.get_id(),
                    item: null,
                    count: count
                };
                count || history.replaceState(state, null),
                state.item = this.get_controller().save_item(item).get_id(),
                state.count = ++count,
                history.pushState(state, "")
            }
            this.history_set(count)
        },
        history_reset: function() {
            var count = this.history_get(!0);
            count && (this.history_set(-1),
            history.go(-1 * count))
        },
        is_open: function() {
            return "none" !== this.dom_get().css("display")
        },
        render: function() {
            var v = this
              , thm = this.get_theme();
            v.dom_prep(),
            this.get_status("render-events") || (this.set_status("render-events"),
            thm.on("render-loading", function(ev, thm) {
                var dfr = $.Deferred();
                if (!v.is_active())
                    return dfr.reject(),
                    dfr.promise();
                var set_pos = function() {
                    v.dom_get().css("top", $(window).scrollTop())
                }
                  , always = function() {
                    v.set_loading().always(function() {
                        dfr.resolve()
                    })
                };
                return v.is_open() ? thm.transition("unload").fail(function() {
                    set_pos(),
                    thm.dom_get_tag("item", "content").attr("style", "")
                }).always(always) : thm.transition("open").always(function() {
                    always(),
                    v.events_open(),
                    v.open = !0
                }).fail(function() {
                    set_pos(),
                    v.get_overlay().show(),
                    v.dom_get().show()
                }),
                dfr.promise()
            }).on("render-complete", function(ev, thm) {
                if (!v.is_active())
                    return !1;
                var d = v.dom_get()
                  , classes = ["item_single", "item_multi"]
                  , ms = ["addClass", "removeClass"];
                v.get_item().get_group().is_single() || ms.reverse(),
                $.each(ms, function(idx, val) {
                    d[val](classes[idx])
                }),
                v.events_complete(),
                thm.transition("complete").fail(function() {
                    if (v.get_attribute("autofit", !0)) {
                        var dims = $.extend({
                            display: "inline-block"
                        }, thm.get_item_dimensions());
                        thm.dom_get_tag("item", "content").css(dims)
                    }
                }).always(function() {
                    v.unset_loading(),
                    v.trigger("render-complete"),
                    v.init = !0
                })
            })),
            thm.render()
        },
        dom_get_container: function() {
            var sel = this.get_attribute("container");
            this.util.is_empty(sel) && (sel = "#" + this.add_ns("wrap"));
            var c = $(sel);
            if (!c.length) {
                var id = 0 === sel.indexOf("#") ? sel.substr(1) : sel;
                c = $("<div />", {
                    id: id
                }).appendTo("body")
            }
            return c
        },
        dom_init: function() {
            var d = this.dom_set($("<div/>", {
                id: this.get_id(!0),
                class: this.get_ns()
            })).appendTo(this.dom_get_container()).hide()
              , thm = this.get_theme();
            d.addClass(thm.get_classes(" "));
            var v = this;
            this.get_status("render-init") || (this.set_status("render-init"),
            thm.on("render-init", function(ev) {
                v.dom_put("layout", ev.data)
            })),
            thm.render(!0)
        },
        dom_prep: function(mode) {
            var m = this.util.is_bool(mode) && !mode ? "removeClass" : "addClass";
            $("html")[m](this.util.add_prefix("overlay"))
        },
        dom_restore: function() {
            this.dom_prep(!1)
        },
        get_layout: function() {
            var ret = this.dom_get("layout", {
                put: {
                    success: function() {
                        $(this).hide()
                    }
                }
            });
            return ret
        },
        animation_enabled: function() {
            return this.get_attribute("animate", !0)
        },
        overlay_enabled: function() {
            var ov = this.get_attribute("overlay_enabled");
            return !!this.util.is_bool(ov) && ov
        },
        get_overlay: function() {
            var o = null
              , v = this;
            return this.overlay_enabled() && (o = this.dom_get("overlay", {
                put: {
                    success: function() {
                        $(this).hide().css("opacity", v.get_attribute("overlay_opacity"))
                    }
                }
            })),
            $(o)
        },
        unload: function() {
            var dfr = $.Deferred();
            return this.get_theme().dom_get_tag("item").text(""),
            dfr.resolve(),
            dfr.promise()
        },
        reset: function() {
            this.dom_get().hide(),
            this.dom_restore(),
            this.history_reset(),
            this.clear_item(),
            this.set_active(!1),
            this.set_loading(!1),
            this.slideshow_stop(),
            this.keys_disable(),
            this.unlock()
        },
        get_labels: function() {
            return this.get_attribute("labels", {})
        },
        get_label: function(name) {
            var lbls = this.get_labels();
            return name in lbls ? lbls[name] : ""
        },
        events_open: function() {
            if (this.keys_enable(),
            this.open)
                return !1;
            var l = this.get_layout();
            l.children().click(function(ev) {
                ev.stopPropagation()
            });
            var v = this
              , close = function() {
                v.close()
            };
            l.click(close),
            this.get_overlay().click(close),
            this.trigger("events-open")
        },
        events_complete: function() {
            return !this.init && void this.trigger("events-complete")
        },
        keys_enable: function(mode) {
            this.util.is_bool(mode) || (mode = !0);
            var e = ["keyup", this.util.get_prefix()].join(".")
              , v = this
              , h = function(ev) {
                return v.keys_control(ev)
            };
            mode ? $(document).on(e, h) : $(document).off(e)
        },
        keys_disable: function() {
            this.keys_enable(!1)
        },
        keys_control: function(ev) {
            var handlers = {
                27: this.close,
                37: this.item_prev,
                39: this.item_next
            };
            if (ev.which in handlers)
                return handlers[ev.which].call(this),
                !1
        },
        slideshow_enabled: function() {
            var o = this.get_attribute("slideshow_enabled");
            return !(!(this.util.is_bool(o) && o && this.get_item()) || this.get_item().get_group().is_single())
        },
        slideshow_active: function() {
            return !(!this.slideshow_enabled() || !(this.get_attribute("slideshow_active") || !this.init && this.get_attribute("slideshow_autostart")))
        },
        slideshow_clear_timer: function() {
            clearInterval(this.get_attribute("slideshow_timer"))
        },
        slideshow_set_timer: function(callback) {
            this.set_attribute("slideshow_timer", setInterval(callback, 1e3 * this.get_attribute("slideshow_duration")))
        },
        slideshow_start: function() {
            if (!this.slideshow_enabled())
                return !1;
            this.set_attribute("slideshow_active", !0),
            this.dom_get().addClass("slideshow_active"),
            this.slideshow_clear_timer();
            var v = this;
            this.slideshow_set_timer(function() {
                v.slideshow_pause(),
                v.item_next()
            }),
            this.trigger("slideshow-start")
        },
        slideshow_stop: function(full) {
            this.util.is_bool(full) || (full = !0),
            full && (this.set_attribute("slideshow_active", !1),
            this.dom_get().removeClass("slideshow_active")),
            this.slideshow_clear_timer(),
            this.trigger("slideshow-stop")
        },
        slideshow_toggle: function() {
            return !!this.slideshow_enabled() && (this.slideshow_active() ? this.slideshow_stop() : this.slideshow_start(),
            void this.trigger("slideshow-toggle"))
        },
        slideshow_pause: function(mode) {
            this.util.is_bool(mode) || (mode = !0),
            this.slideshow_active() && (mode ? this.slideshow_stop(!1) : this.slideshow_start()),
            this.trigger("slideshow-pause")
        },
        slideshow_resume: function() {
            this.slideshow_pause(!1)
        },
        item_next: function() {
            var g = this.get_item().get_group(!0)
              , v = this
              , ev = "item-next"
              , st = ["events", "viewer", ev].join("_");
            g.get_status(st) || (g.set_status(st),
            g.on(ev, function(e) {
                v.trigger(e.type)
            })),
            g.show_next()
        },
        item_prev: function() {
            var g = this.get_item().get_group(!0)
              , v = this
              , ev = "item-prev"
              , st = ["events", "viewer", ev].join("_");
            g.get_status(st) || (g.set_status(st),
            g.on(ev, function() {
                v.trigger(ev)
            })),
            g.show_prev()
        },
        close: function() {
            this.set_active(!1);
            var v = this
              , thm = this.get_theme();
            return thm.transition("unload").always(function() {
                thm.transition("close", !0).always(function() {
                    v.reset(),
                    v.trigger("close")
                })
            }).fail(function() {
                thm.dom_get_tag("item", "content").attr("style", "")
            }),
            !1
        }
    };
    View.Viewer = Component.extend(Viewer);
    var Group = {
        _slug: "group",
        _reciprocal: !0,
        _refs: {
            current: "Content_Item"
        },
        current: null,
        selector: null,
        _hooks: function() {
            var t = this;
            this.on(["item-prev", "item-next"], function() {
                t.trigger("item-change")
            })
        },
        get_selector: function() {
            return this.util.is_empty(this.selector) && (this.selector = this.util.format('a[%s="%s"]', this.dom_get_attribute(), this.get_id())),
            this.selector
        },
        get_items: function() {
            var items = $(this.get_selector());
            return 0 === items.length && this.has_current() && (items = this.get_current().dom_get()),
            items
        },
        get_item: function(idx) {
            this.util.is_int(idx) || (idx = 0);
            var items = this.get_items()
              , max = this.get_size() - 1;
            return idx > max && (idx = max),
            items.get(idx)
        },
        get_pos: function(item) {
            return this.util.is_empty(item) && (item = this.get_current()),
            this.util.is_type(item, View.Content_Item) ? this.get_items().index(item.dom_get()) : -1
        },
        has_current: function() {
            return !this.util.is_empty(this.get_current())
        },
        get_current: function() {
            return null === this.current || this.util.is_type(this.current, View.Content_Item) || (this.current = null),
            this.current
        },
        set_current: function(item) {
            this.util.is_type(item, View.Content_Item) && (this.current = item)
        },
        get_next: function(item) {
            if (this.util.is_type(item, View.Content_Item) || (item = this.get_current()),
            1 === this.get_size())
                return item;
            var next = null
              , pos = this.get_pos(item);
            return pos !== -1 && (pos = pos + 1 < this.get_size() ? pos + 1 : 0,
            (0 !== pos || item.get_viewer().get_attribute("loop")) && (next = this.get_item(pos))),
            next
        },
        get_prev: function(item) {
            if (this.util.is_type(item, View.Content_Item) || (item = this.get_current()),
            1 === this.get_size())
                return item;
            var prev = null
              , pos = this.get_pos(item);
            return pos === -1 || 0 === pos && !item.get_viewer().get_attribute("loop") || (0 === pos && (pos = this.get_size()),
            pos -= 1,
            prev = this.get_item(pos)),
            prev
        },
        show_next: function(item) {
            if (this.get_size() > 1) {
                var next = this.get_next(item);
                next || (this.util.is_type(item, View.Content_Item) || (item = this.get_current()),
                item.get_viewer().close());
                var i = this.get_controller().get_item(next);
                this.set_current(i),
                i.show(),
                this.trigger("item-next")
            }
        },
        show_prev: function(item) {
            if (this.get_size() > 1) {
                var prev = this.get_prev(item);
                prev || (this.util.is_type(item, View.Content_Item) || (item = this.get_current()),
                item.get_viewer().close());
                var i = this.get_controller().get_item(prev);
                this.set_current(i),
                i.show(),
                this.trigger("item-prev")
            }
        },
        get_size: function() {
            return this.get_items().length
        },
        is_single: function() {
            return 1 === this.get_size()
        }
    };
    View.Group = Component.extend(Group);
    var Content_Handler = {
        _slug: "content_handler",
        _refs: {
            item: "Content_Item"
        },
        item: null,
        template: "",
        has_item: function() {
            return !this.util.is_empty(this.get_item())
        },
        get_item: function() {
            return this.get_component("item")
        },
        set_item: function(item) {
            var r = this.set_component("item", item);
            return r
        },
        clear_item: function() {
            this.clear_component("item")
        },
        match: function(item) {
            var attr = "match"
              , m = this.get_attribute(attr);
            if (!this.util.is_empty(m)) {
                if (this.util.is_string(m) && (m = new RegExp(m,"i"),
                this.set_attribute(attr, m)),
                this.util.is_type(m, RegExp))
                    return m.test(item.get_uri());
                if (this.util.is_func(m))
                    return !!m.call(this, item)
            }
            return !1
        },
        load: function(item) {
            var dfr = $.Deferred()
              , ret = this.call_attribute("load", item, dfr);
            return null === ret && dfr.resolve(),
            dfr.promise()
        },
        render: function(item) {
            var dfr = $.Deferred();
            return this.call_attribute("render", item, dfr),
            dfr.promise()
        }
    };
    View.Content_Handler = Component.extend(Content_Handler);
    var Content_Item = {
        _slug: "content_item",
        _reciprocal: !0,
        _refs: {
            viewer: "Viewer",
            group: "Group",
            type: "Content_Handler"
        },
        _attr_default: {
            source: null,
            permalink: null,
            dimensions: null,
            title: "",
            group: null,
            internal: !1,
            output: null
        },
        group: null,
        viewer: null,
        type: null,
        data: null,
        loaded: null,
        _c: function(el) {
            this.dom_set(el),
            this._super()
        },
        init_default_attributes: function() {
            this._super();
            var d = this.dom_get()
              , key = d.attr(this.util.get_attribute("asset")) || null
              , assets = this.get_controller().assets || null;
            if (this.util.is_string(key)) {
                var attrs = [{}, this._attr_default, {
                    permalink: d.attr("href")
                }];
                if (this.util.is_obj(assets)) {
                    var t = this
                      , get_assets = function(key) {
                        var ret = {};
                        return key in assets && t.util.is_obj(assets[key]) && (ret = assets[key]),
                        ret
                    };
                    attrs.push(get_assets(key))
                }
                this._attr_default = $.extend.apply(this, attrs)
            }
            return this._attr_default
        },
        get_output: function() {
            var dfr = $.Deferred()
              , ret = this.get_attribute("output");
            if (this.util.is_string(ret))
                dfr.resolve(ret);
            else if (this.has_type()) {
                var type = this.get_type()
                  , item = this;
                type.render(this).done(function(output) {
                    item.set_output(output),
                    dfr.resolve(output)
                })
            } else
                dfr.resolve("");
            return dfr.promise()
        },
        set_output: function(out) {
            this.util.is_string(out, !1) && this.set_attribute("output", out)
        },
        get_content: function() {
            return this.get_output()
        },
        get_uri: function(mode) {
            $.inArray(mode, ["source", "permalink"]) === -1 && (mode = "source");
            var ret = this.get_attribute(mode);
            return this.util.is_string(ret) || (ret = "source" === mode ? this.get_attribute("permalink") : ""),
            ret = ret.replace(/&(#38|amp);/, "&")
        },
        get_title: function() {
            var prop = "title"
              , prop_cached = prop + "_cached";
            if (this.has_attribute(prop_cached))
                return this.get_attribute(prop_cached, "");
            var title = ""
              , sel_cap = ".wp-caption-text"
              , dom = this.dom_get();
            if (dom.length && !this.in_gallery() && (title = dom.attr(prop),
            title || (title = dom.siblings(sel_cap).html())),
            !title)
                for (var props = ["caption", "title"], x = 0; x < props.length && (title = this.get_attribute(props[x], ""),
                this.util.is_empty(title)); x++)
                    ;
            if (!title && dom.length && (title = dom.find("img").first().attr("alt"),
            title || (title = dom.get(0).innerText.trim())),
            this.util.is_string(title, !1) || (title = ""),
            !this.util.is_empty(title) && !this.get_viewer().get_attribute("title_default")) {
                var f = this.get_uri("source")
                  , i = f.lastIndexOf("/");
                -1 !== i && (f = f.substr(i + 1),
                i = f.lastIndexOf("."),
                -1 !== i && (f = f.substr(0, i)),
                title === f && (title = ""))
            }
            return this.set_attribute(prop_cached, title),
            title
        },
        get_dimensions: function() {
            return $.extend({
                width: 0,
                height: 0
            }, this.get_attribute("dimensions"), {})
        },
        set_data: function(data) {
            this.data = data
        },
        get_data: function() {
            return this.data
        },
        gallery_type: function() {
            var ret = null
              , types = {
                wp: ".gallery-icon",
                ngg: ".ngg-gallery-thumbnail"
            }
              , dom = this.dom_get();
            for (var type in types)
                if (dom.parent(types[type]).length > 0) {
                    ret = type;
                    break
                }
            return ret
        },
        in_gallery: function(gType) {
            var type = this.gallery_type();
            return null !== type && (!this.util.is_string(gType) || gType === type)
        },
        get_viewer: function() {
            return this.get_component("viewer", {
                get_default: !0
            })
        },
        set_viewer: function(v) {
            return this.set_component("viewer", v)
        },
        get_group: function(set_current) {
            var prop = "group"
              , g = this.get_component(prop);
            return g || (g = this.set_component(prop, new View.Group),
            set_current = !0),
            set_current && g.set_current(this),
            g
        },
        set_group: function(g) {
            this.util.is_string(g) && (g = this.get_controller().get_group(g)),
            this.group = !!this.util.is_type(g, View.Group) && g
        },
        get_type: function() {
            var t = this.get_component("type", {
                check_attr: !1
            });
            return t || (t = this.set_type(this.get_controller().get_content_handler(this))),
            t
        },
        set_type: function(type) {
            return this.set_component("type", type)
        },
        has_type: function() {
            var ret = !this.util.is_empty(this.get_type());
            return ret
        },
        show: function(options) {
            if (!this.has_type())
                return !1;
            this.set_attribute("options_show", options);
            var v = this.get_viewer();
            this.load();
            var ret = v.show(this);
            return ret
        },
        load: function() {
            return this.util.is_promise(this.loaded) || (this.loaded = this.get_type().load(this)),
            this.loaded.promise()
        },
        reset: function() {
            this.set_attribute("options_show", null)
        }
    };
    View.Content_Item = Component.extend(Content_Item);
    var Modeled_Component = {
        _slug: "modeled_component",
        get_attribute: function(key, def, check_model, enforce_type) {
            if (!this.util.is_string(key))
                return this._super(key, def, enforce_type);
            this.util.is_bool(check_model) || (check_model = !0);
            var ret = null;
            if (check_model) {
                var m = this.get_ancestor(key, !1);
                this.util.in_obj(m, key) && (ret = m[key])
            }
            return null === ret && (ret = this._super(key, def, enforce_type)),
            ret
        },
        get_attribute_recursive: function(key, def, enforce_type) {
            var ret = this.get_attribute(key, def, !0, enforce_type);
            if (this.util.is_obj(ret)) {
                var models = this.get_ancestors(!1);
                ret = [ret];
                var t = this;
                $.each(models, function(idx, model) {
                    key in model && t.util.is_obj(model[key]) && ret.push(model[key])
                }),
                ret.push({}),
                ret = $.extend.apply($, ret.reverse())
            }
            return ret
        },
        set_attribute: function(key, val, use_model) {
            if (!this.util.is_string(key) || !this.util.is_set(val))
                return !1;
            if (this.util.is_bool(use_model) || this.util.is_obj(use_model) || (use_model = !0),
            use_model) {
                var model = this.util.is_obj(use_model) ? use_model : this.get_model();
                model[key] = val
            } else
                this._super(key, val);
            return val
        },
        get_model: function() {
            var m = this.get_attribute("model", null, !1);
            return this.util.is_obj(m) || (m = {},
            this.set_attribute("model", m, !1)),
            m
        },
        has_model: function() {
            return !this.util.is_empty(this.get_model())
        },
        in_model: function(key) {
            return !!this.util.in_obj(this.get_model(), key)
        },
        get_ancestors: function(inc_current) {
            for (var ret = [], m = this.get_model(); this.util.is_obj(m); )
                ret.push(m),
                m = this.util.in_obj(m, "parent") && this.util.is_obj(m.parent) ? m.parent : null;
            return inc_current || ret.shift(),
            ret
        },
        get_ancestor: function(attr, safe_mode) {
            if (!this.util.is_string(attr))
                return !1;
            this.util.is_bool(safe_mode) || (safe_mode = !0);
            for (var mcurr = this.get_model(), m = mcurr, found = !1; this.util.is_obj(m); ) {
                if (this.util.in_obj(m, attr) && !this.util.is_empty(m[attr])) {
                    found = !0;
                    break
                }
                m = this.util.in_obj(m, "parent") ? m.parent : null
            }
            return found || (safe_mode ? (this.util.is_empty(m) && (m = mcurr),
            this.util.in_obj(m, attr) || (m[attr] = null)) : m = null),
            m
        }
    };
    Modeled_Component = Component.extend(Modeled_Component);
    var Theme = {
        _slug: "theme",
        _refs: {
            viewer: "Viewer",
            template: "Template"
        },
        _models: {},
        _attr_default: {
            template: null,
            model: null
        },
        viewer: null,
        template: null,
        _c: function(id, attributes, viewer) {
            1 === arguments.length && this.util.is_type(arguments[0], View.Viewer) && (viewer = arguments[0],
            id = null),
            this._super(id, attributes),
            this.set_viewer(viewer),
            this.set_model(id)
        },
        get_viewer: function() {
            return this.get_component("viewer", {
                check_attr: !1,
                get_default: !0
            })
        },
        set_viewer: function(v) {
            return this.set_component("viewer", v)
        },
        get_template: function() {
            var ret = this.get_component("template");
            if (this.util.is_empty(ret)) {
                var attr = {
                    theme: this,
                    model: this.get_model()
                };
                ret = this.set_component("template", new View.Template(attr))
            }
            return ret
        },
        get_tags: function(name, prop) {
            return this.get_template().get_tags(name, prop)
        },
        dom_get_tag: function(tag, prop) {
            return $(this.get_template().dom_get_tag(tag, prop))
        },
        get_tag_selector: function(name, prop) {
            return this.get_template().get_tag_selector(name, prop)
        },
        get_models: function() {
            return this._models
        },
        get_model: function(id) {
            var ret = null;
            if (!this.util.is_set(id) && this.util.is_obj(this.get_attribute("model", null, !1)))
                ret = this._super();
            else {
                var models = this.get_models();
                this.util.is_string(id) || (id = this.get_controller().get_option("theme_default")),
                this.util.in_obj(models, id) || (id = $.map(models, function(v, key) {
                    return key
                })[0]),
                ret = models[id]
            }
            return ret
        },
        set_model: function(id) {
            this.set_attribute("model", this.get_model(id), !1)
        },
        get_classes: function(rtype) {
            var cls = []
              , thm = this
              , models = this.get_ancestors(!0);
            return $.each(models, function(idx, model) {
                cls.push(thm.add_ns(model.id))
            }),
            this.util.is_string(rtype) && (cls = cls.join(rtype)),
            cls
        },
        get_measurement: function(attr, def) {
            var meas = null;
            if (!this.util.is_string(attr))
                return meas;
            this.util.is_obj(def, !1) || (def = {});
            var attr_cache = this.util.format("%s_cache", attr)
              , cache = this.get_attribute(attr_cache, {}, !1)
              , status = "_status"
              , item = this.get_viewer().get_item()
              , w = $(window);
            status in cache && this.util.is_obj(cache[status]) && cache[status].width === w.width() && cache[status].height === w.height() || (cache = {}),
            this.util.is_empty(cache) && (cache[status] = {
                width: w.width(),
                height: w.height(),
                index: []
            });
            var pos = $.inArray(item, cache[status].index);
            return pos !== -1 && pos in cache && (meas = cache[pos]),
            this.util.is_obj(meas) || (meas = this.call_attribute(attr),
            this.util.is_obj(meas) || (meas = this.get_measurement_default(attr))),
            meas = this.util.is_obj(meas) ? $.extend({}, def, meas) : def,
            pos = cache[status].index.push(item) - 1,
            cache[pos] = meas,
            this.set_attribute(attr_cache, cache, !1),
            $.extend({}, meas)
        },
        get_measurement_default: function(attr) {
            return this.util.is_string(attr) ? (attr = this.util.format("get_%s_default", attr),
            this.util.in_obj(this, attr) ? (attr = this[attr],
            this.util.is_func(attr) && (attr = attr.call(this))) : attr = null,
            attr) : null
        },
        get_offset: function() {
            return this.get_measurement("offset", {
                width: 0,
                height: 0
            })
        },
        get_offset_default: function() {
            var offset = {
                width: 0,
                height: 0
            }
              , v = this.get_viewer()
              , vn = v.dom_get()
              , vc = vn.clone().attr("id", "").css({
                visibility: "hidden",
                position: "absolute",
                top: ""
            }).removeClass("loading").appendTo(vn.parent())
              , l = vc.find(v.dom_get_selector("layout"));
            if (l.length) {
                l.find("*").css({
                    width: "",
                    height: "",
                    display: ""
                });
                var tags = this.get_tags("item", "content");
                if (tags.length) {
                    var offset_item = v.get_item().get_dimensions();
                    tags = $(l.find(tags[0].get_selector("full")).get(0)).css({
                        width: offset_item.width,
                        height: offset_item.height
                    }),
                    $.each(offset_item, function(key, val) {
                        offset[key] = -1 * val
                    })
                }
                offset.width += l.width(),
                offset.height += l.height(),
                $.each(offset, function(key, val) {
                    val < 0 && (offset[key] = 0)
                })
            }
            return vc.empty().remove(),
            offset
        },
        get_margin: function() {
            return this.get_measurement("margin", {
                width: 0,
                height: 0
            })
        },
        get_item_dimensions: function() {
            var v = this.get_viewer()
              , dims = v.get_item().get_dimensions();
            if (v.get_attribute("autofit", !1)) {
                var margin = this.get_margin()
                  , offset = this.get_offset();
                offset.height += margin.height,
                offset.width += margin.width;
                var max = {
                    width: $(window).width(),
                    height: $(window).height()
                };
                max.width > offset.width && (max.width -= offset.width),
                max.height > offset.height && (max.height -= offset.height);
                var factor = Math.min(max.width / dims.width, max.height / dims.height);
                factor < 1 && $.each(dims, function(key) {
                    dims[key] = Math.round(dims[key] * factor)
                })
            }
            return $.extend({}, dims)
        },
        get_dimensions: function() {
            var dims = this.get_item_dimensions()
              , offset = this.get_offset();
            return $.each(dims, function(key) {
                dims[key] += offset[key]
            }),
            dims
        },
        get_breakpoints: function() {
            return this.get_attribute_recursive("breakpoints")
        },
        get_breakpoint: function(target) {
            var ret = 0;
            if (this.util.is_string(target)) {
                var b = this.get_attribute_recursive("breakpoints");
                this.util.is_obj(b) && target in b && (ret = b[target])
            }
            return ret
        },
        render: function(init) {
            var thm = this
              , tpl = this.get_template()
              , st = "events_render";
            this.get_status(st) || (this.set_status(st),
            tpl.on(["render-init", "render-loading", "render-complete"], function(ev) {
                return thm.trigger(ev.type, ev.data)
            })),
            tpl.render(init)
        },
        transition: function(event, clear_queue) {
            var dfr = null
              , attr = "transition"
              , v = this.get_viewer()
              , fx_temp = null
              , anim_on = v.animation_enabled();
            if (v.get_attribute(attr, !0) && this.util.is_string(event)) {
                var anim_stop = function() {
                    var l = v.get_layout();
                    l.find("*").each(function() {
                        for (var el = $(this); el.queue().length; )
                            el.stop(!1, !0)
                    })
                };
                clear_queue && anim_stop();
                var trns, attr_set = [attr, "set"].join("_");
                if (this.get_attribute(attr_set))
                    trns = this.get_attribute(attr, {});
                else {
                    var models = this.get_ancestors(!0);
                    trns = [],
                    this.set_attribute(attr_set, !0);
                    var thm = this;
                    $.each(models, function(idx, model) {
                        attr in model && thm.util.is_obj(model[attr]) && trns.push(model[attr])
                    }),
                    trns.push({}),
                    trns = this.set_attribute(attr, $.extend.apply($, trns.reverse()))
                }
                this.util.is_method(trns, event) && (anim_on || (fx_temp = $.fx.off,
                $.fx.off = !0),
                dfr = trns[event].call(this, v, $.Deferred()))
            }
            return this.util.is_promise(dfr) || (dfr = $.Deferred(),
            dfr.reject()),
            dfr.always(function() {
                null !== fx_temp && ($.fx.off = fx_temp)
            }),
            dfr.promise()
        }
    };
    View.Theme = Modeled_Component.extend(Theme);
    var Template = {
        _slug: "template",
        _reciprocal: !0,
        _refs: {
            theme: "Theme"
        },
        _attr_default: {
            layout_uri: "",
            layout_raw: "",
            layout_parsed: "",
            tags: null,
            model: null
        },
        theme: null,
        _c: function(attributes) {
            this._super("", attributes)
        },
        _hooks: function() {
            this.on("dom_init", function(ev) {
                var tags = this.get_tags(null, null, !0)
                  , names = []
                  , t = this;
                $.each(tags, function(idx, tag) {
                    var name = tag.get_name();
                    -1 === $.inArray(name, names) && (names.push(name),
                    tag.get_handler().trigger(ev.type, {
                        template: t
                    }))
                })
            })
        },
        get_theme: function() {
            var ret = this.get_component("theme");
            return ret
        },
        render: function(init) {
            var v = this.get_theme().get_viewer();
            if (this.util.is_bool(init) || (init = !1),
            init)
                this.trigger("render-init", this.dom_get());
            else {
                if (!v.is_active())
                    return !1;
                var item = v.get_item();
                if (!this.util.is_type(item, View.Content_Item))
                    return v.close(),
                    !1;
                if (v.is_active() && this.has_tags()) {
                    var loading_promise = this.trigger("render-loading")
                      , tpl = this
                      , tags = this.get_tags()
                      , tag_promises = [];
                    $.when(item.load(), loading_promise).done(function() {
                        return !!v.is_active() && ($.each(tags, function(idx, tag) {
                            return !!v.is_active() && void tag_promises.push(tag.render(item).done(function(r) {
                                return !!v.is_active() && void r.tag.dom_get().html(r.output)
                            }))
                        }),
                        !!v.is_active() && void $.when.apply($, tag_promises).done(function() {
                            tpl.trigger("render-complete")
                        }))
                    })
                }
            }
        },
        get_layout: function(parsed) {
            this.util.is_bool(parsed) || (parsed = !0);
            var l = parsed ? this.parse_layout() : this.get_attribute("layout_raw", "");
            return l
        },
        parse_layout: function() {
            var a = "layout_parsed"
              , ret = this.get_attribute(a);
            return this.util.is_string(ret) ? ret : (ret = this.sanitize_layout(this.get_layout(!1)),
            ret = this.parse_tags(ret),
            this.set_attribute(a, ret),
            ret)
        },
        sanitize_layout: function(l) {
            if (this.util.is_empty(l))
                return l;
            var rtype = this.util.is_string(l) ? "string" : null
              , dom = $(l)
              , tag_temp = this.get_tag_temp()
              , cls = tag_temp.get_class()
              , cls_new = ["x", cls].join("_");
            switch ($(tag_temp.get_selector(), dom).each(function() {
                $(this).removeClass(cls).addClass(cls_new)
            }),
            rtype) {
            case "string":
                dom = dom.wrap("<div />").parent().html(),
                l = dom;
                break;
            default:
                l = dom
            }
            return l
        },
        parse_tags: function(l) {
            if (!this.util.is_string(l))
                return "";
            for (var match, re = /\{{2}\s*(\w.*?)\s*\}{2}/gim; match = re.exec(l); )
                l = l.substring(0, match.index) + this.get_tag_container(match[1]) + l.substring(match.index + match[0].length);
            return l
        },
        get_tag_container: function(tag) {
            var attr = this.get_tag_attribute();
            return this.util.format('<span %s="%s"></span>', attr, encodeURI(tag))
        },
        get_tag_attribute: function() {
            return this.get_tag_temp().dom_get_attribute()
        },
        get_tag: function(idx) {
            var ret = null;
            if (this.has_tags()) {
                var tags = this.get_tags();
                (!this.util.is_int(idx) || 0 > idx || idx >= tags.length) && (idx = 0),
                ret = tags[idx]
            }
            return ret
        },
        get_tags: function(name, prop, isolate) {
            this.util.is_bool(isolate) || (isolate = !1);
            var a = "tags"
              , tags = this.get_attribute(a);
            if (!this.util.is_array(tags)) {
                tags = [];
                var d = this.dom_get()
                  , attr = this.get_tag_attribute()
                  , nodes = $(d).find("[" + attr + "]");
                $(nodes).each(function() {
                    var el = $(this)
                      , tag = new View.Template_Tag(decodeURI(el.attr(attr)));
                    tag.has_handler() && (tags.push(tag),
                    isolate || (tag.dom_set(el),
                    el.addClass(tag.get_classes(" ")))),
                    isolate || el.removeAttr(attr)
                }),
                isolate || this.set_attribute(a, tags, !1)
            }
            if (!this.util.is_empty(tags) && this.util.is_string(name)) {
                this.util.is_string(prop) || (prop = !1);
                for (var tags_filtered = [], tc = null, x = 0; x < tags.length; x++)
                    tc = tags[x],
                    name === tc.get_name() && (prop && prop !== tc.get_prop() || tags_filtered.push(tc));
                tags = tags_filtered
            }
            return this.util.is_array(tags, !1) ? tags : []
        },
        has_tags: function() {
            return this.get_tags().length > 0
        },
        get_tag_temp: function() {
            return this.get_controller().get_component_temp(View.Template_Tag)
        },
        get_tag_selector: function(name, prop) {
            this.util.is_string(name) || (name = ""),
            this.util.is_string(prop) || (prop = "");
            var tag = this.get_tag_temp();
            return tag.set_attribute("name", name),
            tag.set_attribute("prop", prop),
            tag.get_selector("full")
        },
        dom_init: function() {
            this.dom_set(this.get_layout()),
            this.trigger("dom_init")
        },
        dom_get_tag: function(tag, prop) {
            var ret = $()
              , tags = this.get_tags(tag, prop);
            if (tags.length) {
                var level = null;
                this.util.is_string(tag) && (level = this.util.is_string(prop) ? "full" : "tag");
                var sel = "." + tags[0].get_class(level);
                ret = this.dom_get().find(sel)
            }
            return ret
        }
    };
    View.Template = Modeled_Component.extend(Template);
    var Template_Tag = {
        _slug: "template_tag",
        _reciprocal: !0,
        _attr_default: {
            name: null,
            prop: null,
            match: null
        },
        handlers: {},
        _c: function(tag_match) {
            this.parse(tag_match)
        },
        parse: function(tag_match) {
            if (!this.util.is_string(tag_match))
                return !1;
            var part, parts = tag_match.split("|");
            if (!parts.length)
                return null;
            var attrs = {
                name: null,
                prop: null,
                match: tag_match
            };
            attrs.name = parts[0],
            attrs.name.indexOf(".") !== -1 && (attrs.name = attrs.name.split(".", 2),
            attrs.prop = attrs.name[1],
            attrs.name = attrs.name[0]);
            for (var x = 1; x < parts.length; x++)
                part = parts[x].split(":", 1),
                part.length > 1 && !(part[0]in attrs) && (attrs[part[0]] = part[1]);
            this.set_attributes(attrs, !0)
        },
        render: function(item) {
            var tag = this;
            return tag.get_handler().render(item, tag).pipe(function(output) {
                return {
                    tag: tag,
                    output: output
                }
            })
        },
        get_name: function() {
            return this.get_attribute("name")
        },
        get_prop: function() {
            return this.get_attribute("prop")
        },
        get_handler: function() {
            return this.has_handler() ? this.handlers[this.get_name()] : new View.Template_Tag_Handler("")
        },
        has_handler: function() {
            return this.get_name()in this.handlers
        },
        get_classes: function(rtype) {
            var cls = [this.get_class(), this.get_class("tag"), this.get_class("full")];
            return this.util.is_string(rtype) && (cls = cls.join(rtype)),
            cls
        },
        get_class: function(level) {
            var cls = "";
            switch (level) {
            case "tag":
                cls = this.get_name();
                break;
            case "full":
                var i, parts = [this.get_name(), this.get_prop()], a = [];
                for (i = 0; i < parts.length; i++)
                    this.util.is_string(parts[i]) && a.push(parts[i]);
                cls = a.join("_")
            }
            return this.util.is_string(cls) ? this.add_ns(cls) : this.get_ns()
        },
        get_selector: function(level) {
            var ret = this.get_class(level);
            return ret = this.util.is_string(ret) ? "." + ret : ""
        }
    };
    View.Template_Tag = Component.extend(Template_Tag);
    var Template_Tag_Handler = {
        _slug: "template_tag_handler",
        _attr_default: {
            supports_modifiers: !1,
            dynamic: !1,
            props: {}
        },
        render: function(item, instance) {
            var dfr = $.Deferred();
            return this.call_attribute("render", item, instance, dfr),
            dfr.promise()
        },
        add_prop: function(prop, fn) {
            var a = "props"
              , props = this.get_attribute(a);
            return !(!this.util.is_string(prop) || !this.util.is_func(fn)) && (this.util.is_obj(props, !1) || (props = {}),
            props[prop] = fn,
            void this.set_attribute(a, props))
        },
        handle_prop: function(prop, item, instance) {
            var props = this.get_attribute("props")
              , out = "";
            return out = this.util.is_obj(props) && prop in props && this.util.is_func(props[prop]) ? props[prop].call(this, item, instance) : item.get_viewer().get_label(prop)
        }
    };
    View.Template_Tag_Handler = Component.extend(Template_Tag_Handler),
    View = SLB.attach("View", View)
}(jQuery);
