tiny-bind.js
============

lightweight two-way data binding for javascript

tiny-bind.min.js:
```js
!function(n){function t(n,t){this.binding=n,this.node=t;var i=this;this.node.addEventListener("input",function(){i.binding.set(i.node.value)})}function i(n){this.name=n,this.contributors=[],this.subscribers=[]}function o(n){return[].slice.call(document.querySelectorAll(n))}t.prototype.notify=function(n){"INPUT"==this.node.nodeName||"TEXTAREA"==this.node.nodeName?this.node.value=n:this.node.innerHTML=n},i.prototype.set=function(n){this.val=n,this.notify(this.val)},i.prototype.get=function(){return this.val},i.prototype.notify=function(n){this.contributors.forEach(function(t){t.notify(n)}),this.subscribers.forEach(function(t){t(n)})},i.prototype.subscribe=function(n){this.subscribers.push(n)},i.prototype.attach=function(n){this.contributors.push(new t(this,n))},n.tiny={bindings:{},bind:function(n,t){var s=this;return o(n).forEach(function(n){t in s.bindings||(s.bindings[t]=new i(t)),s.bindings[t].attach(n)}),s.bindings[t]}},o("[tiny-bind]").forEach(function(n){var t=n.getAttribute("tiny-bind");t in tiny.bindings||(tiny.bindings[t]=new i(t)),tiny.bindings[t].attach(n)})}(this);
```
