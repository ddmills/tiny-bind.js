(function(root) {
  var handlers = {
    'html': function(val) {
      if (this.attrString == '$index' || this.attrString == '$key') {
        this.node.innerHTML = this.binding.name;
      } else {
        if (typeof(val) == 'object') {
          this.node.innerHTML = JSON.stringify(val);
        } else {
          this.node.innerHTML = val;
        }
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
      var len = 0;
      var keys = [];
      // console.log('----');
      for (key in val) {
        if (val.hasOwnProperty(key)) {
          s.node.innerHTML += s.template;
          // len++;
          keys.push(key);
        }
      }
      var children = s.node.getElementsByTagName('*');
      for (var i = 0; i < keys.length; i++) {
        for (var j = 0; j < s.templateSize; j++) {
          var child = children[i * s.templateSize + j];
          contribTypes.forEach(function(type) {
            if (child.hasAttribute(tiny.prefix + type)) {
              var attrString = child.getAttribute(tiny.prefix + type);
              // console.log(attrString);
              var bind = parseAttr(attrString, s.binding, i);
              // console.log(bind);
              bind.attach(type, attrString, child);
            }
          });
        }

      }
        // console.log(val);
        // if (val.hasOwnProperty(key)) {
        //
        //   for (var i = len; i < len + s.templateSize; i++) {
        //     var children = s.node.getElementsByTagName('*');
        //     contribTypes.forEach(function(type) {
        //       if (children[i].hasAttribute(tiny.prefix + type)) {
        //         var attrString = children[i].getAttribute(tiny.prefix + type);
        //         var bind = parseAttr(attrString, s.binding, key);
        //         if (bind) {
        //           bind.attach(type, attrString, children[i]);
        //         }
        //       }
        //     });
        //   }
        //   len += s.templateSize;
        // }
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
      tc.templateSize = tc.node.getElementsByTagName('*').length;
      tc.template = tc.node.innerHTML;
      tc.node.innerHTML = '';
    }
  }

  var contribTypes = ['for', 'html', 'value', 'show', 'showInline', 'checked'];

  /* Contributor */
  function tc(binding, type, node, attrString) {
    this.binding     = binding;
    this.node        = node;
    this.attrString  = attrString;
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
    /* todo: remove old keys (esp. for arrays) */
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
          this.context.trigger();
        }
      }
    }
  }

  tb.prototype.value = function() {
    if (Object.keys(this.bindings).length > 0) {
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
    if (this.context) {
      this.context.trigger();
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

  tb.prototype.attach = function(type, attrString, element) {
    var cont = new tc(this, type, element, attrString);
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
      } else if (name == '$index' || name == '$key' || name == '$value') {
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
          binding.attach(type, attrString, element);
        });
      });
    },
    'new': function(name) { return new tb(name, tiny.root); },
    'set': function(name, value) {
      var binding = parseAttr(name);
      binding.set(value);
    },
    'get': function(attrString) {
      return parseAttr(attrString);
    }
  }
})(this);
