import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import { AppServerModule } from '../src/main.server';
import { APP_BASE_HREF } from '@angular/common';

import * as express from 'express';

import { join } from 'path';
import { existsSync } from 'fs';

import { robotTxt } from './robots';
import { sitemap } from './sitemap';
import { environment } from '../src/environments/environment';

// const { getJSON } = require('./robots');
// const { sitemap } = require('./sitemap');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/vijay/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Sitemap
  // server.get('/generate/sitemap', sitemap);
  server.get('/generate/sitemap', (req, res, next) => {
    sitemap({
        host: environment.domain,
        path: environment.sitemapApi
    }).then((data: any) => {
        res.json(data);
    }, (error: any) => {
        next(error);
    });
  });


  // robot.txt
  server.get('/generate/robots', (req, res, next) => {
    robotTxt({
        host: environment.domain,
        path: environment.robotsApi
    }).then((data: any) => {
        res.json(data);
    }, (error: any) => {
        next(error);
    });
  });


  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from '../src/main.server';