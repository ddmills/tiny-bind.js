(function(root) {
  var handlers = {
    'html': function(val) {
      this.node.innerHTML = val;
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
      if(Array.isArray(val)) {
        val.forEach(function(v) {
          s.node.innerHTML += '<li>hello</li>';
        });
      }
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
    'show': function() {
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
      tc.node.innerHTML = '';
    }
  }

  var contribTypes = ['html', 'value', 'show', 'showInline', 'checked'];
  /* Contributor */
  function tc(binding, type, node) {
    this.binding     = binding;
    this.node        = node;
    this.type        = type;
    this.getVal      = getVal[type];
    this.handle      = handlers[type];
    listeners[type](this);
    this.handle(binding.get());
  }

  function tb(name, ctx) {
    this.val          = '';
    this.name         = name;
    this.context      = ctx;
    this.contributors = [];
    this.subscribers  = [];
  }

  /* Binding */
  tb.prototype.set = function(val) {
    if (val != this.val) {
      this.val = val;
      this.notify(this.val);
    }
  }

  tb.prototype.get = function() {
    return this.val;
  }

  tb.prototype.trigger = function() {
    this.notify(this.val);
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

  function _fetch(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }

  root.tiny = {
    'prefix': 'tiny-',
    'bindings': {},
    'init': function(prefix) {
      tiny.prefix = prefix ? tiny.prefix : 'tiny-';
      _fetch('[' + tiny.prefix + 'for]').forEach(function(e) {
        var name = e.getAttribute(tiny.prefix+'for');
        tiny.bindings[name] = new tb(name);
        tiny.bindings[name].attach('for', e);
      });
      contribTypes.forEach(function(type) {
        var attr = '[' + tiny.prefix + type + ']';
        _fetch(attr).forEach(function(element) {
          var name = element.getAttribute(tiny.prefix+type);
          if (!(name in tiny.bindings)) {
            tiny.bindings[name] = new tb(name);
          }
          tiny.bindings[name].attach(type, element);
        });
      });
    },
    'bind': function(type, selector, name, value) {
      var self = this;
      _fetch(selector).forEach(function(e) {
        if (!(name in self.bindings)) {
          self.bindings[name] = new tb(name, self.bindings);
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
