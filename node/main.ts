/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _express from 'express';
import { mw_app } from './mw/app';
import { application } from './mw/request';
import { config } from './lib/config';
import spa_init from './spa';
import { app_service } from './app/svc';

let app = new mw_app();
spa_init.init(app, true);
app_service.init(app);

app.once('use-middleware', (express: application, deferred) => {
  if(express.svc!.get(config).dev === null) {
    express.use(_express.static('../cli'));
    express.use('/node_modules', _express.static('../node_modules'));
  }
  else {
    express.use('/node_modules', _express.static('node_modules'));
  }
});

app
  .run()
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });