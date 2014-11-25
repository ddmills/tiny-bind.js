(function(root) {
  function tl(binding, node) {
    this.binding = binding;
    this.node = node;
    var s = this;
    this.node.addEventListener('input', function() {
      s.binding.set(s.node.value);
    });
  }

  tl.prototype.notify = function(val) {
    if (this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
      this.node.value = val;
    // } else if () {
      // this.node.value = val;
    } else {
      this.node.innerHTML = val;
    }
  }

  function tb(name) {
    this.name = name;
    this.listeners = [];
  }

  tb.prototype.set = function(val) {
    this.val = val;
    this.notify(this.val);
  }

  tb.prototype.get = function() {
    return this.val;
  }

  tb.prototype.notify = function(val) {
    this.listeners.forEach(function(listener) {
      listener.notify(val);
    });
  }

  tb.prototype.attach = function(n) {
    var listener = new tl(this, n);
    this.listeners.push(listener);
  }

  var binds = {};
  var elements = [].slice.call(document.querySelectorAll('[tiny-bind]'));
  elements.forEach(function(i) {
    var name = i.getAttribute('tiny-bind');
    if (!(name in binds)) {
      binds[name] = new tb(name);
    }
    binds[name].attach(i);
  });
  root.tiny = {
    'bindings' : binds,
  }
})(this);