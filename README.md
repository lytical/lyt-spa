# lyt-spa
##### the single page application, designed to utilize [typescript](https://www.typescriptlang.org); [amd (requirejs)](https://requirejs.org); [vuejs](https://vuejs.org); [bootstrap](https://getbootstrap.com); [nodejs](https://nodejs.org) with [expressjs](https://expressjs.com/) or [.net core](https://github.com/dotnet/core)
## prologue
i've been searching (for years) for a solution to a single page application framework (both client and host) that works to my desire.
several years back, i started to use [knockoutjs](https://knockoutjs.com/) to build my clients. i eventually mixed in **amd** (asynchronous module definition).
before es6, i started to appreciate javascript modules. i then tried [angularjs](https://angularjs.org/); [angular](https://angular.io/); [vuejs](https://vuejs.org/); [reactjs](https://reactjs.org/); ...

all excellent frameworks, but none implemented the way i wanted. i experimented in writing my own framework, but didn't have the resources to complete it. what to do...? i needed to use an existing framework.

should i go back to angular... too much overhead for me. break out the react...? call me old school, i hated mixing html into code. i needed them separated for development. loved knockout, but i needed a more modern approach. so i chose vue.
can i make vue work for me? it has some quirks i personally didn't like, but i had to figure this out.
##### what are my desires?
- i wanted to develop in **typescript**.
- preferred to use browser amd loader like **[requirejs](https://requirejs.org/)**.
- i felt **ioc, dependency injection** can be controlled by the browser's module loader, but i wanted an ioc container in my host code.
- i didn't want to maintain code to **register the application components**. components should be able to "register themselves".
- i also didn't want to maintain code to **use(...)** all my **express middleware** request handlers. the handlers should be able to "'use' themselves".
- i wanted my **express request handlers** declared/defined similar to **.net core controller actions**.
- component logic and **html templates** needed to be separated, but associated similar to angular components.
- intricacies i found in vue needed to be approached differently with typescript constructs.
- my express application needed to handle **clustering and child process communications**.
- i wanted host-to-client messaging built in.
## introduction
lyt-spa is a comprehensive solution to single page web applications. the [repository](https://github.com/lytical/lyt-spa) contains projects for the client api and your choice of either a nodejs or a .net core host.
the client and node frameworks are written in typescript. the core framework is written in .net core 3.0.
### prerequisites
i designed and built the framework with (latest versions should work):
- [nodejs](https://nodejs.org/en/download/) version 11.7.0
- [.net core](https://dotnet.microsoft.com/download/dotnet-core/3.0) version 3.0
- [gulp-cli](https://gulpjs.com/) version 2.0.1
##### ide choices
- visual studio 2019 version 16.3.1 (for the solution file)
- visual studo code version 1.38.1

## getting started
1) fork the repository at <https://github.com/lytical/lyt-spa.git>.
2) clone your repository.
3) in the root folder, execute `npm install` to install packages. you may ignore the 'peer dependencies' warning messages.
4) build the projects in your ide of choice, or in the root folder execute `npm run-script build`.
5) launch your host of choice: in the root folder, either execute `npm run-script start-node`[^1] or `npm run-script start-core`.
6) lauch your browser and navigate to the host site http://localhost:5000/.

[^1]: the client is code by default for signalr websockets. running the *nodejs* host, requires client code changes. [read more...](/cli#configure-for-sockjs-node-server)

the following outlines relevant directories and files for getting started.

```
root
+- cli
   +- index.html
   +- default.html
   +- default.ts
+- node
+- core
```
### html template
the html template file `/cli/index.html` is the deafult document and contains the startup html for the application. the template defines a header; footer; and a main.
the main hosts a vue router.
### default page
the default landing page is rendered from the default component. a component consists of a `.ts` and a `.html` file. `/cli/deafult.ts` and `/cli/default.html` defines the default component.
### components
components are exported classes, decorated with `@is_component()`. the argument to this decorator specifies the html file used to render the compnoent.
```javascript
import { is_component } from 'component';

@is_component({
  html: 'my-component.html'
})
export class my_component {
}
```
when compiled, will generate and register a [vue component](https://vuejs.org/v2/guide/index.html#Composing-with-Components). you can read more about components [here...](/cli#components).
### host request handlers
request handlers can be implemented in core as controller actions or nodejs as decorated class methods.
#### .net core handlers
core handlers are implemented in controller classes.
```csharp
public class item_controller : ControllerBase
{
  [HttpGet("/item/sizes")]
  public string[] get_sizes() => new ["small", "medium", "large"];
}
```
you can read more about .net core controllers [here...](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-mvc-app/adding-controller?view=aspnetcore-3.0&tabs=visual-studio).
you can begin adding controller classes in the core project. i generally create a sub folder in the core project; add a service class; add my controller class; call my service class methods from my controller action methods.
#### nodejs handlers
request handlers implemented in the node project, are expored class member methods, decorated with `@api_request_handler()`. the argument to this decorator specifies the http method and optionally a request path.
```javascript
import { next_fn, request, response, api_request_handler } from '../mw';

export class item_handlers {
  @api_request_handler({ method: 'GET' })
  get_sizes(rqs: request, rsp: response, next: next_fn) {
    rsp.send(['small', 'medium', 'large']).end();
  }
}
```
when compiled, will generate and register an [express middleware](https://expressjs.com/en/4x/api.html#middleware-callback-function-examples) function. you can read more about handlers [here...](/node#request-handlers).