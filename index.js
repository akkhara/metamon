const express = require('express');
const http = require('http');
const cron = require('node-cron');
const {exec} = require('child_process');
const lineNotify = require('line-notify-nodejs')('bc9ZH7slbMEnQ5mTQ8MKFetKF7oxVNr10HP8rHyvlIY');
const os = require('os');
const date = require('date-and-time');

const app = express();

cron.schedule('30 8,20 * * *', function() {
  const now  =  new Date();
  console.log(`daily check ${date.format(now,'YYYY-MM-DD HH:mm:ss')}`);
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
      var msg = `${os.hostname()}\nlatest finalized block: ${status.latest_finalized_block_height}\nlatest finalized time: ${date.format(dt,'YYYY-MM-DD HH:mm:ss')}\nsyncing: ${status.syncing}`;
      lineNotify.notify({
        message: msg
      });
      console.log(msg);
    }
  });
});
cron.schedule('0 * * * *', function() {
  const now  =  new Date();
  console.log(`hourly check ${date.format(now,'YYYY-MM-DD HH:mm:ss')}`);
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
      var dt = new Date(status.latest_finalized_block_time * 1000);
      if (status.syncing) {
        var msg = `${os.hostname()}\nlatest finalized block: ${status.latest_finalized_block_height}\nlatest finalized time: ${date.format(dt,'YYYY-MM-DD HH:mm:ss')}\nsyncing: ${status.syncing}`;
        lineNotify.notify({
          message: msg
        });
      } else if (timestamp - status.latest_finalized_block_time >= 300) {
        var msg = `${os.hostname()}\nStoped syncing since: ${date.format(dt,'YYYY-MM-DD HH:mm:ss')}`;
        lineNotify.notify({
          message: msg
        });
      } else {
        console.log('synced');
      }
    }
  });
});

app.get('/status', (req, res) => {
  exec('/usr/local/go/bin/pandocli query status', (error, stdout, stderr) => {
    if (error) {
      res.send(error.message);
    } else if (stderr) {
      res.send(stderr);
    } else {
      res.send(stdout);
    }
  });
});

http.createServer(app).listen(8080, () => {
  console.log('HTTP Server running on port 80');
});