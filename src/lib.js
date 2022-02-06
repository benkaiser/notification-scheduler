window.notifyCron = (params) => {
  const endpoint = '{{HOST_NAME}}';
  return fetch(`${endpoint}/vapid`)
  .then(response => response.text())
  .then(vapidKey => {
    return navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
      return serviceWorkerRegistration.pushManager
      .getSubscription()
      .then((pushSubscription) => {
        if (pushSubscription) {
          return pushSubscription.unsubscribe()
          .then(() => fetch(`${endpoint}/unsubscribe`, {
            method: 'POST',
            body: JSON.stringify({
              endpoint: pushSubscription.endpoint
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        }
      }).then(() => {
        var options = {
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        };
        return serviceWorkerRegistration.pushManager.subscribe(options)
        .then((pushSubscription) => {
            return fetch(`${endpoint}/subscribe`, {
              method: 'POST',
              body: JSON.stringify({
                subscription: pushSubscription,
                ...params
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(() => true)
            .catch(() => false);
          }, (error) => {
            console.error(error);
            return false
          }
        );
      });
    });
  });
};