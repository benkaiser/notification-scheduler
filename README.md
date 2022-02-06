# Notification Scheduler

Schedule web-push notifications on a recurring time interval. Great for static websites that need recurring notifications.

This project exists becuase Chrome [lacks a good recurring notifications API](https://web.dev/notification-triggers/).

## How To Create a Recurring Notification

For simplicities sake, I've wrapped the logic to unsubscribe from previous notificaitons and create a new subscription in a library hosted at `https://notification.kaiser.lol/lib.js` (here in this repo at `src/lib.js`). You can also copy the code directly from the library (it's pretty small) and modify it as you need.

The below code creates a recurring notification at 8am (UTC) daily.

```html
<script src="https://notification.kaiser.lol/lib.js"></script>
<script>
  // make sure you have a service worker registered before calling this
  notificationScheduler({ interval: '0 8 * * *' }).then(result => console.log('Result: ' + result));
</script>
```

## API

`notificationScheduler(params): Promise<boolean>`

Returns true/false based on success creating a notification.

`params` is an object containing:

- `interval` (**required**): This can be a human-readable string (e.g. "2 days") or a cron format
- `timezone`: timezone for the notification when using a cron interval (e.g. "Australia/Brisbane"). To get the user's browser timezone, use `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- `endDate`: a timestamp to finish the notification subscription at, passed as a string to `new Date()` (e.g. "2022-02-010")

## License

MIT

## Disclaimer

Note: This service comes with absolutely no guarantees, it might go down, notifications may stop being delivered, etc. If you would like to rely on this in a production environment, I'd advise you to spin up your own server (or rely on a more dedicated notification solution for your scenario).