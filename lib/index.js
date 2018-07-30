var convert = require('xml-js');
var xml =
'<?xml version="1.0" encoding="utf-8"?>' +
'<note importance="high" logged="true">' +
'    <list>' +
'       <flight no="CA1234" dur="1小时23分"></flight>' +
'       <flight no="MU5371" dur="2小时05分"></flight>' +
'       <flight no="CZ2839" dur="1小时36分"></flight>' +
'    </list>' +
'    <title id="happy"><div><p id="p"></p></div></title>' +
'    <todo id="goPay" num="123" bounds="[1,2][34,55]" text="继续支付" emoji="📱">Work</todo>' +
'    <todo class="a">Play</todo>' +
'</note>';
let start = Date.now();
// var result1 = convert.xml2js(xml, {compact: true, addParent: true});
var cache = {
  id: {},
  cls: {}
};
var tree = convert.xml2js(
  xml, 
  {
    compact: false,
    addParent: true,
    nativeType: true,

    attributesKey: 'attributes',
    parentKey: 'parentNode',
    elementsKey: 'childNodes',

    attributesFn: function (value, parentElement, currentElement) {
      if (value.id) {
        cache.id[value.id] = currentElement;
      } else if(value.class) {
        cache.cls[value.class] = currentElement;
      }
      return value
    }
  }
);
let dur = Date.now() - start;

console.log('耗时', dur + 'ms');

// console.log(tree);

// 深度优先遍历

let s = Date.now();
let ele = findElementsByFilter(tree, function (ele) {
  // return ele.attributes && ele.attributes.id === 'p';
  // return ele.name === 'flight';
  return ele.attributes && ele.attributes.no
});
let e = Date.now();
console.log('查找到的元素:', e - s, ele);

function findElementsByFilter(root, filter, deep) {
  let {childNodes=[]} = root;

  root.name = root.name || 'root';

  // console.log(prex + root.name);

  if (childNodes.length) {
    let result = [];
    childNodes.forEach(element => {
      // console.log(element.name);

      if (filter(element)) {
        result.push(element);
      }

      if (element.childNodes) {
        let r = findElementsByFilter(element, filter);
        result = result.concat(r);
      }
    });

    return result;
  } else {
    return []
  }
}

/**
 * Simple XML parser
 * @param {String} xml
 * @return {Object}
 */
function parseXML(xml) {

  var beg = -1;
  var end = 0;
  var tmp = 0;
  var current = [];
  var obj = {};
  var from = -1;

  while (true) {

      beg = xml.indexOf('<', beg + 1);
      if (beg === -1)
          break;

      end = xml.indexOf('>', beg + 1);
      if (end === -1)
          break;

      var el = xml.substring(beg, end + 1);
      var c = el[1];

      if (c === '?' || c === '/') {

          var o = current.pop();

          if (from === -1 || o !== el.substring(2, el.length - 1))
              continue;

          var path = current.join('.') + '.' + o;
          var value = xml.substring(from, beg);

          if (typeof(obj[path]) === 'undefined')
              obj[path] = value;
          else if (obj[path] instanceof Array)
              obj[path].push(value);
          else
              obj[path] = [obj[path], value];

          from = -1;
          continue;
      }

      tmp = el.indexOf(' ');
      var hasAttributes = true;

      if (tmp === -1) {
          tmp = el.length - 1;
          hasAttributes = false;
      }

      from = beg + el.length;

      var isSingle = el[el.length - 2] === '/';
      var name = el.substring(1, tmp);

      if (!isSingle)
          current.push(name);

      if (!hasAttributes)
          continue;

      var match = el.match(/\w+\=\".*?\"/g);
      if (match === null)
          continue;

      var attr = {};
      var length = match.length;

      for (var i = 0; i < length; i++) {
          var index = match[i].indexOf('"');
          attr[match[i].substring(0, index - 1)] = match[i].substring(index + 1, match[i].length - 1);
      }

      obj[current.join('.') + (isSingle ? '.' + name : '') + '[]'] = attr;
  }

  return obj;
};

let a= parseXML(xml);
debugger
console.log(a);