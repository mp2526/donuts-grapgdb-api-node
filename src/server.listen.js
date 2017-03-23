/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/17/16.
 */
'use strict';

import nconf from 'nconf';

export default function(server) {
    server.listen(nconf.get('request:port'), function() {
        console.log('%s listening at %s:%s on %s', server.name, nconf.get('request:url'),
            nconf.get('request:port'), nconf.get('NODE_ENV'));
    });
}