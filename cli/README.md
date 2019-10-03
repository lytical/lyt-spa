# lyt-spa-cli

## websocket pubsub messaging
websockets pubsub messaging support for [sockjs](https://www.npmjs.com/package/sockjs) or [signalr](https://docs.microsoft.com/en-us/aspnet/core/signalr/introduction?view=aspnetcore-3.0) is built in.
server code can send messages to all web clients, or to a specific client. depending on your server configuration, you can configure the client to receive these message.
### configure for sockjs (node server)
[sockjs-client](https://www.npmjs.com/package/sockjs-client) is used with the node server. when using the node server, configure the client as follows:
1) in the [typescript.json]() file, change `compilerOptions.paths.pubsub...` to **pubsub/sockjs**.
```json
{
  "compilerOptions": {
  ...
  "paths": {
    "pubsub": [ "pubsub/sockjs" ]
  }
  ...
}
```
2) in the [main.ts]() file, change the requirejs configuration for `packages, name="pubsub"` to **sockjs**.
```javascript
let cfg: RequireConfig = {
  ...
  packages: [
    {
      name: 'pubsub',
      main: 'sockjs'
    }
  ],
  ...
};
```
### configure for signalr (core server)
when using the core server, configure the client to use the [@aspnet/signalr](https://www.npmjs.com/package/@aspnet/signalr) package as follows:
1) in the [typescript.json]() file, change `compilerOptions.paths.pubsub...` to **pubsub/signalr**.
```json
{
  "compilerOptions": {
  ...
  "paths": {
    "pubsub": [ "pubsub/signalr" ]
  }
  ...
}
```
2) in the [main.ts]() file, change the requirejs configuration for `packages, name="pubsub"` to **signalr**.
```javascript
let cfg: RequireConfig = {
  ...
  packages: [
    {
      name: 'pubsub',
      main: 'signalr'
    }
  ],
  ...
};
```