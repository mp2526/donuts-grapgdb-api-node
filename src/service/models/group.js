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
import Asset from './asset';
import User from './user';
import Category from './category';

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
                    if(vertex.properties.groupId)
                        result.id = vertex.properties.groupId[0].value;
                    if(vertex.properties.name)
                        result.name = vertex.properties.name[0].value;
                    if(vertex.properties.description)
                        result.description = vertex.properties.description[0].value;
                    if(vertex.properties.image)
                        result.image = vertex.properties.image[0].value;
                    if(vertex.properties.privacy)
                        result.privacy = vertex.properties.privacy[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    
                    let owner = yield getOwner(client, vertex.id, fields[i].toLowerCase());
                    if(owner)
                        result.owner = owner;
                    
                    let members = yield getMembers(client, vertex.id, null);
                    if(members.length > 0)
                        result.members = members;

                    let assets = yield getAssets(client, vertex.id, userId, null);
                    if(assets.length > 0)
                        result.assets = assets;
                    
                    let categories = yield getCategories(client, vertex.id, fields[i].toLowerCase());
                    if(categories.length > 0)
                        result.categories = categories;
                    
                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.groupId) {
                    result.id = vertex.properties.groupId[0].value;
                } else if(fields[i].toLowerCase() == 'name' && vertex.properties.name) {
                    result.name = vertex.properties.name[0].value;
                } else if(fields[i].toLowerCase() == 'description' && vertex.properties.description) {
                    result.description = vertex.properties.description[0].value;
                } else if(fields[i].toLowerCase() == 'image' && vertex.properties.image) {
                    result.image = vertex.properties.image[0].value;
                } else if(fields[i].toLowerCase() == 'privacy' && vertex.properties.privacy) {
                    result.privacy = vertex.properties.privacy[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                } else if(fields[i].toLowerCase().startsWith('owner')) {
                    let owner = yield getOwner(client, vertex.id, fields[i]);
                    if(owner)
                        result.owner = owner;
                } else if(fields[i].toLowerCase().startsWith('members')) {
                    let members = yield getMembers(client, vertex.id, fields[i]);
                    if(members.length > 0)
                        result.members = members;
                } else if(fields[i].toLowerCase().startsWith('assets')) {
                    let assets = yield getAssets(client, vertex.id, userId, fields[i]);
                    if(assets.length > 0)
                        result.assets = assets;
                } else if(fields[i].toLowerCase().startsWith('categories')) {
                    let categories = yield getCategories(client, vertex.id, fields[i]);
                    if(categories.length > 0)
                        result.categories = categories;
                }
            }
        } else {
            result.id = vertex.properties.groupId[0].value;
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

    let person = yield gremlin`g.V(${vertexId}).in('owns')`;

    if(person.length > 0)
        return User.getUser(person[0], f);
    else
        return null
});

const getMembers = bluebird.coroutine(function * getMembers(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 7)
        f = fieldParser(field.substring(8, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let users = yield gremlin`g.V(${vertexId}).in('member')`;

    let result = [];
    for (var i = 0; i < users.length; i++) {
        let user = yield User.getUser(users[i], f);
        result.push(user);
    }
    return result;
});

const getAssets = bluebird.coroutine(function * getAssets(client, vertexId, userId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 6)
        f = fieldParser(field.substring(7, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let assets = yield gremlin`g.V(${vertexId}).out('contains')`;

    let result = [];
    for (var i = 0; i < assets.length; i++) {
        let asset = yield Asset(assets[i], userId, f);
        result.push(asset);
    }
    return result;
});

const getCategories = bluebird.coroutine(function * getCategories(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 10)
        f = fieldParser(field.substring(11, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let categories = yield gremlin`g.V(${vertexId}).out('categorized')`;

    let result = [];
    for (var i = 0; i < categories.length; i++) {
        let category = yield Category(categories[i], f);
        result.push(category);
    }
    return result;
});