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
import LinkPreview from './linkPreview';
import Comment from './comment';
import User from './user';
import Group from './group';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export default bluebird.coroutine(function *(vertex, userId, fields) {
        let result = {};

        if(fields != null && fields.length != 0) {
            const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));

            for (var i = 0; i < fields.length; i++) {
                if(fields[i].toLowerCase() == 'all') {
                    if(vertex.properties.postId)
                        result.id = vertex.properties.postId[0].value;
                    if(vertex.properties.details)
                        result.details = vertex.properties.details[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    if(vertex.properties.parentType)
                        result.parentType = vertex.properties.parentType[0].value;
                    
                    let parent = yield getParent(client, vertex.id,
                        vertex.properties.parentType[0].value.toLowerCase(), userId, fields[i].toLowerCase());
                    if(parent)
                        result.parent = parent;
                    
                    let owner = yield getOwner(client, vertex.id, fields[i].toLowerCase());
                    if(owner)
                        result.owner = owner;
                    
                    let linkPreviews = yield getLinkPreviews(client, vertex.id, fields[i].toLowerCase());
                    if(linkPreviews.length > 0)
                        result.linkPreviews = linkPreviews;
                    
                    let comments = yield getComments(client, vertex.id, fields[i].toLowerCase());
                    if(comments.length > 0)
                        result.comments = comments;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.postId) {
                    result.id = vertex.properties.postId[0].value;
                } else if(fields[i].toLowerCase() == 'details' && vertex.properties.details) {
                    result.details = vertex.properties.details[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                } else if(fields[i].toLowerCase() == 'parenttype' && vertex.properties.parentType) {
                    result.parentType = vertex.properties.parentType[0].value;
                } else if(fields[i].toLowerCase().startsWith('parent')) {
                    let parent = yield getParent(client, vertex.id,
                        vertex.properties.parentType[0].value.toLowerCase(), userId, fields[i]);
                    if(parent)
                        result.parent = parent;
                } else if(fields[i].toLowerCase().startsWith('owner')) {
                    let owner = yield getOwner(client, vertex.id, fields[i]);
                    if(owner)
                        result.owner = owner;
                } else if(fields[i].toLowerCase().startsWith('linkpreviews')) {
                    let linkPreviews = yield getLinkPreviews(client, vertex.id, fields[i]);
                    if(linkPreviews.length > 0)
                        result.linkPreviews = linkPreviews;
                } else if(fields[i].toLowerCase().startsWith('comments')) {
                    let comments = yield getComments(client, vertex.id, fields[i]);
                    if(comments.length > 0)
                        result.comments = comments;
                }
            }
        } else {
            result.id = vertex.properties.postId[0].value;
        }

        return result;
    }
)

const getParent = bluebird.coroutine(function * getParent(client, vertexId, type, userId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 6)
        f = fieldParser(field.substring(7, field.length - 1));

    const gremlin = makeTemplateTag(client);

    if(type == 'user') {
        let person = yield gremlin`g.V(${vertexId}).in('shared')`;

        if(person.length > 0)
            return User.getUser(person[0], f);
    } else if(type == 'group') {
        let group = yield gremlin`g.V(${vertexId}).in('parented')`;

        if(group.length > 0)
            return Group(group[0], userId, f);
    }

    return null
});

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

const getLinkPreviews = bluebird.coroutine(function * getLinkPreviews(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 10)
        f = fieldParser(field.substring(11, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let linkPreviews = yield gremlin`g.V(${vertexId}).out('link')`;

    let result = [];
    for (var i = 0; i < linkPreviews.length; i++) {
        let linkPreview = yield LinkPreview(linkPreviews[i], f);
        result.push(linkPreview);
    }
    return result;
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
        let comment = yield Comment.getComment(comments[i], f);
        result.push(comment);
    }
    return result;
});