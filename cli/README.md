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
the home page (when navigating to http://localhost:5000/) will display the `default` component located in [`default.ts`](/cli/default.ts) file.
if we examine this file, we can see how create components that you can route to.
```javascript
import { is_component } from 'component';

@is_component({
  html: 'default.html', // your html templates will always be in a separate file.
  route: ['/'] // routing is as simple as specifying one or more paths here.
})
export class _default {
}
```
the [`default.html`](/cli/default.html), along with all html template files, must have a single root element.
i usually make all routable component, html template files, have a root `<article></article>` element.
```
<article>
  <div class="card">
    <div class="card-header"></div>
    <div class="card-body"></div>
    <div class="card-footer"></div>
  </div>
</article>
```
you may choose whatever element you want as the root. create your own components and, add all (public) web resources, anywhere in the `cli` folder.
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