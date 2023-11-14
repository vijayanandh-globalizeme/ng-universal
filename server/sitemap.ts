
import { environment } from '../src/environments/environment';
import { SitemapStream } from 'sitemap';

import * as fs from 'fs';

const { Readable } = require('stream');
const { streamToPromise } = require('sitemap');

let http = require("http"),
    https = require("https");

/**
* sitemap:  REST get request returning JSON object(s)
* @param options: http options object
// */
export function sitemap(options: any) {
    let reqHandler = +options.port === 443 ? https : http;

    return new Promise((resolve, reject) => {
        let request = reqHandler.get(options.host+options.path, (response: any) => {
            let data: any = []; 
            response.setEncoding('utf8');

            response.on('data', function (chunk: any) {
                data = chunk;
            });

            response.on('end', () => {
                if(data && data != ""){
                    data = JSON.parse(data);
                    if(data?.sitemap){
                        let links = data?.sitemap.map(function(elem: any){
                            elem.priority = parseFloat(elem.priority);
                            if(elem.slug_name && elem.slug_name != null){
                                elem.url = elem.slug_name+elem.url;
                            }
                            return elem;
                        });
                        links.unshift({
                            url: "",
                            changefreq: "monthly",
                            priority: 1.0
                        });
                        try {
                            const stream = new SitemapStream({ hostname: environment.domain, lastmodDateOnly: true })
                            return streamToPromise(Readable.from(links).pipe(stream)).then((sitemapData: any) => {
                                fs.writeFile(environment.siteMap, sitemapData, function(err) {
                                    if(err && err != null){
                                        reject(err);
                                    }
                                    resolve({
                                        statusCode: response.statusCode,
                                        message: "Sitemap file has updated"
                                    });
                                });
                            });
                        } catch (err) {
                            reject(err);
                        }
                    }else{
                        request.end();
                    }
                }
            });
        });

        request.on('error', (err: any) => {
            reject(err);
        });

        request.end();
    });
}    

