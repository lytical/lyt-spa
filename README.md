# lyt-spa
##### the single page application, designed to utilize [typescript](https://www.typescriptlang.org); [amd (requirejs)](https://requirejs.org); [vuejs](https://vuejs.org); [bootstrap](https://getbootstrap.com); [nodejs](https://nodejs.org) with [expressjs](https://expressjs.com/) or [.net core](https://github.com/dotnet/core)
## prologue
first thing you may notice, "why is everything lowercase?". well it's been my style for a few years now. it's part of my brand. i apologize for any difficulties reading this.
so in that… man, where do i start... i've been searching (for years) for a solution to a single page application framework (both client and host) that works to my desire.
several years back, i started to use [knockoutjs](https://knockoutjs.com/) to build my clients. i eventually mixed in **amd** (asynchronous module definition).
before es6, i started to appreciate javascript modules. i then tried [angularjs](https://angularjs.org/); [angular](https://angular.io/); [vuejs](https://vuejs.org/); [reactjs](https://reactjs.org/); ...

all excellent frameworks, but none implemented the way i wanted. i experimented in writing my own framework, but didn't have the resources to complete it. what to do...? i needed to use an existing framework.

should i go back to angular... too much overhead for me. break out the react...? call me old school, i hated mixing html into code. i needed them separated for development. loved knockout, but i needed a more modern approach. so i chose vue.
can i make vue work for me? it has some quirks i personally didn't like, but i had to figure this out.
##### what are my desires?
- i wanted to develop in **typescript**.
- preferred to use browser amd loader like **[requirejs](https://requirejs.org/)**.
- i felt **ioc dependency injection** can be controlled by the browser's module loader, but i wanted an ioc container in my server code.
- i didn't want to maintain code to **register the application components**. components should be able to "register themselves".
- i also didn't want to maintain code to **use(...)** all my **express middleware** request handlers. the handlers should be able to "'use' themselves".
- i wanted my **express request handlers** declared/defined similar to how **like .net core controller actions**.
- component logic and **html templates** needed to be separated, but associated similar to angular components.
- intricacies i found in vue needed to be approached differently with typescript constructs.
- my express application needed to handle **clustering and child process communications**.
- i wanted server-to-client messaging built in.
## introduction
lyt-spa is a comprehensive solution to single page web applications. the [repository](https://github.com/lytical/lyt-spa) contains projects for client api and your choice of either a nodejs or .net core server api.
## getting started
the first step is to fork the repository at <https://github.com/lytical/lyt-spa.git>.
### prerequisites
i designed and built the framework with:
- nodejs version 11.7.0
- typescript version 3.5.2
- .net core version 3.0
- visual studio 2019 version 16.3.1 (for the solution and projects)

choose your server, either node or core, and you may remove the other folder.
your directory structure should be either:

    root
    +- cli
    +- core
or

    root
    +- cli
    +- node

in the root folder execute `npm install`

## lyt-cli
[read more...](https://github.com/lytical/lyt-spa/tree/master/cli#lyt-spa-cli)

## lyt-node
[read more...](https://github.com/lytical/lyt-spa/tree/master/node#lyt-spa-node)

## lyt-core
[read more...](https://github.com/lytical/lyt-spa/tree/master/core#lyt-spa-core)
