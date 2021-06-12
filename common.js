const mihome = require('node-mihome');
const yargs = require('yargs');

const ONE_HR = 1000 * 60 * 60;
const TWO_HRS = ONE_HR * 2;
const THREE_HRS = ONE_HR * 3;

const argv = yargs
  .option('username', {
    alias: 'u',
    description: 'Mi Home Cloud user name',
    type: 'string',
  })
  .option('password', {
    alias: 'p',
    description: 'Mi Home Cloud password',
    type: 'string',
  })
  .option('router-address', {
    alias: 'r',
    description: 'Wifi router local network address (TP LINK only)',
    type: 'string',
  })
  .option('router-auth-cookie', {
    alias: 'a',
    description: 'Wifi router authorization cookie (TP LINK only)',
    type: 'string',
  })
  .option('device-macs', {
    alias: 'd',
    array: true,
    description: 'Device MAC addresses (f.e. smartphones) to detect person presence at home. Example: -d 52:73:58:A3:2A:8C 30:07:4D:12:8C:B3',
    type: 'string',
    default: []
  })
  .demandOption(['username', 'password'])
  .help()
  .alias('help', 'h')
  .argv;

const lightProfile = {
  common: {
    devicesWhenSomeoneHome: argv.deviceMacs,
    sunrisePowerOnDelay: 0,
    sunsetPowerOffDelay: 0,
    sunriseBrightnessTransition: TWO_HRS,
    sunsetBrightnessTransition: TWO_HRS,
    getSolar(day) {
      // const {sunrise, sunset} = new SolarCalc(new Date(), 50.016, 36.1353);
      const sunrise = new Date(day), sunset = new Date(day);
      sunrise.setHours(7, 0, 0);
      sunset.setHours(20, 0, 0);
      return {sunrise, sunset};
    },
  },
  bed: {
    sunsetPowerOffDelay: TWO_HRS,
  },
  ceiling: {
    sunrisePowerOnDelay: TWO_HRS,
  }
};

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const login = async () => await mihome.miCloudProtocol.login(argv.username, argv.password);

async function getRoomBulbs() {
  const options = {country: 'de'}; // 'ru', 'us', 'tw', 'sg', 'cn', 'de' (Default: 'cn')
  const devices = await mihome.miCloudProtocol.getDevices(null, options);
  return devices
    .filter(dev => getLightProfile(dev.name))
    .map(bulb => {
      console.log('Bulb', bulb.name);
      return Object.assign(mihome.device({
        id: bulb.did, // required, device id
        model: 'yeelink.light.strip1', // required, device model
        address: bulb.localip, // miio-device option, local ip address
        token: bulb.token, // miio-device option, device token
      }), {lightProfile: getLightProfile(bulb.name)});
    });
}

function getLightProfile(deviceName) {
  const match = deviceName.match(/light:(\w+)/i);
  return match ? Object.assign({}, lightProfile.common, lightProfile[match[1]]) : null;
}

exports.ONE_HR = ONE_HR;
exports.TWO_HRS = TWO_HRS;
exports.THREE_HRS = THREE_HRS;
exports.router = {
  address: argv.routerAddress,
  authCookie: argv.routerAuth,
};

exports.sleep = sleep;
exports.login = login;
exports.getRoomBulbs = getRoomBulbs;
exports.getLightProfile = getLightProfile;
