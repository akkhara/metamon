const cron = require('node-cron');
const {exec} = require('child_process');
const lineNotify = require('line-notify-nodejs')('bc9ZH7slbMEnQ5mTQ8MKFetKF7oxVNr10HP8rHyvlIY');
const os = require('os');
cron.schedule('0 8,12 * * *', function() {
  console.log('start job');
  exec('/usr/local/go/bin/pandocli query status', (error, stdout, stderr) => {
    if (error) {
      console.error('Error', error.message);
    } else if (stderr) {
      console.error('StdErr', stderr);
    } else {
      var status = JSON.parse(stdout);
      var dt = new Date(status.latest_finalized_block_time * 1000);
      const timestamp = Date.now() / 1000;
      var msg = `${os.hostname()}
latest finalized block: ${status.latest_finalized_block_height}
latest finalized time: ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}
syncing: ${status.syncing}`;
      //if (timestamp - status.latest_finalized_block_time >= 300) {
        //line notification
        lineNotify.notify({
          message: msg
        });
      //} else {
        console.log(msg);
      //};
      /*console.log(`${os.hostname()}
latest finalized block: ${status.latest_finalized_block_height}
latest finalized time: ${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}
syncing: ${status.syncing}`);*/
    }
  });
});
