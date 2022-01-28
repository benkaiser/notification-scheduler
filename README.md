# Notification Scheduler

Becuase the browser lacks a good notification scheduling API... I made a notification server you can use in your static websites.

## To Use

```javascript
const endpoint = 'http://localhost:8777';
fetch(`${endpoint}/vapid`)
.then(response => response.text())
.then(vapidKey => {
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    var options = {
      userVisibleOnly: true,
      applicationServerKey: vapidKey
    };
    serviceWorkerRegistration.pushManager.subscribe(options)
    .then((pushSubscription) => {
        fetch(`${endpoint}/subscribe`, {
          method: 'POST',
          body: JSON.stringify({
            subscription: pushSubscription,
            interval: 'every 1 minutes'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => console.log('Push subscription created'))
        .catch(() => console.log('Failed to create push subscription'));
      }, function(error) {
        console.log('Failed to request notification permission')
      }
    );
  });
});
```