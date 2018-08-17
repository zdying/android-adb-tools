/**
 * @file test
 * @author zdying
 */
'use strict';

const Driver = require('./Driver');

run().catch(err => {
  console.log('[ERROR]', err);
});

async function run() {
  let start = Date.now();
  let driver = new Driver({
    autoWait: true,
    // udid: 'emulator-5554',
    package: 'com.android.settings',
    activity: 'com.android.settings.Settings'
  });
  /***
  driver.home();

  // await driver.waitForSelector('~Apps list');
  await driver.click('~Apps list');

  // await driver.waitForSelector('~Settings');
  await driver.click('~Settings');

  let activity = await driver.currentActivity();

  console.log(activity);
  */

  driver.launch();

  // await driver.waitForSelector('[text="Display"]');
  await driver.click('[text="Display"]');

  // await driver.waitForSelector('[text="Wallpaper"]');
  await driver.click('[text="Wallpaper"]');

  // await driver.waitForSelector('[text="Photos"]');
  await driver.click('[text="Photos"]');

  // await driver.waitForSelector('[text="Pictures"]');
  await driver.click('[text="Pictures"]');

  await driver.waitForSelector('#com.google.android.apps.photos:id/recycler_view');
  let $list = await driver.querySelector('#com.google.android.apps.photos:id/recycler_view');
  let $children = $list.childNodes;

  if ($children && $children.length > 1) {
    let index = 1 + Math.floor(Math.random() * ($children.length - 1));
    await $children[index].click();
    
    await driver.waitForSelector('[text="DONE"]');
    await driver.click('[text="DONE"]');
  }

  await driver.waitFor(1000);
  await driver.home();

  let end = Date.now();
  console.log('耗时：' + (end - start) + 'ms');
}