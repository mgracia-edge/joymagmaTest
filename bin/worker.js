const dc = require("../lib/dataConnection");
const stat = require("../lib/stats");
const {getDateRange, aggInc} = stat;

let defaultStart = new Date("2022-03-01T00:00:00.000+0000");
let defaultDelay = 15000;

let blockedPeriods = [];
let blocking = false;

(async function main() {
    dc.onConnect(async () => {
        while (dc.db){
            await resumeAggregationPerMinute();

            for(let idx in stat.C.aggregation){
                if(stat.C.aggregation[idx] === stat.C.aggregation.PER_MIN){
                    continue;
                }
                await resumeAggregationHigher(stat.C.aggregation[idx]);
            }

            await delay(defaultDelay);
        }
    });
})();

async function resumeAggregationHigher(aggregationLevel){
    let lastItem = (await dc.db.StatsResume.findOne({aggregation:aggregationLevel}).sort({date: -1}));
    let initialDate = defaultStart;

    if(lastItem){
        initialDate = lastItem.date;
    }

    let inc = aggInc(aggregationLevel);

    let endDate = new Date(Date.now() - Date.now() % (1000*inc));

    console.log("Start->", initialDate, endDate, aggregationLevel, inc);

    if((endDate.getTime() - initialDate.getTime()) < inc){
        console.warn("Range is invalid");
        return null;
    }else{

        let c = Date.now()
        for (let currentDate = new Date(initialDate); currentDate.getTime() <endDate.getTime(); currentDate.setTime(currentDate.getTime()+inc*1000)){

            try {
                await dc.db.StatsResume.create(
                    await compResumeHigher(currentDate, aggregationLevel, true)
                )
            }catch(e){
                console.log("duplicate");
            }

            try {
                await dc.db.StatsResume.create(
                    await compResumeHigher(currentDate, aggregationLevel, false)
                )
            }catch(e){
                console.log("duplicate");
            }

            console.log(currentDate, ((Date.now() - c)*(endDate.getTime()-currentDate.getTime())/(inc*1000))/1000)
            c = Date.now()

        }

    }

}

async function compResumeHigher(date, aggregation, box){
    if (dc.db) {

        if(aggregation === stat.C.aggregation.PER_MIN){
            throw new Error("Cannot use per minute aggregation.");
        }

        let perChannel = [];
        let concurrency = 0;
        let playTime = 0;

        let dateRange = getDateRange(date, aggregation);

        let cMap = new Map();
        let tUidSet = new Set();

        let device = box?stat.C.device.ANDROID_TV:stat.C.device.ANDROID;

        for (let l of await dc.db.StatsResume.find(
            {date: {$gt: dateRange.from, $lt: dateRange.to},
                aggregation:stat.C.aggregation.PER_MIN,
                device: device
            })) {

            // Peak of concurrency (MAX)
            concurrency = Math.max(l.concurrency, concurrency);

            // Peak of concurrency
            playTime += playTime;

            // Sessions
            l.sessions.forEach(id =>{
                tUidSet.add(id);
            })

            l.perChannel.forEach(it => {
                let cData = cMap.get(it.channelId);

                if(!cData){
                    cMap.set(it.channelId, {
                        concurrency: it.concurrency,
                        playTime: it.playTime
                    });
                }else{
                    cData.concurrency += Math.max(it.concurrency, cData.concurrency);
                    cData.playTime += it.playTime;
                }

            });
        }

        for(let it of cMap){
            let channelId = it[0];
            let concurrency = it[1].concurrency;
            let playTime = it[1].playTime;

            perChannel.push({
                channelId,
                concurrency,
                playTime
            })
        }

        return {
            date: dateRange.from,
            aggregation: aggregation,
            device: box?stat.C.device.ANDROID_TV:stat.C.device.ANDROID,
            concurrency: concurrency,
            numberOfSubscribers: tUidSet.size,
            playTime: playTime,
            perChannel: perChannel,
            sessions:  [...tUidSet]
        };

    } else {
        throw new Error("DB disconnected");
    }
}

async function resumeAggregationPerMinute(){

        let aggregationLevel = stat.C.aggregation.PER_MIN;
        let lastItem = (await dc.db.StatsResume.findOne({aggregation:aggregationLevel}).sort({date: -1}));
        let initialDate = defaultStart;

        if(lastItem){
            initialDate = lastItem.date;
        }

        let endDate = new Date();

        let inc = aggInc(aggregationLevel);

        console.log("Start->",initialDate, endDate, aggregationLevel, inc);

        let c = Date.now()
        for (let currentDate = new Date(initialDate); currentDate.getTime() <endDate.getTime(); currentDate.setSeconds(inc)){

            try {
                await dc.db.StatsResume.create(
                    await compResumePerMinute(currentDate, aggregationLevel, true)
                )
            }catch(e){
                console.log("duplicate");
            }

            try {
                await dc.db.StatsResume.create(
                    await compResumePerMinute(currentDate,aggregationLevel,false)
                )
            }catch(e){
                console.log("duplicate");
            }

            console.log(currentDate, ((Date.now() - c)*(endDate.getTime()-currentDate.getTime())/(inc*1000))/1000)
            c = Date.now()
        }

}

async function compResumePerMinute(date, aggregation, box) {

    if(aggregation !== stat.C.aggregation.PER_MIN){
        throw new Error("Can only use per minute aggregation.");
    }

    if (dc.db) {

        let perChannel = [];

        let dateRange = getDateRange(date, aggregation);

        let cMap = new Map();
        let tUidSet = new Set();

        const regex = new RegExp("Box", 'i')
        let agent = box?{$regex: regex}:{"$not" : {$regex: regex}}
        for (let l of await dc.db.StatsLines.find({date: {$gt: dateRange.from, $lt: dateRange.to},"agent" : agent})) {

            if (!l.channelId){
                continue;
            }

            let cUidSet = cMap.get(l.channelId);

            if(!cUidSet){
                cUidSet = new Set()
            }

            cUidSet.add(l.session);
            tUidSet.add(l.session);

            cMap.set(l.channelId,cUidSet);

        }

        for(let it of cMap){
            let channelId = it[0];
            let concurrency = it[1].size;
            let playTime = concurrency * 60;

            perChannel.push({
                channelId,
                concurrency,
                playTime
            })
        }

        return {
            date: dateRange.from,
            aggregation: aggregation,
            device: box?stat.C.device.ANDROID_TV:stat.C.device.ANDROID,
            concurrency: tUidSet.size,
            numberOfSubscribers: tUidSet.size,
            playTime: tUidSet.size*60,
            perChannel: perChannel,
            sessions:  [...tUidSet]
        };

    } else {
        throw new Error("DB disconnected");
    }
}

function delay(time){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve()
        },time)
    });
}