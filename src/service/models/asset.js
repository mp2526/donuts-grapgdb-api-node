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
import Category from './category';
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
                    if(vertex.properties.assetId)
                        result.id = vertex.properties.assetId[0].value;
                    if(vertex.properties.mimeType)
                        result.mimeType = vertex.properties.mimeType[0].value;
                    if(vertex.properties.name)
                        result.name = vertex.properties.name[0].value;
                    if(vertex.properties.description)
                        result.description = vertex.properties.description[0].value;
                    if(vertex.properties.thumbnail)
                        result.thumbnail = vertex.properties.thumbnail[0].value;
                    if(vertex.properties.fileName)
                        result.fileName = vertex.properties.fileName[0].value;
                    if(vertex.properties.url)
                        result.url = vertex.properties.url[0].value;
                    if(vertex.properties.size)
                        result.size = vertex.properties.size[0].value;
                    if(vertex.properties.likeCount)
                        result.likeCount = vertex.properties.likeCount[0].value;
                    if(vertex.properties.openCount)
                        result.openCount = vertex.properties.openCount[0].value;
                    if(vertex.properties.starCount)
                        result.starCount = vertex.properties.starCount[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    if(vertex.properties.modifiedDate)
                        result.modifiedDate = vertex.properties.modifiedDate[0].value;
                    if(vertex.properties.parentType)
                        result.parentType = vertex.properties.parentType[0].value;

                    let liked = yield getLiked(client, vertex.id, userId);
                    if(liked)
                        result.isLiked = liked;
                    
                    let parent = yield getParent(client, vertex.id,
                        vertex.properties.parentType[0].value.toLowerCase(), userId, fields[i].toLowerCase());
                    if(parent)
                        result.parent = parent;
                    
                    let owner = yield getOwner(client, vertex.id, fields[i].toLowerCase());
                    if(owner)
                        result.owner = owner;
                    
                    let modifier = yield getModifier(client, vertex.id, fields[i].toLowerCase());
                    if(modifier)
                        result.modifier = modifier;
                    
                    let categories = yield getCategories(client, vertex.id, fields[i].toLowerCase());
                    if(categories.length > 0)
                        result.categories = categories;
                    
                    let comments = yield getComments(client, vertex.id, fields[i].toLowerCase());
                    if(comments.length > 0)
                        result.comments = comments;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.assetId) {
                    result.id = vertex.properties.assetId[0].value;
                } else if(fields[i].toLowerCase() == 'mimetype' && vertex.properties.mimeType) {
                    result.mimeType = vertex.properties.mimeType[0].value;
                } else if(fields[i].toLowerCase() == 'name' && vertex.properties.name) {
                    result.name = vertex.properties.name[0].value;
                } else if(fields[i].toLowerCase() == 'description' && vertex.properties.description) {
                    result.description = vertex.properties.description[0].value;
                } else if(fields[i].toLowerCase() == 'thumbnail' && vertex.properties.thumbnail) {
                    result.thumbnail = vertex.properties.thumbnail[0].value;
                } else if(fields[i].toLowerCase() == 'filename' && vertex.properties.fileName) {
                    result.fileName = vertex.properties.fileName[0].value;
                } else if(fields[i].toLowerCase() == 'url' && vertex.properties.url) {
                    result.url = vertex.properties.url[0].value;
                } else if(fields[i].toLowerCase() == 'size' && vertex.properties.size) {
                    result.size = vertex.properties.size[0].value;
                } else if(fields[i].toLowerCase() == 'isliked') {
                    let liked = yield getLiked(client, vertex.id, userId);
                    if(liked)
                        result.isLiked = liked;
                } else if(fields[i].toLowerCase() == 'likecount' && vertex.properties.likeCount) {
                    result.likeCount = vertex.properties.likeCount[0].value;
                } else if(fields[i].toLowerCase() == 'opencount' && vertex.properties.openCount) {
                    result.openCount = vertex.properties.openCount[0].value;
                } else if(fields[i].toLowerCase() == 'starcount' && vertex.properties.starCount) {
                    result.starCount = vertex.properties.starCount[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                } else if(fields[i].toLowerCase() == 'modifieddate' && vertex.properties.modifiedDate) {
                    result.modifiedDate = vertex.properties.modifiedDate[0].value;
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
                } else if(fields[i].toLowerCase().startsWith('modifier')) {
                    let modifier = yield getModifier(client, vertex.id, fields[i]);
                    if(modifier)
                        result.modifier = modifier;
                } else if(fields[i].toLowerCase().startsWith('categories')) {
                    let categories = yield getCategories(client, vertex.id, fields[i]);
                    if(categories.length > 0)
                        result.categories = categories;
                } else if(fields[i].toLowerCase().startsWith('comments')) {
                    let comments = yield getComments(client, vertex.id, fields[i]);
                    if(comments.length > 0)
                        result.comments = comments;
                }
            }
        } else {
            result.id = vertex.properties.assetId[0].value;
        }

        return result;
    }
)

const getLiked = bluebird.coroutine(function * getLiked(client, vertexId, userId) {
    if (userId) {
        const gremlin = makeTemplateTag(client);

        //yield to async gremlin server call to determine if a "like" edge exists for the logged in user and this asset
        let liked = yield gremlin`g.V(${vertexId}).in('liked').has('User', 'userId', ${userId})`;

        return liked != null && liked.length > 0;
    } else
        return null;
});

const getParent = bluebird.coroutine(function * getParent(client, vertexId, type, userId, field) {
    let f = null;

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
        let group = yield gremlin`g.V(${vertexId}).in('contains')`;

        if(group.length > 0)
            return Group(group[0], userId, f);
    }

    return null
});

const getOwner = bluebird.coroutine(function * getOwner(client, vertexId, field) {
    let f = null;

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

const getModifier = bluebird.coroutine(function * getModifier(client, vertexId, field) {
    let f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 8)
        f = fieldParser(field.substring(9, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let person = yield gremlin`g.V(${vertexId}).in('modified')`;

    if(person.length > 0)
        return User.getUser(person[0], f);
    else
        return null
});

const getCategories = bluebird.coroutine(function * getCategories(client, vertexId, field) {
    let f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 10)
        f = fieldParser(field.substring(11, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let categories = yield gremlin`g.V(${vertexId}).out('categorized')`;

    let result = [];
    for (let i = 0; i < categories.length; i++) {
        let category = yield Category(categories[i], f);
        result.push(category);
    }
    return result;
});

const getComments = bluebird.coroutine(function * getComments(client, vertexId, field) {
    let f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 8)
        f = fieldParser(field.substring(9, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let comments = yield gremlin`g.V(${vertexId}).out('has')`;

    let result = [];
    for (let i = 0; i < comments.length; i++) {
        let comment = yield Comment.getComment(comments[i], f);
        result.push(comment);
    }
    return result;
});