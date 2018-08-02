/**
 * @file HTTP request
 * @author zdying
 */
'use strict';

const http = require('http');
const url = require('url');
const qs = require('querystring');

module.exports = {
  async request(options) {
    let data = '';
    let json = false;
    let reqOpts = {};
    if (typeof options === 'string') {
      reqOpts = url.parse(uri);
    } else {
      let {method="GET", url: uri} = options;
      let data = options.data || {};

      json = options.json;

      if (method && method.toUpperCase() === 'POST') {
        if (json) {
          data = JSON.stringify(data);
        } else {
          data = qs.stringify(data);
        }
      } else {
        data = qs.stringify(data);
        uri += options.url.indexOf('?') !== -1 ? '&' + data : '?' + data;
      }

      reqOpts = url.parse(uri);

      ['headers', 'timeout', 'setHost'].forEach(key => {
        if (options[key]) {
          reqOpts[key] = options[key];
        }
      });
    }

    return new Promise((resolve, reject) => {
      let req = http.request(reqOpts, (res) => {
        let body = '';
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (json) {
            try {
              body = JSON.parse(body);
            } catch (err) {
              reject(err);
            }
          }

          console.log('请求成功:', JSON.stringify(reqOpts));
          resolve(body);
        });

        res.on('error', (err) => {
          reject(err);
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(data);
      req.end();
    });
  }
}