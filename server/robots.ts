import { environment } from '../src/environments/environment';
import * as fs from 'fs';

let http = require("http"),
    https = require("https");

/**
* robotTxt:  REST get request returning JSON object(s)
* @param options: http options object
// */

export function robotTxt (options: any) {
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
                    if(data?.robots?.data){
                        try {
                            fs.writeFile(environment.robotsTxt, data.robots.data, function(err) {
                                if(err && err != null){
                                    reject(err);
                                }
                                resolve({
                                    statusCode: response.statusCode,
                                    message: "Robots txt file has updated"
                                });
                            });
                        } catch (err) {
                            reject(err);
                        }
                    }
                }else{
                    request.end();
                }
            });
        });

        request.on('error', (err: any) => {
            reject(err);
        });

        request.end();
    });
}