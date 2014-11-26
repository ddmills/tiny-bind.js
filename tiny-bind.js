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
    'checked': function(val) {
      this.node.checked = val;
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
    'checked': function() {
      return this.node.checked;
    }
  }

  var listeners = {
    'html': function(tc) {

    },
    'value': function(tc) {
      tc.node.addEventListener('input', function() {
        tc.binding.set(tc.getVal());
      });
    },
    'show': function(tc) {
    },
    'checked': function(tc) {
      tc.node.addEventListener('click', function() {
        tc.binding.set(tc.getVal());
      });
    }
  }

  var contribTypes = ['html', 'value', 'show', 'checked'];

  function tc(binding, type, node) {
    this.binding = binding;
    this.node = node;
    this.type = type;
    this.getVal = getVal[type];
    this.handle = handlers[type];
    listeners[type](this);
    this.handle(binding.get());
  }

  function tb(name) {
    this.val          = '';
    this.name         = name;
    this.contributors = [];
    this.subscribers  = [];
  }

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

  function _fetch(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }

  root.tiny = {
    'bindings' : {},
    'bind'     : function(type, selector, name, value) {
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
    'show'    : function(selector, name, value) {
      this.bind('show', selector, name, value);
    },
    'html'    : function(selector, name, value) {
      this.bind('html', selector, name, value);
    },
    'value'   : function(selector, name, value) {
      this.bind('value', selector, name, value);
    },
    'checked' : function(selector, name, value) {
      this.bind('checked', selector, name, value);
    },
    'init'    : function(prefix) {
      prefix = prefix ? prefix : 'tiny-';
      contribTypes.forEach(function(type) {
        var attr = '[' + prefix + type + ']';
        _fetch(attr).forEach(function(element) {
          var name = element.getAttribute(prefix+type);
          if (!(name in tiny.bindings)) {
            tiny.bindings[name] = new tb(name);
          }
          tiny.bindings[name].attach(type, element);
        });
      });
    }
  }
})(this);
