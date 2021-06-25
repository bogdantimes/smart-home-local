# smart-home-local

In development.

Tools to control power and brightness of Mi Home Cloud devices. Allows to automatically disable lights when you leave
your house and adjust the brightness and color temperature during the day according to sunrise and sunset hours.

Future improvements:

* Support all regions
* Support more WIFI routers
* More customization for different light bulbs
* Other smart devices, like vacuum cleaners, etc.

# Instruction

In Mi Home app, register your Light bulbs (Germany / Ukraine) region. Rename each light, add the following into the
name: `light:common`, `light:bed` or `light:ceiling`. Depending on the light profile, the auto-power on/off and
brightness/color temperature will be different. By default, light gets turned on at 7 a.m. and turned off at 8 p.m. The
brightness and color temperature has a transition period of two hours, e.g. at 7 a.m. they are turned on at lowest
brightness and warmest temperature.

## Brightness and color temperature control

Start the script with Mi Home Cloud credentials for Germany / Ukraine region:

```
node ct-brightness.js -u john -p doe
```

## Power control

Allows to automatically disable and enable lights at 7 a.m. and 8 p.m. and also, disable all lights if the provided MAC
addresses are not registered in the local WIFI network of the router. Effectively, it disables lights at home when you (
or everyone) leave the house.

Start the script with Mi Home Cloud credentials for Germany / Ukraine region, smartphones MAC addresses in your home
WIFI network (only TP-LINK is supported right now) and WIFI router authentication cookie:

```
node power.js -u john -p doe -d 52:73:58:A3:2A:8C 30:07:4D:12:8C:B3 -r 192.168.0.1 -a "Basic YWRtaW46d2luZA=="
```

# Buy me a coffee

BTC: bc1qw6huxuc20edg66ddj4k6ze9njkcsplkcjllcv3

DOGE: DTtRQJvF9SYF9kwhYnVm6hvXyPzyD4FVfm

Mastercard (USD, Monobank): 5375 4188 0074 7289
