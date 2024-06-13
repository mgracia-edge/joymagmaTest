const pdc = require('../lib/dataConnection');

const REPORT_PERIOD = 5;

pdc.on("connected", function () {
    let db = pdc.db;

    if (db) {
        db.StatsLines.find({
            date: {
                $gte: new Date(Date.now() - 60000)
            }
        }, (error, logLines) => {

            let preResume = [];
            let resume = [];

            for (let line of logLines) {

                if (!preResume[line.channelId]) {
                    preResume[line.channelId] = [];
                }

                if (!preResume[line.channelId][line.subscriberId]) {
                    preResume[line.channelId][line.subscriberId] = 0;
                }

                preResume[line.channelId][line.subscriberId]++;

            }


            for (let channelId in preResume) {

                let channelResume = {
                    playTime: 0,
                    concurrency: 0
                };

                for (let subs in preResume[channelId]) {

                    channelResume.playTime += preResume[channelId][subs] * REPORT_PERIOD;
                    channelResume.concurrency++;

                }

                if(channelResume.playTime > 60){
                    channelResume.playTime = 60
                }

                console.log("Channel ID " + channelId);
                console.log(channelResume);

            }

        })
    }

});