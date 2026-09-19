const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const root = require('path').resolve(__dirname, '..');
let commands = [];
const sandbox = { require: name => {
  if (name === 'node_helper') return { create: x => x };
  if (name === 'child_process') return { exec: (cmd, options, callback) => { commands.push(cmd); callback(null); }, execFileSync: () => { throw Error('Unexpected GPIO access'); } };
  throw Error('Unexpected import: ' + name);
}, process, console, module: { exports: {} }, setTimeout, clearTimeout, setInterval, clearInterval };
vm.runInNewContext(fs.readFileSync(root + '/node_helper.js', 'utf8'), sandbox);
const h = sandbox.module.exports;
h.config = { waylandOutput: 'HDMI-A-1', waylandTransform: '270' };
h.setWaylandDisplayPower(true);
h.setWaylandDisplayPower(false);
assert.deepEqual(commands, ['/usr/bin/wlr-randr --output HDMI-A-1 --on', '/usr/bin/wlr-randr --output HDMI-A-1 --off']);
assert.ok(!fs.readFileSync(root + '/MMM-PIR-Sensor.js', 'utf8').includes('waylandTransform'));
console.log('PASS: monitor wake/sleep commands contain no rotation, even with an old transform setting.');
