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
Create some variables and bind them to the input and span elements.
```html
<!-- bind the inner HTML of the span elements -->
<p><span tiny-html='name.first'></span> <span tiny-html='name.last'></span></p>
<!-- bind the value attribute of the inputs -->
<input type='text' tiny-value='name.first' value='John'>
<input type='text' tiny-value='name.last' value='Smith'>
```
Access to a few methods and properties
```js
/* initialize tiny */
tiny.init();

/* get a bind object */
var nameBinding = tiny.get('name');

/* we can get the value of a binding
 * Returns
 *  { 'first': 'John', 
 *    'last' : 'Smith' } */
nameBinding.value();

/* set the value of name.last to "Depski" */
nameBinding.get('last').set('Depski');
/* another way to do it */
tiny.set('name.last', 'Depski');
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

### For Loops
```html
<div tiny-for='contacts'>
  <p>
    <span tiny-html='$index'></span>.)
    <span tiny-html='$value.name.first'></span>
    <span tiny-html='$value.name.last'></span>
    is
    <span tiny-html='$value.age'></span> years old.
  </p>
  <p>
    Here is some JSON:
    <span tiny-html='$value.name'></span>
  </p>
  <p>
    Get access to the root variable:
    <span tiny-html='$root.sweg'></span>
  </p>
</div>
```
```js
tiny.set('contacts', [{
  'name': {
    'first': 'Abe',
    'last': 'Lincoln'
  },
  'age': 6
},{
  'name': {
    'first': 'George',
    'last': 'Bush'
  },
  'age': 59
},{
  'name': {
    'first': 'Aaron',
    'last': 'Rodgers'
  },
  'age': 32
}]);
tiny.set('sweg', 'so much');
```
This will output:


0.) Abe Lincoln is 6 years old.

Here is some JSON: {"first":"Abe","last":"Lincoln"}

Get access to the root variable: so much

1.) George Bush is 59 years old.

Here is some JSON: {"first":"George","last":"Bush"}

Get access to the root variable: so much

2.) Aaron Rodgers is 32 years old.

Here is some JSON: {"first":"Aaron","last":"Rodgers"}

Get access to the root variable: so much



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
