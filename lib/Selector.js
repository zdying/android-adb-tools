/**
 * @file 选择器
 * @author zdying
 */

const INVALID_SELECTOR = 'Invalid selector: ';
const fnMatchs = Symbol('matchs');

module.exports = {
  /**
   * Whether the given element matches the selector
   * @param {Element} element An `Element` against which will be tested the selector
   * @param {String} selector A selector
   * @returns {Boolean}
   */
  matchesSelector(element, selector) {
    if (typeof selector !== 'string') {
      throw Error(INVALID_SELECTOR + selector);
    }

    let {attributes} = element;

    if (!attributes || Object.keys(attributes).length === 0) {
      return false;
    }

    let selectors = selector.split(',');
    let descs = selectors.map(sel => this.parseSelector(sel));

    let isMatch = false;

    // 每个desc之间使用逻辑“或”
    for (let desc of descs) {
      let currMatch = true;
      // 每个desc之间使用逻辑“与”
      for (let d of desc) {
        let {value, compare, attr} = d;
        let {attributes} = element;
        let currAttrVal = attributes[attr];

        if (currAttrVal) {
          switch(compare) {
            case 'equal':
              currMatch = currAttrVal === value;
              break;

            case 'startsWith':
              currMatch = currAttrVal.startsWith(value);
              break;

            case 'endsWith':
              currMatch = currAttrVal.endsWith(value);
              break;
            default:
              currMatch = false;
          }
        } else {
          currMatch = false;
        }

        if (currMatch === false) {
          break;
        }
      }

      if (currMatch === true) {
        isMatch = true;
        break;
      }
    }

    return isMatch;
  },

  /**
   * Elements in the array that match the given selector
   * @param {Array<Element>} elements An array of `Elements` to filter against the specified selector
   * @param {String} selector A selector
   * @returns {Array<Element>}
   */
  matches(elements, selector) {
    return this[fnMatchs](elements, selector, true);
  },

  /**
   * The first element in the array that match the given selector
   * @param {Array<Element>} elements An array of `Elements` to filter against the specified selector
   * @param {String} selector A selector
   */
  matche(elements, selector) {
    let eles = this[fnMatchs](elements, selector, false);
    return eles[0] || null;
  },

  [fnMatchs](elements, selector, isAll) {
    if (elements.length) {
      let result = [];

      for(let element of elements) {
        if (this.matchesSelector(element, selector)) {
          result.push(element);
        }

        if (isAll !== true && result.length > 0) {
          return result;
        }
  
        if (element.childNodes && element.childNodes.length) {
          let r = this[fnMatchs](element.childNodes, selector, isAll);
          result = result.concat(r);
        }
      }
  
      return result;
    } else {
      return []
    }
  },

  parseSelector(selector) {
    // #id
    // .class
    // ~desc
    // [name="value"]|["name"="value"]|['name'='value']|[name=value]
    // android.widget.ImageView[content-desc="Image"]

    let desc = null;
    let attrReg = /(\[[^=]+=[^=\]]+\])/g;
    let quotReg = /^['"\[]|['"\]]$/g;
    let errorMessage = INVALID_SELECTOR + selector;

    selector = selector.trim();

    switch (selector.trim().charAt(0)) {
      case '#':
        desc = {
          attr: 'resource-id',
          value: selector.substring(1),
          compare: 'equal'
        }
        break;
      
      case '~':
        desc = {
          attr: 'content-desc',
          value: selector.substring(1),
          compare: 'equal'
        }
        break;

      case '.':
        desc = {
          attr: 'class',
          value: selector.substring(1),
          compare: 'equal'
        }
        break;

      case '[':
        let match = selector.match(attrReg);
        if (match) {
          desc = match.map(str => {
            let arr = str.replace(quotReg, '').split('=');

            if (arr[0] && arr[1]) {
              return {
                attr: arr[0].replace(quotReg, ''),
                value: arr[1].replace(quotReg, ''),
                compare: 'equal'
              }
            } else {
              throw Error(errorMessage);
            }
          });
        } else {
          throw Error(errorMessage);
        }
        break;

      default:
        throw Error(errorMessage);
    }

    if (desc && !Array.isArray(desc)) {
      desc = [desc];
    }

    return desc;
  }
}

var parser = module.exports;

// #id
// .class
// ~abc
// :abc
// [name="value"]|["name"="value"]|['name'='value']|[name=value]
// android.widget.ImageView[content-desc="Image"]
// console.log(parser.parseSelector('#id'));
// console.log(parser.parseSelector('.class'));
// console.log(parser.parseSelector('[name="value"]|["name"="value"]|[\'name\'=\'value\']|[name=value]'));
// console.log(parser.parseSelector('android.widget.ImageView[content-desc="Image"]'));


// let element = {
//   attributes: {
//     id: 'name',
//     class: 'android.widget.ImageView',
//     clickable: 'true',
//     disabled: 'false'
//   }
// }
// console.log('#name', parser.isMatch(element, '#name')); 
// console.log('.android.widget.ImageView', parser.isMatch(element, '.android.widget.ImageView')); 
// console.log('.android.widget.ImageViews', parser.isMatch(element, '.android.widget.ImageViews')); 
// console.log('[clickable="true"]', parser.isMatch(element, '[clickable="true"]'));
// console.log('[disabled="true"]', parser.isMatch(element, '[disabled="true"]'));
// console.log('[disabled="false"][clickable="true"]', parser.isMatch(element, '[disabled="false"][clickable="true"]'));
// console.log('[disabled="true"][clickable="true"]', parser.isMatch(element, '[disabled="true"][clickable="true"]'));
// console.log('[disabled="true"],[clickable="true"]', parser.isMatch(element, '[disabled="true"],[clickable="true"]'));
// console.log('android.widget.ImageView[content-desc="Image"]', parser.isMatch(element, 'android.widget.ImageView[content-desc="Image"]'));