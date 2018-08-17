/**
 * @file Window Class
 * @author zdying
 */
'use strict';

const adb = require('./adb');
const xmlParser = require('xml-js');

const Element = require('./Element');
const http = require('./http');

module.exports = class Driver {
  constructor(options) {
    this.options = options;
    this.adb = new adb({
      udid: options.udid
    });
  }
  async home() {
    return await this.adb.home();
  }

  async back() {
    return await this.adb.back();
  }

  async currentActivity() {
    return await this.adb.currentActivity();;
  }

  async launch(options) {
    let {package:pkg, activity, intent} = options || {};

    if (!pkg || !activity) {
      pkg = this.options.package;
      activity = this.options.activity;
    }

    // console.log('launch:', pkg + '/' + activity);

    try {
      await this.adb.shell('am', ['start', '-n', pkg + '/' + activity]);      
    } catch (error) {
      let {message} = error;
      console.log(error);
      if (message === 'Warning: Activity not started, its current task has been brought to the front') {

      } else {
        console.log('object');
        throw error;
      }
    }
  }

  async document(logSource) {
    let source = await this.source(logSource);
    let dom = xmlParser.xml2js(source, {
      compact: false,
      addParent: true,
      nativeType: true,
  
      declarationKey: 'document',
      attributesKey: 'attributes',
      parentKey: 'parentNode',
      elementsKey: 'childNodes',
    });
    let element = null;

    let {document, childNodes} = dom;

    document.type = 'document';
    document.name = 'document';
    document.parentNode = null;
    document.childNodes = childNodes;

    element = new Element(document, null);
    element.adb = this.adb;

    this._document = element;

    return element;
  }

  async source(logSource) {
    let source = await http.request({
      url: 'http://127.0.0.1:6635/dump',
      // json: true
    });

    if (logSource) {
      console.log('[Log] source ===>', source);
    }

    return source;
  }

  async waitForWindowUpdate() {
    let updated = await http.request({
      url: 'http://127.0.0.1:6635/waitForWindowUpdate'
    });

    return updated;
  }

  async waitForIdle() {
    await http.request({
      url: 'http://127.0.0.1:6635/waitForIdle'
    });
  }

  async waitForSelectorServer(selector) {
    let start = Date.now();
    await http.request({
      url: 'http://127.0.0.1:6635/waitForSelector?selector=' + encodeURIComponent(selector)
    });
    let end = Date.now();
    console.log('[Log] wait for selector server ::::', end - start, 'ms');
  }

  async waitForSelector(selector, timeout) {
    let start = Date.now();
    let $ele = null;
    let document = null;
    let count = 0;
    let TIMEOUT_ERROR = 'Wait for selector timeout: ' + selector;
  
    timeout = timeout || 10000;

    do {
      if (count > 0) {
        await this.waitFor(200);
      }
      document = await this.document();
      $ele = document.querySelector(selector);
      count++
    } while ($ele == null && Date.now() - start < timeout);
    // await http.request({
    //   url: 'http://127.0.0.1:6635/waitForSelector?selector=' + encodeURIComponent(selector)
    // });

      // document = await this.document();
      // $ele = document.querySelector(selector);

    this._document = document;
    let end = Date.now();
    console.log('[Log] wait for selector ::::', end - start, 'ms');
    return $ele;
  }

  async waitFor(time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  async querySelector(selector) {
    let document = this._document || await this.document();
    return document.querySelector(selector);
  }

  async click(selector, wait=true, timeout) {
    let $ele = null;
    if (wait) {
      $ele = await this.waitForSelector(selector, timeout);
    } else {
      $ele = await this.querySelector(selector);
    }
    await $ele.click();
  }

  async type(text) {
    await this.adb.type(text);
  }
}
