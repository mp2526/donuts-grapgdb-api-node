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
import { createClient, makeTemplateTag } from 'gremlin';

import fieldParser from '../../util/fieldParser';
import User from './user';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

const getComment = bluebird.coroutine(function *(vertex, fields) {
        let result = {};

        if(fields != null && fields.length != 0) {
            const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));

            for (var i = 0; i < fields.length; i++) {
                if(fields[i].toLowerCase() == 'all') {
                    if(vertex.properties.commentId)
                        result.id = vertex.properties.commentId[0].value;
                    if(vertex.properties.details)
                        result.details = vertex.properties.details[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;

                    let owner = yield getOwner(client, vertex.id, fields[i].toLowerCase());
                    if(owner)
                        result.owner = owner;

                    let comments = yield getComments(client, vertex.id, fields[i].toLowerCase());
                    if(comments.length > 0)
                        result.comments = comments;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.commentId) {
                    result.id = vertex.properties.commentId[0].value;
                } else if(fields[i].toLowerCase() == 'details' && vertex.properties.details) {
                    result.details = vertex.properties.details[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                } else if(fields[i].toLowerCase().startsWith('owner')) {
                    let owner = yield getOwner(client, vertex.id, fields[i]);
                    if(owner)
                        result.owner = owner;
                } else if(fields[i].toLowerCase().startsWith('comments')) {
                    let comments = yield getComments(client, vertex.id, fields[i]);
                    if(comments.length > 0)
                        result.comments = comments;
                }
            }
        } else {
            result.id = vertex.properties.commentId[0].value;
        }

        return result;
    }
)

const getOwner = bluebird.coroutine(function * getOwner(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 5)
        f = fieldParser(field.substring(6, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let person = yield gremlin`g.V(${vertexId}).in('shared')`;

    if(person.length > 0)
        return User.getUser(person[0], f);
    else
        return null
});

const getComments = bluebird.coroutine(function * getComments(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 8)
        f = fieldParser(field.substring(9, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let comments = yield gremlin`g.V(${vertexId}).out('has')`;

    let result = [];
    for (var i = 0; i < comments.length; i++) {
        let comment = yield getComment(comments[0], f);
        result.push(comment);
    }
    return result;
});

export default {
    getComment
}