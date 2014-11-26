tiny-bind.js
============
Two-way data binding for javascript.

### Simple Example
Create two variables called "firstName" and "lastName" and bind them to the input and span elements.
```html
<!-- bind the inner HTML of the span elements -->
<p><span tiny-html='firstName'></span> <span tiny-html='lastName'></span></p>
<!-- bind the value attribute of the inputs -->
<input type='text' tiny-value='firstName' value='John'>
<input type='text' tiny-value='lastName' value='Smith'>
```
Access to a few methods and properties
```js
/* initialize tiny */
tiny.init();
/* this will return all bindings: firstName and lastName */
console.log(tiny.bindings);
/* we can get the value of a binding */
console.log(tiny.bindings.firstName.get());
/* set the value of a binding */
tiny.bindings.firstName.set('Depski');
```

### Binding Types
There are a few basic bindings types:
* value: Bind the "value" attribute
* checked: Bind the "checked" attribute
* show*: Bind the "display" css property
* html*: Bind the inner HTML

*These are not two-way bindings, they will only reflect the changes in the property

### Subscribe to Changes
```js
/* subscribe a function to changes in the lastName */
tiny.bindings.lastName.subscribe(function(newValue) {
  console.log('The last name was changed to: ' + newValue);
});
```
### Create Bindings from Javscript
```html
<div id='spanGroup'>
  <span></span>
  <span></span>
  <span></span>
</div>
<input id='spanInput' type='text'>
```
```js
/* create a binding called "devilsNumber"
 * apply it to all three span elements
 * give it a starting value of 6 (optional)
 * this put a 6 in all three span elements */
tiny.bind('#spanGroup span', 'devilsNumber', 6);

/* We can also bind the text input to the
 * binding called "devilsNumber" as well */
tiny.bind('#spanInput', 'devilsNumber');
```

### Fire Change Event Manually
```js
/* this will notify all subscribers and contributors */
tiny.bindings.devilsNumber.trigger();
```
