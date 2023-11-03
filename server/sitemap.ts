import { SitemapStream } from 'sitemap';
import { Request, Response } from 'express';

import * as fs from 'fs';

const { Readable } = require('stream');
const { streamToPromise } = require('sitemap');

export function sitemap(req: Request, res: Response) {
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
            fs.writeFile('dist/vijay/browser/sitemap.xml', data, function(err) {
            if(err && err != null){console.log("s3");
                res.status(500).end();
            }
            res.status(200).end();
        });

        stream.end();
        return res.status(200).send()
        });

    } catch (error) {
        return res.status(500).end();
    }
}
