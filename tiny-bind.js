(function(root) {
  var handlers = {
    'html': function(val) {
      if (typeof(val) == 'object') {
        this.node.innerHTML = JSON.stringify(val);
      } else {
        this.node.innerHTML = val;
      }
    },
    'value': function(val) {
      this.node.value = val;
    },
    'show': function(val) {
      this.node.style.display = val ? 'block' : 'none';
    },
    'showInline': function(val) {
      this.node.style.display = val ? 'inline-block' : 'none';
    },
    'checked': function(val) {
      this.node.checked = val;
    },
    'for': function(val) {
      this.node.innerHTML = '';
      var s = this;
      // if(Array.isArray(val)) {
      //   val.forEach(function(v) {
      //     s.node.innerHTML += s.template;
      //     contribTypes.forEach(function(type) {
      //       var all = [].slice.call(s.node.querySelectorAll('[' + tiny.prefix + type + ']'));
      //       all.forEach(function(element) {
      //         var key = element.getAttribute(tiny.prefix+type);
      //         console.log(v[key]);
      //         console.log(key);
      //         console.log(v);
      //         handlers[type].call(s, v[key]);
      //         // tiny.bindings[name].attach(type, element);
      //       });
      //     });
      //   });
        // var children = this.node.getElementsByTagName('*');

      // }
    }
  }

  var getVal = {
    'html': function() {
      return this.innerHTML;
    },
    'value': function() {
      return this.node.value;
    },
    'show': function() {
      return this.node.display == 'block';
    },
    'showInline': function() {
      return this.node.display == 'inline-block';
    },
    'checked': function() {
      return this.node.checked;
    }
  }

  var listeners = {
    'html': function(tc) {},
    'value': function(tc) {
      tc.node.addEventListener('input', function() {
        tc.binding.set(tc.getVal());
      });
    },
    'show': function(tc) {},
    'showInline': function(tc) {},
    'checked': function(tc) {
      tc.node.addEventListener('click', function() {
        tc.binding.set(tc.getVal());
      });
    },
    'for': function(tc) {
      tc.template = tc.node.innerHTML;
      tc.node.innerHTML = '';
    }
  }

  var contribTypes = ['html', 'value', 'show', 'showInline', 'checked'];
  var ctxTypes = ['ctx', 'for'];

  /* Contributor */
  function tc(binding, type, node) {
    this.binding     = binding;
    this.node        = node;
    this.type        = type;
    this.getVal      = getVal[type];
    this.handle      = handlers[type];
    listeners[type](this);
    this.handle(binding.value());
  }

  function tb(name, ctx) {
    this.val          = '';
    this.name         = name;
    if (ctx) { ctx.bind(this); }
    this.bindings     = {};
    this.contributors = [];
    this.subscribers  = [];
  }

  tb.prototype.bind = function(binding) {
    binding.setContext(this);
    this.bindings[binding.name] = binding;
  }

  tb.prototype.setContext = function(binding) {
    this.context = binding;
  }

  /* Binding */
  tb.prototype.set = function(val) {
    if (typeof(val) == 'object') {
      this.val = val;
      var b;
      for(key in val) {
        if (!(key in this.bindings)) {
          this.bindings[key] = new tb(key, this);
        }
        this.bindings[key].set(val[key]);
      }
    } else {
      if (val != this.val) {
        this.val = val;
        this.notify(this.val);
        if (this.context) {
          if (this.context.name != '$root') {
            this.context.trigger();
          }
        }
      }
    }
  }

  tb.prototype.value = function() {
    if (typeof(this.val) == 'object') {
      var res = {};
      for (key in this.bindings) {
        res[key] = this.bindings[key].value();
      }
      this.val = res;
    }
    return this.val;
  }

  tb.prototype.get = function(name) {
    return this.bindings[name];
  }

  tb.prototype.trigger = function() {
    if (this.contributors.length > 0 || this.subscribers.length > 0) {
      this.notify(this.value());
    }
  }

  tb.prototype.notify = function(val) {
    this.contributors.forEach(function(contributor) {
      contributor.handle(val);
    });
    this.subscribers.forEach(function(callback) {
      callback(val);
    });
  }

  tb.prototype.subscribe = function(cb) {
    cb(this.val);
    this.subscribers.push(cb);
  }

  tb.prototype.attach = function(type, element) {
    var cont = new tc(this, type, element);
    this.contributors.push(cont);
    return cont;
  }

  /* climb dom tree to find context */
  function getCtx(ele) {
    var scope = [];
    while (ele.parentNode) {
      if (ele.parentNode.hasAttribute('[' + tiny.prefix + 'for]')) {
        s = ele.parentNode.getAttribute('[' + tiny.prefix + 'for]');
        scope.unshift(s);
      }
    }
    scope.unshift('tinyRoot');
  }

  function attrSel(type) {
    return '[' + tiny.prefix + type + ']';
  }
  function _fetch(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }
  function parseAttr(val, root, index) {
    var names = val.split('.');
    var binding = root ? root : tiny.root;
    names.forEach(function(name) {
      if (name == '$root') {
        binding = tiny.root;
      } else if (name == '$index') {
        binding = binding.bindings[index];
      } else {
        if (!(name in binding.bindings)) {
          binding.bindings[name] = new tb(name, binding);
        }
        binding = binding.bindings[name];
      }
    });
    return binding;
  }

  root.tiny = {
    'prefix': 'tiny-',
    'root' : new tb('$root', null),
    'bindings': {},
    'init': function(prefix) {
      tiny.prefix = prefix ? prefix : 'tiny-';
      contribTypes.forEach(function(type) {
        _fetch(attrSel(type)).forEach(function(element) {
          var attrString = element.getAttribute(tiny.prefix + type);
          var binding = parseAttr(attrString);
          binding.attach(type, element);
        });
      });

      // tiny.prefix = prefix ? tiny.prefix : 'tiny-';
      // _fetch('[' + tiny.prefix + 'for]').forEach(function(e) {
      //   var name = e.getAttribute(tiny.prefix+'for');
      //   tiny.bindings[name] = new tb(name);
      //   tiny.bindings[name].attach('for', e);
      // });
      // contribTypes.forEach(function(type) {
      //   var attr = '[' + tiny.prefix + type + ']';
      //   _fetch(attr).forEach(function(element) {
      //     var name = element.getAttribute(tiny.prefix+type);
      //     if (!(name in tiny.bindings)) {
      //       tiny.bindings[name] = new tb(name);
      //     }
      //     tiny.bindings[name].attach(type, element);
      //   });
      // });
    },
    'new': function(name) { return new tb(name, tiny.root); },
    'set': function(name, value) {
      var binding = parseAttr(name);
      binding.set(value);
    },
    'get': function(attrString) {
      return parseAttr(attrString);
    },
    'old': function(type, selector, name, value) {
      var self = this;
      _fetch(selector).forEach(function(e) {
        if (!(name in self.bindings)) {
          self.bindings[name] = new tb(name);
        }
        self.bindings[name].attach(type, e);
        if (value) { self.bindings[name].set(value); }
      });
      return self.bindings[name];
    },
    'array': function(name, arr) {

    },
    'show': function(selector, name, value) {
      this.bind('show', selector, name, value);
    },
    'showInline': function(selector, name, value) {
      this.bind('showInline', selector, name, value);
    },
    'html': function(selector, name, value) {
      this.bind('html', selector, name, value);
    },
    'value': function(selector, name, value) {
      this.bind('value', selector, name, value);
    },
    'checked': function(selector, name, value) {
      this.bind('checked', selector, name, value);
    },
  }
})(this);
