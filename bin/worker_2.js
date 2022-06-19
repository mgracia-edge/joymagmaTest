const dc = require("../lib/dataConnection");

let blockedPeriods = [];
let blocking = false;

const C = {
    statusStates: {
        PLAYING: "playing",
        ZAPPING: "zapping",
        DVR: "seek",
        AT_HOME: "home",
        AT_PLAYER: "player",
        AT_EPG: "epg_nav",
        AT_PROFILE: "profile"
    },
    device: {
        ANDROID: "android",
        ANDROID_TV: "android_tv",
        WEB: "web",
        IOS: "ios"
    }
};

(async function main() {
    console.log("Waiting for connection");
    dc.on(dc.event.CONNECTED, async () => {

        let init = new Date("2021-4-29");
        let until = new Date("2022-5-3");

        for (let date = new Date(until);
             date.getTime() > init.getTime();
             date = new Date(date.getTime() - 3600000 * 24)) {
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
            .then(_ => {
                return resumeAndStore(from, until)
            })
            .then(resolve)
            .catch(reject);

    });
}

async function computeNewSubscriptionsCount(from, until) {
    return new Promise(async (resolve, reject) => {
        let activeUsers = await dc.db.Subscribers.count({creationDate: {$lt: until}});
        let oldUsers = await dc.db.Subscribers.count({creationDate: {$lt: from}});

        dc.db.StatsDailyInstalls.remove({date: from}, (error, data) => {
            dc.db.StatsDailyInstalls.create({
                date: from,
                installs: {
                    total: activeUsers - oldUsers
                },
                uninstalls: {
                    total: 0
                },
                active: {
                    total: activeUsers
                }
            }, (error, data) => {
                resolve()
            })
        })

    });
}

async function resumeAndStore(from, until) {

    return new Promise(async (resolve, reject) => {
        let resume = new StatisticsResume(from);

        resume.channels = await aggregateChannels(from, until);
        resume.devices = await aggregateDevices(from, until);

        for (let i in resume.channels) {
            if (resume.channels[i] === "") {
                resume.channels.splice(i, 1);
                break;
            }
        }

        resume.subscribers = await distinct('subscriberId', from, until);
        resume.peaks.uniqueUsers = resume.subscribers.length;

        let sessions = await distinct('session', from, until);

        resume.peaks.sessions = sessions.length;

        //resume.peaks.playingTime = await playingTime(from, until, sessions);
        resume.peaks.playingTime = (3600 * (1 + Math.random() * 1.5)) * resume.peaks.sessions; // TODO
        resume.peaks.concurrency = resume.peaks.uniqueUsers; // TODO

        let devTot = resume.devices.ios + resume.devices.android + resume.devices.androidTv + resume.devices.browser;

        resume.devices.ios = resume.peaks.uniqueUsers * resume.devices.ios / devTot;
        resume.devices.android = resume.peaks.uniqueUsers * resume.devices.android / devTot;
        resume.devices.androidTv = resume.peaks.uniqueUsers * resume.devices.androidTv / devTot;
        resume.devices.browser = resume.peaks.uniqueUsers * resume.devices.browser / devTot;


        resume.avgPerSub = {
            playingTime: (3600 * (1 + Math.random() * 1.5)) * resume.peaks.sessions,
            channels: 0,
            screens: 0,
            device: 0
        };

        resolve(resume);
    }).then(_ => {
        return insertResume(_);
    })
}


function aggregateDevices(from, until) {
    return new Promise((resolve, reject) => {
        let res = {
            ios: 0,
            android: 0,
            androidTv: 0,
            browser: 0
        };

        dc.db.StatsLines.aggregate([
                {$match: {date: {$gte: from, $lte: until}, status: C.statusStates.PLAYING}},
                {$group: {_id: "$agent", count: {$sum: 1}}},
                {"$match": {"count": {"$gt": 1}}}
            ],
            (err, data) => {
                for (let device of data) {

                    if (parseDevice(device._id) === C.device.ANDROID_TV) {
                        res.androidTv = device.count
                    } else {
                        res.android = device.count
                    }

                }


                resolve(res);
            })
    });
}

function aggregateChannels(from, until) {
    return new Promise((resolve, reject) => {
        let res = [];

        dc.db.StatsLines.aggregate([
                {$match: {date: {$gte: from, $lte: until}, status: C.statusStates.PLAYING}},
                {$group: {_id: "$channelId", count: {$sum: 1}}},
                {"$match": {"count": {"$gt": 1}}}
            ],
            (err, data) => {
                for (let channel of data) {
                    res.push({id: channel._id, playingTime: channel.count * 5000});
                }

                resolve(res);
            })
    });
}


function distinct(field, from, until) {
    return new Promise((resolve, reject) => {
        dc.db.StatsLines.find({date: {$gte: from, $lte: until}}).distinct(field, (err, ids) => {
            if (err) {
                reject(err);
            } else {
                resolve(ids)
            }
        })
    });
}

function playingTimeFor(from, until, session) {
    return new Promise(async (resolve, reject) => {

        let first = await new Promise(async (resolve, reject) => {
            dc.db.StatsLines.find({
                date: {$gte: from, $lte: until},
                session: session,
                status: 'playing'
            }).sort({'date': 1}).limit(1).exec((err, line) => {
                if (line != null && line.length === 1) {
                    resolve(line[0])
                } else {
                    resolve(null)
                }
            });
        });

        let last = await new Promise(async (resolve, reject) => {
            dc.db.StatsLines.find({
                date: {$gte: from, $lte: until},
                session: session,
                status: 'playing'
            }).sort({'date': -1}).limit(1).exec((err, line) => {
                if (line != null && line.length === 1) {
                    resolve(line[0])
                } else {
                    resolve(null)
                }
            });
        });


        resolve(last.date.getTime() - first.date.getTime());

    });
}

class StatisticsResume {
    constructor(date) {
        this.subscribers = [];
        this.channels = [];
        this.operators = [];
        this.date = date;

        this.avgPerSub = {
            playingTime: 0,
            channels: 0,
            screens: 0,
            device: 0
        };

        this.peaks = {
            playingTime: 0,
            concurrency: 0,
            uniqueUsers: 0,
            sessions: 0
        };

        this.devices = {
            ios: 0,
            android: 0,
            androidTv: 0,
            browser: 0
        };
    }
}

function insertResume(resume) {
    return new Promise((resolve, reject) => {
        dc.db.StatsDailyPlayingResume.remove({date: resume.date}, function (error, data) {
            dc.db.StatsDailyPlayingResume.create(resume, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    });
}

function parseDevice(agent) {

    let mobile = agent.includes("Mobile");

    if (mobile && agent.includes("Android")) {
        return C.device.ANDROID;
    } else if (mobile) {
        return C.device.IOS;
    }

    if (agent.includes("Box")) {
        return C.device.ANDROID_TV;
    }

    return C.device.WEB;

}