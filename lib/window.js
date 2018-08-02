/**
 * @file Window Class
 * @author zdying
 */
'use strict';

const adb = require('./adb');
const xmlParser = require('xml-js');

const Element = require('./Element');

const window = module.exports = {
  async document() {
    let source = await adb.getSource();
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
  }
}

test().catch(err=>{
  console.log(err);
});

async function test() {
  let doc = await window.document();

  console.log(doc);
  console.log(doc.className, doc.type);
  console.log(doc.childNodes);

  let receive = doc.querySelectorAll('[text="收款方"]');
  let views = doc.querySelectorAll('.android.widget.TextView');
  let view = doc.querySelector('.android.widget.TextView');

  console.log(receive);
}

