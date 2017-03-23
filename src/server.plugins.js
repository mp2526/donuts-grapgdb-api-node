/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/17/16.
 */
'use strict';

import restify from 'restify';

export default function(server) {
    //Enable CORS plugin
    server.use(restify.CORS({ origins: [ '*' ] }));
    //Enable Query string parsing
    server.use(restify.queryParser());
    //Enable Gzip
    server.use(restify.gzipResponse());
}