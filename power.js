const axios = require('axios');
const {router, login, getLightProfile, getRoomBulbs, sleep} = require('./common');
const {miioProtocol} = require('node-mihome');

function estimatePower(lightProfile, timeNow, someoneIsHome = true) {
  if (someoneIsHome) {
    const {sunrise, sunset} = lightProfile.getSolar(new Date());
    const sunriseAdjusted = +sunrise + lightProfile.sunrisePowerOnDelay;
    const sunsetAdjusted = +sunset + lightProfile.sunsetPowerOffDelay;
    return timeNow > sunriseAdjusted && timeNow < sunsetAdjusted;
  }
  return false;
}

function isSomeoneHome(devicesWhenSomeoneHome = [], depth = 0) {
  return new Promise((resolve, reject) => {
    axios
      .post(`http://${router.address}/cgi?5`, '[ARP_ENTRY#0,0,0,0,0,0#0,0,0,0,0,0]0,0\r\n', {
        headers: {
          'Referer': `http://${router.address}/`,
          'Cookie': `Authorization=${router.authCookie}`,
          'Content-Type': 'text/plain'
        }
      })
      .then(res => resolve(devicesWhenSomeoneHome.some(d => res.data.includes(d))))
      .catch(reject);
  });
}

async function start() {
  await login();

  while (true) {
    try {
      const bulbs = await getRoomBulbs();
      await miioProtocol.init();
      const timeNow = new Date();
      const devicesWhenSomeoneHome = bulbs.map(b => b.lightProfile.devicesWhenSomeoneHome).flat();
      const someoneHome = await isSomeoneHome(devicesWhenSomeoneHome);
      for (let bulb of bulbs) {
        await bulb.setPower(estimatePower(bulb.lightProfile, timeNow, someoneHome));
      }
      await miioProtocol.destroy();
      console.log(`Power state successfully updated om ${new Date()}`);
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60); // 60 sec
  }
}

if (test()) {
  start();
}

async function test() {
  const lightProfile = getLightProfile('light:common');
  const timeNow = new Date();
  timeNow.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    console.log(`${i}:00`,
      `Power On: ${estimatePower(lightProfile, timeNow)}`
    );
    timeNow.setHours(timeNow.getHours() + 1);
  }

  return true;
}
