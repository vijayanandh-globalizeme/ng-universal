import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import * as fs from 'fs';



import { environment } from './src/environments/environment';
import { Request, Response } from 'express';

import { SitemapStream } from 'sitemap';
import { createGzip } from 'zlib';

const { Readable } = require('stream');
const { streamToPromise } = require('sitemap');


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
  server.get('/config/sitemap', sitemap);

  // robot.txt
  server.get('/config/robot', robotsTxt);


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

async function robotsTxt(req: Request, res: Response) {
  const https = require('http');
  https.get('http://127.0.0.1:8000/api/v1/robots', (response: any) => {
    let data:any = [];
    
    response.on('data', (chunk: any) => {
      data.push(chunk);
    });
    
    response.on('end', () => {
      const users = JSON.parse(Buffer.concat(data).toString());
      fs.writeFile('dist/vijay/browser/robots.txt', users.data, function(err) {
          if(err && err != null){
            res.status(500).end();
          }
          res.status(200).end();
      });
    });
  });

  res.status(200).end();
}

async function sitemap(req: Request, res: Response) {
  // res.header('Content-Type', 'application/xml');
  // res.header('Content-Encoding', 'gzip');

  try {

    let changefreq = 'weekly';
    let links = [
      { url: '', changefreq, priority: 1 },
      { url: 'aboutus', changefreq, priority: 0.9 },
      { url: 'blog', changefreq },
      { url: 'login', changefreq },
      { url: 'register', changefreq },
    ];

    // Additionally, you can do database query and add more dynamic URLs to the "links" array.

    const stream = new SitemapStream({ hostname: 'http://localhost:4200', lastmodDateOnly: true })
    return streamToPromise(Readable.from(links).pipe(stream)).then((data: any) => {
     console.log(data)
     console.log("s1");
     fs.writeFile('dist/vijay/browser/sitemap.xml', data, function(err) {
      console.log("s2");
      if(err && err != null){console.log("s3");
        res.status(500).end();
      }console.log("s4");
      res.status(200).end();
  });

      stream.end();
      return res.status(200).send()
    });

  } catch (error) {
    return res.status(500).end();
  }

//     var https = require('https');
//     var concat = require('concat-stream');
//     var xml2js = require('xml2js');
//     var parser = new xml2js.Parser();

//     https.get('https://auctionhouse-development.s3.eu-west-2.amazonaws.com/server/sitemap.xml', function(resp: any) {

//     resp.on('error', function(err: any) {
//       console.log('Error while reading', err);
//     });

//     resp.pipe(concat(function(buffer: any) {
//       // var str = buffer.toString();
//       console.log(buffer)
//       // parser.parseString(str, function(err:any, result: any) {
//       //   console.log('Finished parsing:', err, result);
//       // });
//     }));

// });



    // let xml_content = [
    //   '<?xml version="1.0" encoding="UTF-8"?>',
    //   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    //   '  <url>',
    //   '    <loc>http://www.example.com/</loc>',
    //   '    <lastmod>2005-01-01</lastmod>',
    //   '  </url>',
    //   '</urlset>'
    // ]
    // res.set('Content-Type', 'text/xml')
    // res.send(xml_content.join('\n'))




    // var request = require('request');

    // req.pipe(request('https://auctionhouse-development.s3.eu-west-2.amazonaws.com/server/sitemap.xml')).pipe(res);

    // const fetch   = require('node-fetch');
    // fetch('https://auctionhouse-development.s3.eu-west-2.amazonaws.com/server/sitemap.xml')
    // .then((data:any) => {
    //     res.send({ data });
    // })
    // .catch((err: any) => {
    //     res.send(err);
    // });

    // // const http = require("http");
    // const file = fs.createWriteStream("sitemap.xml");
    // res.pipe(file);

    // res.sendFile('https://auctionhouse-development.s3.eu-west-2.amazonaws.com/server/sitemap.xml');

    // const sitemapStream = new SitemapStream({
    //   // This is required because we will be adding sitemap entries using relative URLs
    //   hostname: "http://localhost:4200"
    // });
    // const pipeline = sitemapStream.pipe(createGzip());

    // let changefreq = EnumChangefreq.DAILY;
    // let routes = [
    //   { url: '', changefreq, priority: 1, updatedAt: "2023-11-02T05:42:00.000Z" },
    //   { url: 'aboutus', changefreq, priority: 0.9, updatedAt: "2023-11-02T05:42:00.000Z" },
    //   { url: 'blog', changefreq, priority: 1, updatedAt: "2023-11-02T05:42:00.000Z" },
    //   { url: 'login', changefreq, priority: 1, updatedAt: "2023-11-02T05:42:00.000Z" },
    //   { url: 'register', changefreq, priority: 1, updatedAt: "2023-11-02T05:42:00.000Z" },  
    // ];

    // for (const entry of routes) {
    //   sitemapStream.write({
    //     changefreq: EnumChangefreq.MONTHLY,
    //     lastmod: entry.updatedAt,
    //     priority: entry.priority,
    //     url: entry.url,
    //   } as SitemapItem);
    // }

    // // Stream write the response
    // sitemapStream.end();
    // pipeline.pipe(res).on('error', (error: Error) => {
    //   throw error;
    // });
  //   res.status(200).end();
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).end();
  // }
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

export * from './src/main.server';
