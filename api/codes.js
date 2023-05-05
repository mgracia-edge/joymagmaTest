/*
 * Copyright (C) 2019 EDGE TECHNOLOGY, S.A.
 *
 *  NOTICE:  All information contained herein is, and remains the property of
 * EDGE TECHNOLOGY, S.A ; if any.
 *
 *  The intellectual and technical concepts contained herein are proprietary to EDGE TECHNOLOGY, S.A
 *  and its suppliers and may be covered by U.S. and Foreign Patents, patents in
 *  process, and are protected by trade secret or copyright law. Dissemination of this
 *  information or reproduction of this material is strictly forbidden unless prior written
 *  permission is obtained from EDGE TECHNOLOGY, S.A.
 */

const services = {
    USER_CREATION: "account.users",
    ACCOUNTS_CREATION: "account.sub_accounts",
    PRIVATE_CLOUD_LIVE: "private_cloud.live",
    PRIVATE_CLOUD_LIVE_CLIPPING: "private_cloud.live.clipping",
    PRIVATE_CLOUD_VOD: "private_cloud.VOD",
    MAGMA_LIVE: "magma.live",
    MAGMA_LIVE_CLIPPING: "magma.live.clipping",
    MAGMA_VOD: "magma.VOD",
    CMS_OTT: "cms.ott",
    CMS_EDITORIAL: "cms.editorial",
    STATS_KIBANA: "stats.kibana"
};

const users_permissions = {
    USER_ADMIN: "user.admin",
    PRIVATE_CLOUD_ADMIN: "privatecloud.admin",
    PRODUCTS_WRITE: "products.write",
    PRODUCTS_READ: "products.read",
    CHANNELS_WRITE: "channels.write",
    CHANNELS_READ: "channels.read",
    BANNERS_WRITE: "banners.write",
    BANNERS_READ: "banners.read",
    STATS_ACCESS: "stats.access",
    SUBSCRIBERS_READ: "subscribers.read"
};

const errorCode = {

    /**
     * From 0X0000 to 0x0049
     */
    database: {
        DISCONNECTED: {
            code: 0X0001,
            message: "Data connection failed",
            httpCode: 503
        },
        ERROR: {
            code: 0X0010,
            message: "Data connection unknown error",
            httpCode: 500
        },
        OPERATION_ERROR: {
            code: 0X0011,
            message: "Data query error",
            httpCode: 500
        },
        DUPLICATED: {
            code: 0X0012,
            message: "Duplicated entity",
            httpCode: 409
        }
    },
    /**
     * From 0X0100 to 0X0149
     */
    userRights: {
        BAD_AUTHENTICATION: {
            code: 0X0100,
            message: "Bad authentication",
            httpCode: 401
        },
        PERMISSION_DENIED: {
            code: 0X0101,
            message: "Permission denied",
            httpCode: 403
        },
        NON_EXISTENT_USER: {
            code: 0X0102,
            message: "Non existent user",
            httpCode: 401
        },
        SESSION_EXPIRED: {
            code: 0X0103,
            message: "Session has expired",
            httpCode: 401
        }
    },
    /**
     * From 0X0150 to 0X199
     */
    connection: {
        BAD_REQUEST: {
            code: 0X0150,
            message: "Bad request",
            httpCode: 400
        },
        TIMEOUT: {
            code: 0X0151,
            message: "Connection time out",
            httpCode: 599
        },
        EMPTY_SESSION: {
            code: 0X0152,
            message: "No session data",
            httpCode: 401
        },
        UNKNOWN: {
            code: 0X0199,
            message: "Unknown connection error",
            httpCode: 500
        },
    },
    /**
     * From 0X0200 to 0X0249
     */
    request: {
        BAD_REQUEST: {
            code: 0X0200,
            message: "Bad request",
            httpCode: 400
        },
        NOT_JSON: {
            code: 0X0201,
            message: "Response is not JSON",
            httpCode: 415
        }
    },
    /**
     * From 0X0300 to 0X0349
     */
    operation: {
        OPERATION_HAS_FAILED: {
            code: 0X300,
            message: "The Requested operation has failed",
            httpCode: 500

        },
        OPERATION_NOT_IMPLEMENTED: {
            code: 0X301,
            message: "Requested operation not yet implemented",
            httpCode: 501
        },
        OPERATION_INVALID_PARAMETERS: {
            code: 0X302,
            message: "Operation has failed by using invalid parameters when calling the method",
            httpCode: 400

        },
        TARGET_NOT_FOUND: {
            code: 0X303,
            message: "The target was not found",
            httpCode: 404

        },
        DUPLICATED_ENTITY: {
            code: 0X304,
            message: "Cannot create, entity already exists.",
            httpCode: 409

        },
        OVERLAPPING_BANNER: {
            code: 0X304,
            message: "Cannot create, another banner is active given times.",
            httpCode: 409

        },
        NOT_MODIFY: {
            code: 0X305,
            message: "Not Modify.",
            httpCode: 304
        }
    }
};

/** Checks if error codes are unique **/

(function checkCodes(collections) {
    let codesSoFar = [];

    checkProperties(collections);

    // Inner Functions

    function checkProperties(collection) {
        for (let i in collection) {
            if (typeof collection[i].code !== "undefined") {
                if (codeExists(collection[i].code)) {
                    console.warn(new Error("Error code duplicated for " + i));
                } else {
                    codesSoFar.push(collection[i].code);
                }
            } else {
                checkProperties(collection[i]);
            }
        }
    }

    function codeExists(code) {
        for (let i = 0; i < codesSoFar.length; i++) {
            if (codesSoFar[i] === code) return true;
        }

        return false;
    }

})(errorCode);

exports.error = errorCode;
exports.users_permissions = users_permissions;
exports.services = services;