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
                    if(vertex.properties.linkPreviewId)
                        result.id = vertex.properties.linkPreviewId[0].value;
                    if(vertex.properties.title)
                        result.title = vertex.properties.title[0].value;
                    if(vertex.properties.url)
                        result.url = vertex.properties.url[0].value;
                    if(vertex.properties.imageUrl)
                        result.imageUrl = vertex.properties.imageUrl[0].value;
                    if(vertex.properties.description)
                        result.description = vertex.properties.description[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;

                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.linkPreviewId) {
                    result.id = vertex.properties.favoriteId[0].value;
                } else if(fields[i].toLowerCase() == 'title' && vertex.properties.title) {
                    result.title = vertex.properties.title[0].value;
                } else if(fields[i].toLowerCase() == 'url' && vertex.properties.url) {
                    result.url = vertex.properties.url[0].value;
                } else if(fields[i].toLowerCase() == 'imageurl' && vertex.properties.imageUrl) {
                    result.imageUrl = vertex.properties.imageUrl[0].value;
                } else if(fields[i].toLowerCase() == 'description' && vertex.properties.description) {
                    result.description = vertex.properties.description[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                }
            }
        } else {
            result.id = vertex.properties.linkPreviewId[0].value;
        }

        return result;
    }
)