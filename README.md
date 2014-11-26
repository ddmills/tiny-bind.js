tiny-bind.js
============
Simple two-way data binding for javascript.
### Binding Types
There are a few basic bindings types:
* value: Bind the "value" attribute
* checked: Bind the "checked" attribute
* show<sup>†</sup>: Bind the "display" css property (uses 'block')
* showInline<sup>†</sup>: Bind the "display" css property (uses 'inline-block')
* html<sup>†</sup>: Bind the inner HTML

<sup>†</sup>*These are not two-way bindings, they will only reflect the changes in the property*

### Simple Example
Create two bindings called "firstName" and "lastName" and bind them to the input and span elements.
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

### Hide and Show Elements
We can button that is visible only when a binding is true
```html
<button tiny-show='showButton'>Continue</button>
```
This value can be controlled from a checkbox property:
```html
<input type='checkbox' tiny-checked='showButton'> Show the button!
```


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
### Change the Prefix
The default prefix is "tiny-", this can be changed.
```html
<p DOGhtml='location'></p>
```
The prefix is sent on the init method:
```js
tiny.init('DOG');
```
### Fire Change Event Manually
```js
/* this will notify all subscribers and contributors */
tiny.bindings.devilsNumber.trigger();
```
