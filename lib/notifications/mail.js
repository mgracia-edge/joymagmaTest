/*
 * Copyright (C) 2018 EDGE TECHNOLOGY, S.A.
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

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
