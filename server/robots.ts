import { environment } from '../src/environments/environment';
import { Request, Response } from 'express';
import * as fs from 'fs';

export function robots(req: Request, res: Response) {
    try {
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

        return res.status(200).end();
    } catch (error) {
        return res.status(500).end();
    }
}
