/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/16/16.
 */
'use strict';
import path from 'path';
import nconf from 'nconf';
import bluebird from 'bluebird';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export default bluebird.coroutine(function *(vertex, fields) {
        let result = {};

        if(fields != null && fields.length != 0) {
            for (var i = 0; i < fields.length; i++) {
                if(fields[i].toLowerCase() == 'all') {
                    if(vertex.properties.skillId)
                        result.id = vertex.properties.skillId[0].value;
                    if(vertex.properties.name)
                        result.name = vertex.properties.name[0].value;
                    if(vertex.properties.description)
                        result.description = vertex.properties.description[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.skillId) {
                    result.id = vertex.properties.skillId[0].value;
                } else if(fields[i].toLowerCase() == 'name' && vertex.properties.name) {
                    result.name = vertex.properties.name[0].value;
                } else if(fields[i].toLowerCase() == 'description' && vertex.properties.description) {
                    result.description = vertex.properties.description[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                }
            }
        } else {
            result.id = vertex.properties.skillId[0].value;
        }

        return result;
    }
)