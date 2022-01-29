import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Agenda, Job } from 'agenda';
import webpush, { PushSubscription } from 'web-push';
var Agendash = require("agendash");

require('dotenv').config();
const app = express();
const port = process.env.PORT || 8777;

const agenda = new Agenda({ db: { address: process.env.MONGO_URL }, processEvery: "10 seconds" });
const contact_email = process.env.CONTACT_EMAIL || 'notification_server@kaiser.lol';

webpush.setVapidDetails(
  'mailto:' + contact_email,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

interface ISubscriptionJobData {
  subscription: PushSubscription;
  payload: string;
}

agenda.define("notify", async (job: Job<ISubscriptionJobData>) => {
  console.log('Sending notification');
  await webpush.sendNotification(job.attrs.data.subscription, job.attrs.data.payload)
  .then(() => {
    console.log('Notification sent successfully');
  })
  .catch(info => {
    console.log('Notification failed to send, removing job');
    console.log(info);
    return job.remove();
  });
});

if (process.env.ENV === 'development') {
  app.use("/dash", Agendash(agenda));
}

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('See <a href="https://github.com/benkaiser/notification-scheduler">Notification Scheduler on GitHub</a> for more info')
});

app.get('/vapid', (req, res) => {
  res.send(process.env.PUBLIC_VAPID_KEY);
});

app.post('/unsubscribe', (req, res) => {
  agenda.cancel({ 'data.subscription.endpoint': req.body.endpoint })
  .then((numCancelled) => {
    if (numCancelled) {
      res.send('Job cancelled');
    } else {
      res.send('No job found for subscription');
    }
  })
  .catch((error) => {
    console.log(error);
    res.status(500).send('Failed to unsubscribe');
  });
})

app.post('/subscribe', (req, res) => {
  agenda.create('notify', {
    subscription: req.body.subscription,
    payload: req.body.interval,
    timezone: req.body.timezone || undefined,
    endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
  }).repeatEvery(req.body.interval).save();
  res.send('Subscription created');
});

app.post('/subscribe/once', (req, res) => {
  agenda.create('notify', { subscription: req.body.subscription, payload: req.body.interval }).schedule(req.body.schedule).save();
  res.send('One time event created');
});

app.post('/subscribe/test', (req, res) => {
  agenda.now('notify', { subscription: req.body.subscription, payload: 'Test notification' });
  res.send('Test notification sent');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
  agenda.start();
})