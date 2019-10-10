/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

let cfg: RequireConfig = {
  baseUrl: '/',
  deps: [
    'bootstrap',
    'jquery',
    'vue',
    'vue-router',
    'html'
  ],
  map: {
    bootstrap: {
      'popper.js': 'popper'
    }
  },
  packages: [
    'app',
    {
      name: 'pubsub',
      main: 'sockjs'
    }
  ],
  paths: {
    '@aspnet/signalr': 'node_modules/@aspnet/signalr/dist/browser/signalr.min',
    bootstrap: 'node_modules/bootstrap/dist/js/bootstrap.min',
    'sockjs-client': 'node_modules/sockjs-client/dist/sockjs.min',
    popper: 'node_modules/popper.js/dist/umd/popper.min',
    jquery: 'node_modules/jquery/dist/jquery.min',
    rxjs: 'node_modules/rxjs/bundles/rxjs.umd.min',
    vue: 'node_modules/vue/dist/vue.min',
    'vue-router': 'node_modules/vue-router/dist/vue-router.min'
  }
};
requirejs.config(cfg);
require(
  ['app'],
  () => { },
  (err: Error) => alert(err.message));