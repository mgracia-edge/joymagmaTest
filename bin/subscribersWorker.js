const dc = require("../lib/dataConnection");

/**
 * collections was used:
 * - Subscribers [count][read]
 * - StatsLines [aggregate, find][read]
 * - StatsDailyInstalls [remove, create][**write**]
 *    - used in:
 *      - /api/nx/statistics.js
 *        - path: "subscribers",
 * - StatsDailyPlayingResume [remove, create][**write**]
 *  - used in: DID NOT USE ENYMORE
 */

(async function main() {
    console.log("Waiting for connection");
    dc.on(dc.event.CONNECTED, async () => {

        let init = new Date("2022-02-01");
        let until = new Date("2022-02-05");

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

    console.log(day);

    let from = new Date(day);
    from.setHours(0, 0, 0, 0);

    let until = new Date(from);
    until.setHours(24, 0, 0, 0);

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
                ,$and: [
                    {cid: {$ne: "503001"}}, 
                    {cid: {$ne: "115294"}}, 
                    {cid: {$ne: "56176"}}, 
                    {cid: {$ne: "60265"}} 
                ]
            }
        );

        // find the last document generated to continue with the next calculation
        const lastDailySubscribers = await dc.db.StatsDailySubscribers.findOne({fromDate: {$lt: from}},{}, { sort: { fromDate : -1 }});
        
        // if exist we can continue with the calculation
        // if does not exist we will create the first 
        if (lastDailySubscribers) {

            // value used to calculate difference
            lastDailySubscribersActive = lastDailySubscribers.active;

            // uninstalls calculation
            const actualBeforeActiveUsers = await dc.db.Subscribers.count({
                creationDate: {$lt: lastDailySubscribers.untilDate}
                // used to simulate users uninstall by period
                ,$and: [
                    {cid: {$ne: "503001"}}, 
                    {cid: {$ne: "115294"}}, 
                    {cid: {$ne: "56176"}}, 
                    {cid: {$ne: "60265"}} 
                ]
            });
            uninstalls = lastDailySubscribers.active - actualBeforeActiveUsers;

            // installs calculation
            const actualAfterActiveUsers = await dc.db.Subscribers.count({
                $and: [
                    {creationDate: {$gt: lastDailySubscribers.untilDate}}, 
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
                //difference: activeUsers - (lastDailySubscribers ? lastDailySubscribers.active : 0), 
                difference: activeUsers - lastDailySubscribersActive, 
                uninstalls,
                installs
            }, (error, data) => {
                resolve()
            })
        })

    });
}
