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
                    if(vertex.properties.contactId)
                        result.id = vertex.properties.contactId[0].value;
                    if(vertex.properties.type)
                        result.type = vertex.properties.type[0].value;
                    if(vertex.properties.value)
                        result.value = vertex.properties.value[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.categoryId) {
                    result.id = vertex.properties.contactId[0].value;
                } else if(fields[i].toLowerCase() == 'type' && vertex.properties.type) {
                    result.type = vertex.properties.type[0].value;
                } else if(fields[i].toLowerCase() == 'value' && vertex.properties.value) {
                    result.value = vertex.properties.value[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                }
            }
        } else {
            result.id = vertex.properties.contactId[0].value;
        }

        return result;
    }
)