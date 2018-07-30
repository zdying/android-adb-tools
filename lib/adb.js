/**
 * @file Adb tools
 * @author zdying
 */

let fs = require('fs');
let path = require('path');
let child_process = require('child_process');
let util = require('util');
let xmljs = require('xml-js');
let exec = util.promisify(child_process.exec);

module.exports = {
  async shell(cmd, args) {
    if (!cmd) {
      throw Error('Command should not be empty.');
    }

    if (!args) {
      args = [];
    }

    return await this.adb('shell', [cmd].concat(args));
  },

  async adb(cmd, args) {
    if (!cmd) {
      throw Error('Command should not be empty.');
    }

    if (!args) {
      args = [];
    }

    let command = `adb ${cmd} ${args.join(' ')}`;
    let {stdout, stderr} = await exec(command);

    if (stderr) {
      throw Error(stderr);
    } else {
      return stdout;
    }
  },

  async unlock() {

  },

  async lock() {

  },

  async isLocked() {

  },

  async click() {

  },

  async waitForActivity() {

  },

  async currentActivity() {
    let out = await this.shell('dumpsys window windows | grep -E "mCurrentFocus"');
    let reg = /Window\{(\w+) (\w+) ([^\/]+)(?:\/(.+))?\}/;
    let result = out.match(reg);

    if (!result) {
      throw Error('Get current activity info failed');
    }

    return {
      windowId: result[1],
      uid: result[2],
      package: result[4] ? result[3] : '',
      activity: result[4] ? result[4] : result[3]
    }

    return result;

    console.log(result);
  },

  async getSource() {
    let out = await this.shell('uiautomator', ['dump', '--compressed']);
    let xml = await this.pull('/sdcard/window_dump.xml');
    return xml;

    // let t0 = Date.now();
    // let out = await this.shell('uiautomator', ['dump', '--compressed']);
    // let t1 = Date.now();
    // let xml = await this.pull('/sdcard/window_dump.xml');
    // let t2 = Date.now();
    // let domTree = xmljs.xml2js(
    //   xml, 
    //   {
    //     compact: false,
    //     addParent: true,
    //     nativeType: true,
    
    //     attributesKey: 'attributes',
    //     parentKey: 'parentNode',
    //     elementsKey: 'childNodes',
    
    //     // attributesFn: function (value, parentElement, currentElement) {
    //     //   if (value.id) {
    //     //     cache.id[value.id] = currentElement;
    //     //   } else if(value.class) {
    //     //     cache.cls[value.class] = currentElement;
    //     //   }
    //     //   return value
    //     // }
    //   }
    // );
    // let t3 = Date.now();
    // console.log('获取XML：', t1 - t0, '获取文件内容：', t2 - t1, '解析XML：', t3 - t2);
    // console.log(domTree);
  },

  async pull(remoteFile) {
    await this.adb('pull', [remoteFile]);
    let content = fs.readFileSync(path.join(__dirname, '..', path.basename(remoteFile)));
    return content.toString();
  },

  async getDocument() {
    let source = await this.getSource();
    console.log(source);
    let domTree = xmljs.xml2js(
      source, 
      {
        compact: false,
        addParent: true,
        nativeType: true,
    
        attributesKey: 'attributes',
        parentKey: 'parentNode',
        elementsKey: 'childNodes',
      }
    );

    return domTree;
  },

  async getElementById(id) {
    return await this.getElementByAttribute('id', id);
  },

  async getElementByAttribute(prop, val) {
    let tree = await this.getDocument();
    let filter = function (ele) {
      let {attributes} = ele;
      let match = attributes && attributes[prop] === val;

      return match;
    };

    let eles = this.findElementsByFilter(tree, filter);

    if (eles.length) {
      return eles[0];
    } else {
      throw Error('Element not found:', prop, val);
    }
  },

  findElementsByFilter(root, filter) {
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
          let r = this.findElementsByFilter(element, filter);
          result = result.concat(r);
        }
      });
  
      return result;
    } else {
      return []
    }
  },

  getBounds(element) {
    let {bounds} = element.attributes || {};

    if (bounds) {
      let reg = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/;
      let match = bounds.match(reg);
      let x = (Number(match[1]) + Number(match[3])) / 2;
      let y = (Number(match[2]) + Number(match[4])) / 2;

      return {
        x,
        y
      }
    } else {
      return null;
    }
  },

  async click(element) {
    let {x, y} = this.getBounds(element);
    await this.shell('input', ['tap', x, y])
  }
}

async function test() {
  let adb = module.exports;

  let res = await adb.adb('devices', ['-l']);
  console.log(res);

  console.log(await adb.currentActivity());


  // await adb.getSource();
  let t0 = Date.now();
  let ele = await adb.getElementByAttribute('text', '扫一扫');
  adb.click(ele);

  ele = await adb.getElementByAttribute('text', '相册');
  adb.click(ele);

  let t1 = Date.now();
  console.log('耗时：', t1 - t0, 'ms');
}

test();

