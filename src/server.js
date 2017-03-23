/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/15/16.
 */
'use strict';
import restify from 'restify';
import path from 'path';
import nconf from 'nconf';

import routing from './server.routing';
import listen from './server.listen';
import plugins from './server.plugins';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

//Server setup
var server = restify.createServer({ name: nconf.get('name') });

//Plugins setup
plugins(server);

//Routing setup
routing(server);

//Start listening
listen(server);