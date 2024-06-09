const cron = require('node-cron');
const {exec} = require('child_process');
const lineNotify = require('line-notify-nodejs')('bc9ZH7slbMEnQ5mTQ8MKFetKF7oxVNr10HP8rHyvlIY');
const os = require('os');
cron.schedule('30 8,20 * * *', function() {
  console.log('daily check');
  exec('/usr/local/go/bin/pandocli query status', (error, stdout, stderr) => {
    if (error) {
      lineNotify.notify({
        message: `${os.hostname()}\nError\n${error.message}`
      });
      console.error('Error', error.message);
    } else if (stderr) {
      lineNotify.notify({
        message: `${os.hostname()}\nStdErr\n${stderr}`
      });
      console.error('StdErr', stderr);
    } else {
      var status = JSON.parse(stdout);
      var dt = new Date(status.latest_finalized_block_time * 1000);
      const timestamp = Date.now() / 1000;
      var msg = `${os.hostname()}
latest finalized block: ${status.latest_finalized_block_height}
latest finalized time: ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}
syncing: ${status.syncing}`;
      lineNotify.notify({
        message: msg
      });
      console.log(msg);
    }
  });
});
cron.schedule('0 * * * *', function() {
  console.log('hourly check');
  exec('/usr/local/go/bin/pandocli query status', (error, stdout, stderr) => {
    if (error) {
      lineNotify.notify({
        message: `${os.hostname()}\nError\n${error.message}`
      });
      console.error('Error', error.message);
    } else if (stderr) {
      lineNotify.notify({
        message: `${os.hostname()}\nStdErr\n${stderr}`
      });
      console.error('StdErr', stderr);
    } else {
      var status = JSON.parse(stdout);
      const timestamp = Date.now() / 1000;
      if (timestamp - status.latest_finalized_block_time >= 300) {
        var dt = new Date(status.latest_finalized_block_time * 1000);
        var msg = `${os.hostname()}\nStoped syncing since: ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`;
        lineNotify.notify({
          message: msg
        });
      } else {
        console.log('synced');
      }
    }
  });
});