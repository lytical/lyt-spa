# lyt-spa-cli
the single page application framework, designed for productivity and rapid development.
designed to utilize [typescript](https://www.typescriptlang.org); [amd (requirejs)](https://requirejs.org); [vuejs](https://vuejs.org); [bootstrap](https://getbootstrap.com); [nodejs](https://nodejs.org) with [expressjs](https://expressjs.com/) or [.net core](https://github.com/dotnet/core)

**note**: this documentation assumes you have knowledge of the *vuejs* framework. you can familiarize yourself with the framework [here](https://vuejs.org/v2/guide/index.html).

## introduction
this project is one of three (3) projects of [lyt-spa](/#lyt-spa), and concerns the client-side (front end) implementation of the application.
vuejs is used to render and control the front end.
[vue components](https://vuejs.org/v2/guide/#Composing-with-Components) are primarily used, but there is support for [custom directives](/).
if you're not familiar with vuejs, i recommend you [get familiar with their framework](https://vuejs.org/v2/guide/).
## getting started
the single page application uses a single [`index.html`](/cli/index.html) file. this file contains the common html elements used for all routable pages, and used to 'bootstrap' the application.
the home page (when navigating to http://localhost:5000/) will display the `default` component implemented in the [`default.ts`](/cli/default.ts) file.
if we examine this file, we can see how to create a component, that can be routed to.
```javascript
import { is_component } from 'component';

@is_component({
  html: 'default.html', // your html templates will always be in a separate file.
  route: ['/'] // routing is as simple as specifying one or more paths here.
})
export class _default {
}
```
the [`default.html`](/cli/default.html), along with **all** html template files, must have a single root element.
```html
<article>
  <div class="card">
    <div class="card-header"></div>
    <div class="card-body"></div>
    <div class="card-footer"></div>
  </div>
</article>
```
i usually make all **routable** component, html template files, have a root `<article></article>` element.
i also use [bootstrap](https://getbootstrap.com/) in my markup, but this is not a requirement.
you may change existing html templates to use something else.
you may choose whatever element you want as the root.
create your components and, add all (public) web resources, anywhere in the `cli` folder.
## components
components are fundamental user-interface building blocks for the application.
a component consists of an implementation file (`*.ts`) and a html template file (`*.html`).
#### creating components with @is_component()
a component is decorated with `@is_component()`.

**usage**: `@is_component({ html: <path>[, ...] }) export class <class name> {}`

the decoration requires an object argument, defined as follows:

| property | type | usage | value |
| --- | --- | --- | --- |
| html | string | required | path to the html template file. |
| name | string | optional | the name of the component. the component's path will infer the name, if not specified. |
| route | string[] | optional | indicates the component as routable and specifies the route path(s). |
| keep_alive | true | optional | indicates the component's state should be saved when the component is routed away from. read more about it [here](https://router.vuejs.org/api/#router-view). |

the following is an example of how to use the `@is_component()` decorator and how to implement a component:
```javascript
// product/catalog.ts
import { is_component } from 'component';

@is_component({
  html: 'product/catalog.html', // this required for all components.
  name: 'app-product-catalog', // optional name 
  route: ['/product/catalog'], // display this component when navigated to `/product/catalog`.
  keep_alive: true // optionally indicates to save the state before routing away from, to be later reuse.
})
export class product_catalog {
}
```
i use `keep_alive` on index pages. use the component in the html template as:
```html
<div>
  <app-product-catalog></app-product-catalog>
</div>
```
#### intellisense using **component interface**
a component can optionally implement the `component` interface.
this is especially helpful with 'intellisense / code complete' functionality in your ide.
```javascript
import { component, is_component } from 'component';

@is_component({
  html: 'my-template.html'
})
export class my_component implements component {
}
```
#### one component per file
components, **not** explicitly decorated with a `name`, must be implemented in separate files.
this is important because, it's the way the application can infer the component's name.
take the following directory structure for example:
```
cli
+- default.ts
+- product
|  +- catalog.ts
+- customer
|  +- directory.ts
|  +- purchases.ts
```
the individual components defined in each `*.ts` (not decorated with a `name`), will infer its name based on its location in the directory structure.
so respectively, component names for the above (if all are not decorated with a `name`) infer the names:
- default
- product-catalog
- customer-directory
- customer-purchases

using these components in your html markup is as simple as:
```html
<!-- my-template.html -->
<div>
  <default></default>
  <product-catalog></product-catalog>
  <div is="customer-directory"></div>
  <div is="customer-purchases"></div>
</div>
...
```
if you must implement multiple components in a file, only one component can, not have a decorated `name`.
i prefer to implement components in thier own files and have thier names inferred by the application.
this allows me to easily identify a component's implementation file, by its name.
#### change tracking using @data()
you can indicate what data members (class properties) will participate in vue's change tracking (reactivity). [read more...](https://vuejs.org/v2/guide/instance.html#Data-and-Methods)
vue requires component's `data()` method to return an object containing these members.
use the `@data()` decorator to indicate what properties are to be tracked.
decorate the data member(s) of your class and optionally specify an initial value.

**usage**: `@data([value]) <member>: <data type>;`

the data member's value will be `null` if a the decorator's value argument is omitted.
the following is an example of how to use the `@data()` decorator:
```html
<!-- my-template.html -->
<form role="form">
  <input type="number" v-model="id"/>
  <input type="text" autocomplete="name" v-model="name"/>
  <button type="submit">submit</button>
</form>
```
```javascript
import { data, is_component } from 'component';

@is_component({
  html: 'my-template.html'
})
export class my_component implements component {
  @data(123) id!: number;
  @data('lytical') name!: string;
}
```
although you can implement a `data()` method in your component, **do not** have both, a `data()` method and `@data()` decorated data members, in the component.

you may further initialize the instance data if you implement an `init_data()` method in your component.
```javascript
import { data, is_component } from 'component';

@is_component({
  html: 'my-template.html'
})
export class my_component implements component {
  init_data(data: any) {
    // 'this' references the component instance.
    data.id = 123;
    data.name = 'lytical';
  }

  @data() id!: number;
  @data() name!: string;
}
```
#### passing data to child components using @property()
a component can pass data to child components [using props](https://vuejs.org/v2/guide/components.html#Passing-Data-to-Child-Components-with-Props).
you can add a child component data member to the list of *props* by decorating the member with `@property()`.
once decorated, the child component's data member can be set by the parent html template.
this decorator takes an optional argument that indicates what type of property it is.

**usage**: `@property([type]) <member>: <data type>;` [read more about type checks](https://vuejs.org/v2/guide/components-props.html#Type-Checks)
```html
<!-- child.html -->
<div :title="title"></div>
```
```javascript
// child.ts
import { property, is_component } from 'component';

@is_component({
  html: 'child.html'
})
export class child_component implements component {
  @property(String) title?: string;
}
```
```html
<!-- parent.html -->
<div>
  <child title="title to past to child component"></child>
</div>
```
#### computed properties
components implement [vue computed properties](https://vuejs.org/v2/guide/computed.html) with `getter` accessor methods.
in the following example, the `full_name` (read only) data member will reflect changes when either the `first_name` or the `last_name` data member changes.
```html
<!-- my-template.html -->
<div>
  <form>
    <input type="text" autocomplete="given-name" v-model="first_name"/>
    <input type="text" autocomplete="family-name" v-model="last_name"/>
  </form>
  <span>your full name is {{ full_name }}</span>
</div>
```
```javascript
import { component, is_component } from 'component';

@is_component({
  html: 'my-template.html'
})
export class my_component implements component {
  get full_name() {
    return `${this.first_name} ${this.last_name}`;
  }

  @data() first_name!: string;
  @data() last_name!: string;
}
```
#### watchers
components implement [vue watchers](https://vuejs.org/v2/guide/computed.html#Watchers) with `setter` accessor methods.
in the following example, the `message` data member will be updated when the `name` data member changes.
```html
<!-- my-template.html -->
<div>
  <form>
    <input type="text" autocomplete="name" v-model="name"/>
  </form>
  <span>{{ message }}</span>
</div>
```
```javascript
import { component, is_component } from 'component';

@is_component({
  html: 'my-template.html'
})
export class my_component implements component {
  set name(value: string) {
    this.message = `hello ${value}!`;
  }

  @data() name!: string;
  @data() message!: string;
}
```
#### event handlers
all (non vue standard) methods in a component are available as [event handlers](https://vuejs.org/v2/guide/events.html).
```html
<!-- template.html -->
<div>
  <button type="button" @click="send($event)">send</button>
</div>
```
```javascript
import { is_component } from 'component';

@is_component({
  html: 'template.html'
})
export class my_component {
  send(event: MouseEvent) {
    // todo: perform send here...
  }
}
```
## custom directives
developing [custom vue directives](https://vuejs.org/v2/guide/custom-directive.html) are as simple as decorating an exported class with `@is_directive`.

**usage**: `@is_directive([name]) export class <class name> {}`

the directive takes an optional string, indicating its name.
the directive's path will infer the name (based on the path of the implementation file), if not specified.

the following is an example of a custom directive.
```javascript
import { is_directive } from 'directive';

@is_directive('focus')
export class focus_directive {
  inserted(el: Element) {
    el.focus();
  }
}
```
```html
<!-- my-template.html -->
<form>
  <input type="text" v-focus />
</form>
```
#### intellisense using **directive interface**
a directive can optionally implement the `directive` interface.
this is especially helpful with 'intellisense / code complete' functionality in your ide.
```javascript
import { directive, is_directive } from 'directive';

@is_directive('focus')
export class focus_directive implements directive {
  inserted(el: Element) {
    el.focus();
  }
}
```
## forms
although, not necessary to use, the form components can increase productivity.
#### form-item component
the most useful component by far, is the `form-item` component.
it wraps the contained form control in a markup, and provides a visual representation of the control's state, that is consistent throughout the application.

|form-item property|description|
|---|---|
|caption|the html to display in the item's `<label></label>`.|
|id|the enclosed form control id.|
|invalid_msg|optional message to display when the form control fails validation.|

the states of a form-item and its element's *class* attribute can be one or more of the following:

|form-item state|description|class name|
|---|---|---|
|is_touched|true when the user has visited the control.|fi-touched|
|is_dirty|true when the user changed the value of the control.|fi-dirty|
|is_valid|true when the control passes form validation.|fi-valid|
|is_pristine|true when the user has not changed the value of the control.|fi-pristine|
|is_invalid|true when the control failes form validation.|fi-invalid|
|is_untouched|true when the user has never visited the control.|fi-untouched|

place the form control within the `<form-item></form-item>` elements.

the following is a typical implementation of a input form.
```html
<form role="form">
  <form-item title="your full name." id="name" caption="your name:" invalid_msg="this is a required field.">
    <input class="form-control" id="name" type="text" required placeholder="(required)" v-model="name" />
  </form-item>
  <form-item title="your email address." id="email" caption="email address:" invalid_msg="this is a required field.">
    <input class="form-control" id="email" type="email" required placeholder="(required)" v-model="email" />
  </form-item>
  <button class="btn btn-primary" type="submit">submit</button>
</form>
```
#### form-check component
the `form-check` component extends the [`form-item`](#form-item-component) component for visual representation of `checkbox` or `radio` input controls.
```html
<form-check title="can we contact you?" id="can-contact" caption="please contact me">
  <input id="can-contact" type="checkbox" />
</form-check>
```
#### v-form-status directive
the `form-status` directive will update the applied element's *class list* according to the state of form controls that are children of a parent element.
the parent element can either be the applied, or the element identified by the *selector* argument of the directive.
a parent form control must be enclosed in a [form-item](#form-item-component) component.

**usage**: <*element* v-form-status[:selector] />

the **selector** is optional and identifies the parent element of the form controls to track state changes.
if the selector argument is omitted, then the applied element is the parent element.

the applied element's *class* attribute, can be one or more of the following:

|element class name|description|
|---|---|
|fi-touched|when the user has visited any parent control.|
|fi-untouched|when the user has not visited any parent control.|
|fi-dirty|when the user changed the value of any parent control.|
|fi-pristine|when the user has not changed the value of any parent control.|
|fi-valid|when all parent controls pass form validation.|
|fi-invalid|when any parent control failes form validation.|
|fi-touched-all|when the user has visited all parent control.|
|fi-dirty-all|when the user changed the value of all parent control.|
|fi-invalid-all|when all parent control failes form validation.|

for example, this directive is helpful to style a nav-item (tab; pill; ...) based on the state of associated form.
```css
/*my-style.css*/
div.alert-danger.show-when-invalid.fi-valid-all,
div.alert-danger.show-when-invalid.fi-untouched-all {
  display: none;
}
div.alert-danger.show-when-invalid.fi-invalid.fi-touched {
  display: initial;
}
```
```html
<!-- my-template.html -->
<div class="alert alert-danger show-when-invalid" v-form-status:#my-form>please correct form errors.</div>
<form id="my-form">
  <input type="text" required />
</form>
```

## controls
todo: ...

## popovers
todo: ...

## websocket pubsub messaging
websockets pubsub messaging support for [sockjs](https://www.npmjs.com/package/sockjs) or [signalr](https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-3.0) is built in.
server code can send messages to all web clients, or to a specific client. depending on your server configuration, you can configure the client to receive these message.
#### configure for sockjs (node server)
[sockjs-client](https://www.npmjs.com/package/sockjs-client) is used with the node host. when using the node host, configure the client as follows:
1) in the [tsconfig.json](/cli/tsconfig.json) file, change `compilerOptions.paths.pubsub...` to **pubsub/sockjs**.
```json
{
  "compilerOptions": {
  "paths": {
    "pubsub": [ "pubsub/sockjs" ]
  }
}
```
2) in the [main.ts]() file, change the requirejs configuration for `packages, name="pubsub"` to **sockjs**.
```javascript
let cfg: RequireConfig = {
  packages: [
    {
      name: 'pubsub',
      main: 'sockjs'
    }
  ]
};
```
#### configure for signalr (core server)
when using the core host, configure the client to use the [@aspnet/signalr](https://www.npmjs.com/package/@aspnet/signalr) package as follows:
1) in the [tsconfig.json](/cli/tsconfig.json) file, change `compilerOptions.paths.pubsub...` to **pubsub/signalr**.
```json
{
  "compilerOptions": {
  "paths": {
    "pubsub": [ "pubsub/signalr" ]
  }
}
```
2) in the [main.ts]() file, change the requirejs configuration for `packages, name="pubsub"` to **signalr**.
```javascript
let cfg: RequireConfig = {
  packages: [
    {
      name: 'pubsub',
      main: 'signalr'
    }
  ]
};
```