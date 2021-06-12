const {login, sleep, getLightProfile, getRoomBulbs} = require('./common');
const {miioProtocol} = require('node-mihome');

function estimateColorTemperature(lightProfile, timeNow) {
  const {sunset, sunrise} = lightProfile.getSolar(new Date());
  const dayDuration = sunset - sunrise;
  const timePassed = timeNow - sunrise;
  const div = timePassed / dayDuration;
  const degrees = Math.max(Math.min(180 * div, 180), 0);
  const mul = Math.sin(degrees * (Math.PI / 180));
  return Math.round(Math.max(Math.min(4800 * mul, 4800), 0)) + 1700;
}

function estimateBrightness(lightProfile, timeNow) {
  const {sunrise, sunset} = lightProfile.getSolar(new Date());

  if (timeNow > sunrise && timeNow < sunset) {
    const timePassed = timeNow - sunrise;
    const fraction = timePassed / lightProfile.sunriseBrightnessTransition;
    return Math.min(Math.round(100 * fraction), 100);
  }
  if (timeNow > sunset) {
    const timePassed = timeNow - sunset;
    const fraction = timePassed / lightProfile.sunsetBrightnessTransition;
    return Math.max(Math.round(100 - 100 * fraction), 1);
  }
  return 1;
}

async function start() {
  await login();

  while (true) {
    try {
      const bulbs = await getRoomBulbs();
      await miioProtocol.init();
      const timeNow = new Date();
      for (let bulb of bulbs) {
        await bulb.setColorTemperature(estimateColorTemperature(bulb.lightProfile, timeNow));
        await bulb.setBrightness(estimateBrightness(bulb.lightProfile, timeNow));
      }
      await miioProtocol.destroy();
      console.log(`CT/Brightness state successfully updated om ${new Date()}`);
    } catch (e) {
      console.error(e);
    }
    await sleep(1000 * 60 * 5); // 5 min
  }
}

if (test()) {
  start();
}

async function test() {
  const lightProfile = getLightProfile('light:common');
  const {sunrise, sunset} = lightProfile.getSolar(new Date());
  console.log(`Sunrise`, sunrise.toLocaleString(), estimateColorTemperature(lightProfile, sunrise));
  console.log(`Sunset`, sunset.toLocaleString(), estimateColorTemperature(lightProfile, sunset));

  const timeNow = new Date();
  timeNow.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    console.log(`${i}:00`,
      `CT: ${estimateColorTemperature(lightProfile, timeNow)}`,
      `B: ${estimateBrightness(lightProfile, timeNow)}`,
    );
    timeNow.setHours(timeNow.getHours() + 1);
  }
}
