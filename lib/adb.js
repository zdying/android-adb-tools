/**
 * @file Adb tools
 * @author zdying
 */

let child_process = require('child_process');
let util = require('util');
let exec = util.promisify(child_process.exec);

module.exports = class ADB {
  constructor(opts) {
    opts = opts || {};

    this.options = opts;
  }

  async shell(cmd, args) {
    if (!cmd) {
      throw Error('Command should not be empty.');
    }

    if (!args) {
      args = [];
    }

    return await this.exec('shell', [cmd].concat(args));
  }

  async exec(cmd, args) {
    if (!cmd) {
      throw Error('Command should not be empty.');
    }

    if (!args) {
      args = [];
    }

    let {udid} = this.options;
    let device = '';

    if (udid) {
      device = `-s ${udid}`;
    }

    let command = `adb ${device} ${cmd} ${args.join(' ')}`;

    console.log('[Log] execute adb command:', command);

    let {stdout, stderr} = await exec(command);

    if (stderr) {
      throw Error(stderr);
    } else {
      return stdout;
    }
  }

  async unlock() {

  }

  async lock() {

  }

  async isLocked() {

  }

  async click() {

  }

  async waitForActivity() {

  }

  async currentActivity() {
    let out = await this.shell('dumpsys window windows | grep -E "mCurrentFocus"');
    let reg = /Window\{(\w+) (\w+) ([^\/]+)(?:\/(.+))?\}/;
    let result = out.match(reg);

    if (!result) {
      throw Error('Get current activity info failed');
    }

    return {
      // windowId: result[1],
      // uid: result[2],
      package: result[4] ? result[3] : '',
      activity: result[4] ? result[4] : result[3]
    }
  }

  async home() {
    await this.shell('input', ['keyevent', 3]);
  }

  async back() {
    await this.shell('input', ['keyevent', 4]);
  }

  async type(str) {
    await this.shell('input', ['text', str]);
  }

  async keyEvent(code) {
    await this.shell('input', ['keyevent', code]);
  }


  async pull(remoteFile) {
    await this.exec('pull', [remoteFile]);
  }

  async click(x, y) {
    await this.shell('input', ['tap', x, y])
  }

  async type(str) {
    await this.shell('input', ['text', str]);
  }

  async devices() {
    try {
      let {stdout, stderr} = await exec('adb devices -l');  

      if (stderr) {
        throw Error(stderr);
      }

      let arr = stdout.split(/\r?\n/);
      let devices = [];

      arr = arr.filter(line => {
        line = line.trim();
        return line && !line.startsWith('List of devices') && !line.startsWith('*')
      });

      devices = arr.map(line => {
        let tokens = line.trim().split(/\s+/);
        let device = {
          udid: tokens[0]
        };

        for (let i = 1; i < tokens.length; i++) {
          let token = tokens[i];
          let arr = token.split(':');

          if (arr.length === 2) {
            device[arr[0]] = arr[1]
          }
        }

        return device;
      });
  
      return devices; 
    } catch (error) {
      // logger.error('获取设备信息失败:', error);
      return []
    }
  }
}


