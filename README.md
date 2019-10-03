# lyt-spa
##### the single page application, designed to utilize [typescript](https://www.typescriptlang.org); [amd](https://requirejs.org); [vuejs](https://vuejs.org); [bootstrap](https://getbootstrap.com); [nodejs](https://nodejs.org) with [expressjs](https://expressjs.com/) or [.net core](https://github.com/dotnet/core)
## prologue
first thing you may notice, "why is everything lowercase?". well it's been my style for a few years now. it's part of my brand. i apologize for any difficulties reading this.
so in that… man, where do i start... i've been searching (for years) for a solution to a single page application framework (both client and host) that works to my desire.
several years back, i started to use [knockoutjs](https://knockoutjs.com/) to build my clients. i eventually mixed in **amd** (asynchronous module definition).
before es6, i started to appreciate javascript modules. i then tried [angularjs](https://angularjs.org/); [angular](https://angular.io/); [vuejs](https://vuejs.org/); [reactjs](https://reactjs.org/); ...

all great frameworks, but none implemented the way i wanted. i decided to write my own framework, and at the time, wanted to use it in projects for my employer.
that initiative came to a screeching halt when my employer wanted to claim ownership to the framework. dang! what to do...? i needed to use an existing framework in my employer's projects.

go back to angular... too much overhead for me. break out the react...? call me old school, i hated mixing html into code. i needed them separated. loved knockout, but i needed a more modern approach. so i chose vue.
can i make vue work for me? i had to figure this out.

##### what are my desires?

- i wanted to develop in **typescript** like angular.
- preferred to use amd browser loader like **[requirejs](https://requirejs.org/)**.
- i felt **ioc dependency injection** can be controlled by the browser's module loader, but i wanted an ioc container in my server code.
- i didn't want to maintain code to **register the application components**. components should be able to register themselves.
- component logic and **html templates** needed to be separated, but associated similar to angular components.
- intricacies i found in vue needed to be approached differently with typescript constructs.
- i wanted my **express request handlers** declared/defined similar to how **like .net core controller actions**.
- my express application needed to handle **clustering and child process communications**.

## introduction
i introduce to you **lyt-spa**. a comprehensive solution to single page web applications.
the repository [**github repository**](https://github.com/lytical/lyt-spa) contains projects for client api and your choice of either a nodejs or .net core server.
