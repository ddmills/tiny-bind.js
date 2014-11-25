(function(root) {
  function tc(binding, node) {
    this.binding = binding;
    this.node = node;
    var s = this;
    this.node.addEventListener('input', function() {
      s.binding.set(s.node.value);
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

  tb.prototype.a = function(n) {
    var c = new tc(this, n);
    this.contributors.push(c);
  }

  root.tiny = {
    'bindings' : {},
    'bind'     : function(selector, name, value) {
      var elements = [].slice.call(document.querySelectorAll(selector));
      var t = this;
      elements.forEach(function(e) {
        if (!(name in t.bindings)) {
          t.bindings[name] = new tb(name);
        }
        t.bindings[name].a(e);
      });
    }
  }
  var e = [].slice.call(document.querySelectorAll('[tiny-bind]'));
  e.forEach(function(i) {
    var n = i.getAttribute('tiny-bind');
    if (!(n in tiny.bindings)) {
      tiny.bindings[n] = new tb(n);
    }
    tiny.bindings[n].a(i);
  });

})(this);
