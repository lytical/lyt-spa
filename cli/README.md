# lyt-spa-cli
the single page application framework, designed for productivity and rapid development.
designed to utilize [typescript](https://www.typescriptlang.org); [amd (requirejs)](https://requirejs.org); [vuejs](https://vuejs.org); [bootstrap](https://getbootstrap.com); [nodejs](https://nodejs.org) with [expressjs](https://expressjs.com/) or [.net core](https://github.com/dotnet/core)
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
```
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
#### @is_component()
a component is decorated with `@is_component()`.

**usage**: `@is_component({ html: <path>, ... }) export class <class name> {}`

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
#### component interface
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
- customer-purchages

using these components in your html markup is as simple as:
```html
<!-- my-template.html -->
<default></default>
<product-catalog></product-catalog>
<div is="customer-directory"></div>
<div is="customer-purchages"></div>
...
```
if you must implement multiple components in a file, only one component can, not have a decorated `name`.
i prefer to implement components in their own files and have thier names infered by the application.
this allows me to easily identify a component's implementation file, by its name.
#### @data()
you can indicate what data members (class properties) will participate in vue's change tracking (reactivity). [read more...](https://vuejs.org/v2/guide/instance.html#Data-and-Methods)
vue requires component's `data()` method to return an object containing these members.
utilize the `@data()` decorator to indicate what properties are to be tracked.
decorate the data member(s) of your class and optionally specify an initial *primative* value.

**usage**: `@data([value]) <member>: <data type>;`

the following is an example of how to use the `@data()` decorator:
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
although you can implement a `data()` method in your component, **do not** have both a `data()` method and `@data()` decorated data members, in the component.

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


## websocket pubsub messaging
websockets pubsub messaging support for [sockjs](https://www.npmjs.com/package/sockjs) or [signalr](https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-3.0) is built in.
server code can send messages to all web clients, or to a specific client. depending on your server configuration, you can configure the client to receive these message.
### configure for sockjs (node server)
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
### configure for signalr (core server)
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