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
let Selector = require('./Selector');

module.exports = {
  async shell(cmd, args) {
    if (!cmd) {
      throw Error('Command should not be empty.');
    }

    if (!args) {
      args = [];
    }

    console.log('adb cmd:', 'shell', [cmd].concat(args));

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

  async home() {
    await this.shell('input', ['keyevent', 3]);
  },

  async type(str) {
    await this.shell('input', ['text', str]);
  },

  async keyEvent(code) {
    await this.shell('input', ['keyevent', code]);
  },


  async pull(remoteFile) {
    await this.adb('pull', [remoteFile]);
  },

  async click(x, y) {
    await this.shell('input', ['tap', x, y])
  },

  async type(str) {
    await this.shell('input', ['text', str]);
  }
}


