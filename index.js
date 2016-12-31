require('dotenv-safe').load();
let ostb = require('os-toolbox');
let pm2 = require('pm2');

let statbot = require('server-statbot')({
  verify_token: process.env.FB_VERIFY_TOKEN,
  page_token: process.env.FB_PAGE_TOKEN,
  app_secret: process.env.FB_APP_SECRET,
  page_scoped_user_id: process.env.FB_USER_ID
});

// On every log output from pm2, message me
pm2.connect(() => {
  pm2.launchBus((err, bus) => {
    bus.on('log:out', packet => { // apparently '\u000A' works
      statbot.say('[' + packet.process.name + '] ' + packet.data.replace('\\n', '\n'));
    });
    bus.on('log:err', packet => {
      statbot.say('[' + packet.process.name + '][err] ' + packet.data.replace('\\n', '\n'));
    });
  });
});

// Requesting general status of the server
statbot.hears(["status"], (text, reply) => {
  reply("Uptime: " + ostb.uptime() + "s");
  
  ostb.cpuLoad().then(cpuusage => {
    reply("CPU: " + cpuusage + "%");
  }).catch(err => {
    reply("Unable to get CPU usage: " + err);
  });
  
  ostb.memoryUsage().then(memusage => {
    reply("Memory: " + memusage + "%");
  }).catch(err => {
    reply("Unable to get memory usage: " + err);
  });
});

statbot.listen(process.env.PORT);
