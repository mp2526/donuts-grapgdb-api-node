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
import Skill from './skill';
import Contact from './contact';
import Favorite from './favorite';
import Group from './group';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

const getUser = bluebird.coroutine(function *(vertex, fields) {
        let result = {};

        if(fields != null && fields.length != 0) {
            const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));

            for (var i = 0; i < fields.length; i++) {
                if(fields[i].toLowerCase() == 'all') {
                    if(vertex.properties.userId)
                        result.id = vertex.properties.userId[0].value;
                    if(vertex.properties.name)
                        result.name = vertex.properties.name[0].value;
                    if(vertex.properties.firstName)
                        result.firstName = vertex.properties.firstName[0].value;
                    if(vertex.properties.lastName)
                        result.lastName = vertex.properties.lastName[0].value;
                    if(vertex.properties.jobTitle)
                        result.jobTitle = vertex.properties.jobTitle[0].value;
                    if(vertex.properties.createdDate)
                        result.createdDate = vertex.properties.createdDate[0].value;
                    if(vertex.properties.division)
                        result.division = vertex.properties.division[0].value;
                    if(vertex.properties.description)
                        result.description = vertex.properties.description[0].value;
                    if(vertex.properties.location)
                        result.location = vertex.properties.location[0].value;
                    if(vertex.properties.image)
                        result.image = vertex.properties.image[0].value;

                    let groups = yield getGroups(client, vertex.id, vertex.properties.userId, fields[i].toLowerCase());
                    if(groups.length > 0)
                        result.groups = groups;

                    let skills = yield getSkills(client, vertex.id, fields[i].toLowerCase());
                    if(skills.length > 0)
                        result.skills = skills;

                    let contacts = yield getContacts(client, vertex.id, fields[i].toLowerCase());
                    if(contacts.length > 0)
                        result.contacts = contacts;

                    let favorites = yield getFavorites(client, vertex.id, fields[i].toLowerCase());
                    if(favorites.length > 0)
                        result.favorites = favorites;

                    let following = yield getFollowing(client, vertex.id, fields[i].toLowerCase());
                    if(following.length > 0)
                        result.following = following;

                    let followedBy = yield getFollowedBy(client, vertex.id, fields[i].toLowerCase());
                    if(followedBy.length > 0)
                        result.followedBy = followedBy;

                    return result;
                }
                if(fields[i].toLowerCase() == 'id' && vertex.properties.userId) {
                    result.id = vertex.properties.userId[0].value;
                } else if(fields[i].toLowerCase() == 'name' && vertex.properties.name) {
                    result.name = vertex.properties.name[0].value;
                } else if(fields[i].toLowerCase() == 'firstname' && vertex.properties.firstName) {
                    result.firstName = vertex.properties.firstName[0].value;
                } else if(fields[i].toLowerCase() == 'lastname' && vertex.properties.lastName) {
                    result.lastName = vertex.properties.lastName[0].value;
                } else if(fields[i].toLowerCase() == 'jobtitle' && vertex.properties.jobTitle) {
                    result.jobTitle = vertex.properties.jobTitle[0].value;
                } else if(fields[i].toLowerCase() == 'createddate' && vertex.properties.createdDate) {
                    result.createdDate = vertex.properties.createdDate[0].value;
                } else if(fields[i].toLowerCase() == 'division' && vertex.properties.division) {
                    result.division = vertex.properties.division[0].value;
                } else if(fields[i].toLowerCase() == 'description' && vertex.properties.description) {
                    result.description = vertex.properties.description[0].value;
                } else if(fields[i].toLowerCase() == 'location' && vertex.properties.location) {
                    result.location = vertex.properties.location[0].value;
                } else if(fields[i].toLowerCase() == 'image' && vertex.properties.image) {
                    result.image = vertex.properties.image[0].value;
                } else if(fields[i].toLowerCase().startsWith('groups')) {
                    let groups = yield getGroups(client, vertex.id, vertex.properties.userId, fields[i]);
                    if(groups.length > 0)
                        result.groups = groups;
                } else if(fields[i].toLowerCase().startsWith('skills')) {
                    let skills = yield getSkills(client, vertex.id, fields[i]);
                    if(skills.length > 0)
                        result.skills = skills;
                } else if(fields[i].toLowerCase().startsWith('contacts')) {
                    let contacts = yield getContacts(client, vertex.id, fields[i]);
                    if(contacts.length > 0)
                        result.contacts = contacts;
                } else if(fields[i].toLowerCase().startsWith('favorites')) {
                    let favorites = yield getFavorites(client, vertex.id, fields[i]);
                    if(favorites.length > 0)
                        result.favorites = favorites;
                } else if(fields[i].toLowerCase().startsWith('following')) {
                    let following = yield getFollowing(client, vertex.id, fields[i]);
                    if(following.length > 0)
                        result.following = following;
                } else if(fields[i].toLowerCase().startsWith('followedby')) {
                    let followedBy = yield getFollowedBy(client, vertex.id, fields[i]);
                    if(followedBy.length > 0)
                        result.followedBy = followedBy;
                }
            }
        } else {
            result.id = vertex.properties.userId[0].value;
        }

        return result;
    }
)

const getGroups = bluebird.coroutine(function * getGroups(client, vertexId, userId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 6)
        f = fieldParser(field.substring(7, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let groups = yield gremlin`g.V(${vertexId}).out('member')`;

    let result = [];
    for (var i = 0; i < groups.length; i++) {
        let group = yield Group(groups[i], userId, f);
        result.push(group);
    }
    return result;
});

const getSkills = bluebird.coroutine(function * getSkills(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 6)
        f = fieldParser(field.substring(7, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let skills = yield gremlin`g.V(${vertexId}).out('obtained')`;

    let result = [];
    for (var i = 0; i < skills.length; i++) {
        let skill = yield Skill(skills[i], f);
        result.push(skill);
    }
    return result;
});

const getContacts = bluebird.coroutine(function * getContacts(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 8)
        f = fieldParser(field.substring(9, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let contacts = yield gremlin`g.V(${vertexId}).out('has')`;

    let result = [];
    for (var i = 0; i < contacts.length; i++) {
        let contact = yield Contact(contacts[i], f);
        result.push(contact);
    }
    return result;
});

const getFavorites = bluebird.coroutine(function * getFavorites(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 9)
        f = fieldParser(field.substring(10, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let favorites = yield gremlin`g.V(${vertexId}).out('favorited')`;

    let result = [];
    for (var i = 0; i < favorites.length; i++) {
        let favorite = yield Favorite(favorites[i], f);
        result.push(favorite);
    }
    return result;
});

const getFollowing = bluebird.coroutine(function * getFollowing(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 9)
        f = fieldParser(field.substring(10, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let users = yield gremlin`g.V(${vertexId}).out('follows')`;

    let result = [];
    for (var i = 0; i < users.length; i++) {
        let user = yield getUser(users[i], f);
        result.push(user);
    }
    return result;
});

const getFollowedBy = bluebird.coroutine(function * getFollowedBy(client, vertexId, field) {
    var f = null;

    if(field && field.toLowerCase() == 'all')
        f = ['all'];
    else if(field && field.length > 10)
        f = fieldParser(field.substring(11, field.length - 1));

    const gremlin = makeTemplateTag(client);

    let users = yield gremlin`g.V(${vertexId}).in('follows')`;

    let result = [];
    for (var i = 0; i < users.length; i++) {
        let user = yield getUser(users[i], f);
        result.push(user);
    }
    return result;
});

export default {
    getUser
}