(function(root) {
  function tc(binding, node) {
    this.binding = binding;
    this.node = node;
    var self = this;
    this.node.addEventListener('input', function() {
      self.binding.set(self.node.value);
    });
  }

  tc.prototype.notify = function(val) {
    if (this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
      this.node.value = val;
    } else {
      this.node.innerHTML = val;
    }
  }

  function tb(name) {
    this.name = name;
    this.contributors = [];
    this.subscribers = [];
  }

  tb.prototype.set = function(val) {
    this.val = val;
    this.notify(this.val);
  }

  tb.prototype.get = function() {
    return this.val;
  }

  tb.prototype.notify = function(val) {
    this.contributors.forEach(function(contributor) {
      contributor.notify(val);
    });
    this.subscribers.forEach(function(callback) {
      callback(val);
    });
  }

  tb.prototype.subscribe = function(cb) {
    this.subscribers.push(cb);
  }

  tb.prototype.attach = function(element) {
    this.contributors.push(new tc(this, element));
  }

  function _fetch(selector) {
    return [].slice.call(document.querySelectorAll(selector));
  }

  root.tiny = {
    'bindings' : {},
    'bind'     : function(selector, name, value) {
      var self = this;
      _fetch(selector).forEach(function(e) {
        if (!(name in self.bindings)) {
          self.bindings[name] = new tb(name);
        }
        self.bindings[name].attach(e);
      });
      return self.bindings[name];
    }
  }
  _fetch('[tiny-bind]').forEach(function(element) {
    var name = element.getAttribute('tiny-bind');
    if (!(name in tiny.bindings)) {
      tiny.bindings[name] = new tb(name);
    }
    tiny.bindings[name].attach(element);
  });

})(this);
