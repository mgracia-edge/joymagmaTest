const dc = require("../lib/dataConnection");

(async function main() {
    console.log("Waiting for connection");
    dc.on(dc.event.CONNECTED, async () => {

        const today = new Date();

        // inclusive init
        // const init = new Date("2022-02-25"); 
        const init = today;

        // inclusive until
        // const until = new Date("2022-03-03"); 
        const until = today; 

        for (let date = new Date(init);
             date.getTime() <= until.getTime();
             date = new Date(date.getTime() + 3600000 * 24)) {
            try {
                await compileDay(date);
                console.log("ok");
            } catch (e) {
                console.error(e);
                console.warn("skipping");
            }
        }

        dc.close();

    });
})();

function compileDay(day) {

    console.log("Calculating: ", day);

    let from = new Date(day);
    from.setUTCHours(0, 0, 0, 0);

    let until = new Date(from);
    until.setUTCHours(24, 0, 0, 0);

    return compile(from, until);

}

function compile(from, until) {
    return new Promise((resolve, reject) => {

        Promise.resolve()
            .then(_ => {
                return computeNewSubscriptionsCount(from, until)
            })
            .then(resolve)
            .catch(reject);

    });
}

async function computeNewSubscriptionsCount(from, until) {
    return new Promise(async (resolve, reject) => {
        
        let installs = 0;
        let uninstalls = 0;
        let lastDailySubscribersActive = 0;
        
        const activeUsers = await dc.db.Subscribers.count(
            {
                creationDate: {$lt: until}
                // used to simulate users uninstall by period
                // ,$and: [
                //     {cid: {$ne: "503001"}}, 
                //     {cid: {$ne: "115294"}}, 
                //     {cid: {$ne: "56176"}}, 
                //     {cid: {$ne: "60265"}} 
                // ]
            }
        );

        // find the last document generated to continue with the next calculation
        const lastDailySubscribers = await dc.db.StatsDailySubscribers.findOne({fromDate: {$lt: from}},{}, { sort: { fromDate : -1 }});
        
        // if exist we can continue with the calculation
        // if does not exist we will create the first 
        if (lastDailySubscribers) {

            console.log("Before calculated ->", lastDailySubscribers.fromDate);

            // value used to calculate difference
            lastDailySubscribersActive = lastDailySubscribers.active;

            // uninstalls calculation
            const actualBeforeActiveUsers = await dc.db.Subscribers.count({
                creationDate: {$lt: lastDailySubscribers.untilDate}
                // used to simulate users uninstall by period
                // ,$and: [
                //     {cid: {$ne: "503001"}}, 
                //     {cid: {$ne: "115294"}}, 
                //     {cid: {$ne: "56176"}}, 
                //     {cid: {$ne: "60265"}} 
                // ]
            });
            uninstalls = lastDailySubscribers.active - actualBeforeActiveUsers;

            // installs calculation
            const actualAfterActiveUsers = await dc.db.Subscribers.count({
                $and: [
                    {creationDate: {$gte: lastDailySubscribers.untilDate}}, 
                    {creationDate: {$lt: until}} 
                ]
            });
            installs = actualAfterActiveUsers;
        }

        // create a new document
        dc.db.StatsDailySubscribers.remove({fromDate: from}, (error, data) => {
            dc.db.StatsDailySubscribers.create({
                fromDate: from,
                untilDate: until,
                active: activeUsers,
                difference: activeUsers - lastDailySubscribersActive, 
                uninstalls,
                installs
            }, (error, data) => {
                resolve()
            })
        })

    });
}
