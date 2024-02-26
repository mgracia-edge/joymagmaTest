const Bree = require('bree');

/**
 * interval: 'at 12:00 am', --> every day at midnight 
 */

const bree = new Bree({
  jobs: [
    {
      // run |subscribersJob| every day at time definded (example: 'at 11:55 pm')
      name: 'subscribersJob',
      interval: 'at 11:58 pm',
    },
  ]
});

(async () => {
  await bree.start();
})();