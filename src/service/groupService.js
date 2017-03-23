/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/21/16.
 */
'use strict';

import { createClient, makeTemplateTag } from 'gremlin';
import restify from 'restify';
import path from 'path';
import nconf from 'nconf';
import bluebird from 'bluebird';
import uuid from 'node-uuid';

import Group from './models/group';
import User from './models/user';
import fieldParser from '../util/fieldParser';

//TODO: Get the logged in user from the security token
var userId = '59d1280ee9df';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getGroups = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let ids = req.query.ids;

    if(ids && ids.length > 0) {
        gremlin`g.V().hasLabel('Group').has('groupId', within(${ids}))`
            .then((groups) => {
                return bluebird.coroutine(function*(groups, userId, fields) {
                    let result = [];
                    for (let i = 0; i < groups.length; i++) {
                        let group = yield Group(groups[i], userId, fields);
                        result.push(group);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(groups, userId, fields);
            })
            .then((result) => {
                if(!result)
                    res.send(204, null);
                else
                    res.send(result);
            }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });
    } else {
        gremlin`g.V().hasLabel('Group').order().by('name', incr).limit(25)`
            .then((groups) => {
                return bluebird.coroutine(function*(groups, userId, fields) {
                    let result = [];
                    for (let i = 0; i < groups.length; i++) {
                        let group = yield Group(groups[i], userId, fields);
                        result.push(group);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(groups, userId, fields);
            })
            .then((result) => {
                if(!result)
                    res.send(204, null);
                else
                    res.send(result);
            }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });
    }

    return next();
};

export const postGroup = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let group = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_group = graph.addVertex(label, 'Group');
        v_group.property('groupId', ${result.id});

        if(${group.name} != null) {
            v_group.property('name', ${group.name});
        }
        if(${group.description} != null) {
            v_group.property('description', ${group.description});
        }
        if(${group.image} != null) {
            v_group.property('image', ${group.image});
        }
        if(${group.privacy} != null) {
            v_group.property('privacy', ${group.privacy});
        }
        v_group.property('createdDate', ${result.createdDate});
        
        v_user = g.V().hasLabel('User').has('userId', ${group.owner.id});
        if(v_user.hasNext()) {
            v_user.get().addEdge('owns', v_group);
        }
    `.then(() => {
        res.send(result);
    })
    .catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export const getNewGroups = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "new" group
    gremlin`g.V().hasLabel('Group').order().by('createdDate', decr).limit(10)`
        .then((groups) => {
            return bluebird.coroutine(function*(groups, userId, fields) {
                let result = [];
                for (let i = 0; i < groups.length; i++) {
                    let group = yield Group(groups[i], userId, fields);
                    result.push(group);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(groups, userId, fields);
        })
        .then((result) => {
            if(!result)
                res.send(204, null);
            else
                res.send(result);
        }).catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export const getPopularGroups = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "popular" group
    gremlin`g.V().hasLabel('Group').limit(10)`
        .then((groups) => {
            return bluebird.coroutine(function*(groups, userId, fields) {
                let result = [];
                for (let i = 0; i < groups.length; i++) {
                    let group = yield Group(groups[i], userId, fields);
                    result.push(group);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(groups, userId, fields);
        })
        .then((result) => {
            if(!result)
                res.send(204, null);
            else
                res.send(result);
        }).catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export const getGroup = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Group', 'groupId', ${req.params.groupid})`
        .then((groups) => {
            return Group(groups[0], userId, fields);
        })
        .then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const putGroup = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let group = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_group = g.V().has('Group', 'groupId', ${req.params.groupid});
        if(v_group.hasNext()) {
            v = v_group.next();
            if(${group.name} != null) {
                v.property('name', ${group.name});
            }
            if(${group.description} != null) {
                v.property('description', ${group.description});
            }
            if(${group.image} != null) {
                v.property('image', ${group.image});
            }
            if(${group.privacy} != null) {
                v.property('privacy', ${group.privacy});
            }
            
            if(${group.owner} != null) {
                ie = v.edges(Direction.IN, 'owns');
                
                if (ie.hasNext())
                    ie.next().remove();
                    
                v_user = g.V().has('user'. 'userId' ${group.owner.id});
                if(v_user.hasNext())
                    v_user.next().addEdge('owns', v);
            }
        }
    `.then(() => {
            res.send(200);
        })
        .catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const postGroupCategories = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let categories = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_group = g.V().has('Group', 'groupId', ${req.params.groupid})
        if(v_group.hasNext()) {
            v = v_group.next();
            categories = ${categories};
            for(def i=0; i < categories.size(); i++) {
                v_category = g.V().hasLabel('Category').has('categoryId', categories[i].id);
                if(v_category.hasNext()) {
                    v.addEdge('categorized', v_category.next());
                }
            }
        }
    `.then(() => {
            res.send(200);
        })
        .catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const deleteGroupCategory = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        gt_category = g.V().has('Group', 'groupId', ${req.params.groupid}).outE('categorized').as('a').inV().has('Category', 'categoryId', ${req.params.categoryId}).select('a');
        if(gt_category.hasNext()) {
            gt_category.next().remove();
        }
    `.then(() => {
            res.send(200);
        })
        .catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const getGroupFeed = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: fix where activities come from
    gremlin`g.V().has('Group', 'groupId', ${req.params.groupid})`
        .then((groups) => {
            return Group(groups[0], userId, fields);
        })
        .then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });
    
    return next();
};

export const postGroupFeed = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let post = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_group = g.V().has('Group', 'groupId', ${req.params.groupid});
        
        if(v_group.hasNext()) {
            v_post = graph.addVertex(label, 'Post')
            v_post.property('postId', ${result.id});

            if(${post.details} != null) {
                v_post.property('details', ${post.details});
            }
            v_post.property('createdDate', ${result.createdDate});
            
            v_group.next().addEdge('parented', v_post);
            
            v_user = g.V().has('User', 'userId', ${post.owner.id});
            
            if(v_user.hasNext()) {
                v_user.next().addEdge('shared', v_post);
            }
        }
    `.then(() => {
        res.send(result);
    })
    .catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export const getGroupsMembers = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Group', 'groupId', ${req.params.groupid}).out('member').hasLabel('User')`
        .then((users) => {
            return bluebird.coroutine(function*(users, fields) {
                let result = [];
                for (let i = 0; i < users.length; i++) {
                    let user = yield User.getUser(users[i], fields);
                    result.push(user);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(users, fields);
        })
        .then((result) => {
            if(!result)
                res.send(204, null);
            else
                res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const postGroupsMembers = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let users = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_group = g.V().has('Group', 'groupId', ${req.params.groupid})
        if(v_group.hasNext()) {
            users = ${users};
            for(def i=0; i < users.size(); i++) {
                v_user = g.V().hasLabel('User').has('userId', users[i].id);
                if(v_user.hasNext()) {
                    v_group.next().addEdge('member', v_user.next());
                }
            }
        }
    `.then(() => {
        res.send(200);
    })
    .catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export const deleteGroupsMember = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        gt_member = g.V().has('Group', 'groupId', ${req.params.groupid}).outE('member').as('a').inV().has('User', 'userId', ${req.params.userid}).select('a');
        if(gt_member.hasNext()) {
            gt_member.next().remove();
        }
    `.then(() => {
        res.send(200);
    })
    .catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export default {
    getGroups,
    postGroup,
    getGroup,
    putGroup,
    postGroupCategories,
    deleteGroupCategory,
    getGroupFeed,
    postGroupFeed,
    getGroupsMembers,
    postGroupsMembers,
    deleteGroupsMember,
    getNewGroups,
    getPopularGroups
}