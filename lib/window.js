/**
 * @file Window Class
 * @author zdying
 */
'use strict';

const adb = require('./adb');
const xmlParser = require('xml-js');

const Element = require('./Element');
const http = require('./http');

const window = module.exports = {
  async document() {
    let source = await this.source();
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

    element = new Element(document);

    return element;
  },

  async source() {
    let source = await http.request({
      url: 'http://127.0.0.1:6635/dump',
      // json: true
    });

    console.log('source ===>', source);
    return source;
  },

  async waitForWindowUpdate() {
    let updated = await http.request({
      url: 'http://127.0.0.1:6635/waitForWindowUpdate'
    });

    return updated;
  },

  async waitForIdle() {
    await http.request({
      url: 'http://127.0.0.1:6635/waitForIdle'
    });
  },

  async waitFor(time) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }
}

// test().catch(err=>{
//   console.log(err);
// });

// async function test() {
//   let doc = await window.document();

//   console.log(doc);
//   console.log(doc.className, doc.type);
//   console.log(doc.childNodes);

//   let receive = doc.querySelectorAll('[text="Maps"]');
//   let views = doc.querySelectorAll('.android.widget.TextView');
//   let view = doc.querySelector('.android.widget.TextView');

//   console.log(receive);
// }

