exports.C = {
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
    },
    aggregation: {
        PER_MIN: "per_minute",
        PER_5MIN: "per_5minute",
        PER_QTR_HR: "pre_quarter_hr",
        PER_HLF_LF: "per_half_hr",
        PER_HR: "per_hr",
        PER_DAY: "per_day"
    }
};

exports.getDateRange = function (date, aggregation) {
    let from = new Date(date.getTime() - 60000);
    from.setSeconds(0)
    from.setMilliseconds(0);

    let to = new Date(from);

    switch (aggregation) {
        case exports.C.aggregation.PER_MIN: {
            to.setSeconds(60);
            break;
        }
        case exports.C.aggregation.PER_5MIN: {
            to.setSeconds(300);
            break;
        }
        case exports.C.aggregation.PER_QTR_HR: {
            to.setSeconds(900);
            break;
        }
        case exports.C.aggregation.PER_HLF_LF: {
            to.setSeconds(1800);
            break;
        }
        case exports.C.aggregation.PER_HR: {
            to.setSeconds(3600);
            break;
        }
        case exports.C.aggregation.PER_DAY: {
            to.setSeconds(86400);
            break;
        }
        default: {
            throw new Error("Aggregation not implemented");
        }
    }

    return {
        from,
        to
    }

}

exports.aggInc = function (aggregation) {
    switch (aggregation) {
        case exports.C.aggregation.PER_MIN: {
            return(60);
        }
        case exports.C.aggregation.PER_5MIN: {
            return(300);
        }
        case exports.C.aggregation.PER_QTR_HR: {
            return(900);
        }
        case exports.C.aggregation.PER_HLF_LF: {
            return(1800);
        }
        case exports.C.aggregation.PER_HR: {
            return(3600);
        }
        case exports.C.aggregation.PER_DAY: {
            return(86400);
        }
        default: {
            throw new Error("Aggregation not implemented");
        }
    }
}