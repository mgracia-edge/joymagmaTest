const pdc = require('../lib/dataConnection');

const REPORT_PERIOD = 5;

pdc.on("connected", async function () {
    let db = pdc.db;

    if (!db) {
        return;
    }

    try {
        const logLines = await db.StatsLines.find({
            date: {
                $gte: new Date(Date.now() - 60000)
            }
        });

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
        
        pdc.close();
    } catch (error) {
        console.log(`Error in file test.js`)
    }
});