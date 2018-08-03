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
      reqOpts = url.parse(options);
    } else {
      let {url: uri, method} = options;
      
      method = method || 'GET';
      data = this._parseData(options, method);

      if (data && method === 'GET') {
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
      let start = Date.now();
      let onFail = (err) => {
        let duration = Date.now() - start;
        let uri = url.format(reqOpts);
        reject(err);
        console.log('[Log] 请求成功:', duration + 'ms', uri, 'headers:', JSON.stringify(reqOpts.headers || {}));
      };
      let req = http.request(reqOpts, (res) => {
        let body = '';
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => body += chunk);

        res.on('end', () => {
          if (json) {
            try {
              body = JSON.parse(body);
            } catch (err) {
              reject(err);
            }
          }

          let duration = Date.now() - start;
          let uri = url.format(reqOpts);
          console.log('[Log] 请求成功:', duration + 'ms', uri, 'headers:', JSON.stringify(reqOpts.headers || {}));
          resolve(body);
        });

        res.on('error', onFail);
      });

      req.on('error', onFail);

      req.write(data);
      req.end();
    });
  },

  _parseData(options, method) {
    let {data, json} = options;

    if (!data || Object.keys(data).length === 0) {
      return '';
    }

    if (/(POST|PUT)/.test(method)) {
      data = json ? JSON.stringify(data) : qs.stringify(data);
    } else {
      data = qs.stringify(data);
    }

    return data;
  }
}