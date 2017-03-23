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

import User from './models/user';
import Favorite from './models/favorite';
import Skill from './models/skill';
import fieldParser from '../util/fieldParser';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getUsers = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let ids = req.query.ids;

    if(ids && ids.length > 0) {
        gremlin`g.V().hasLabel('User').has('userId', within(${ids}))`
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
    } else {
        gremlin`g.V().hasLabel('User').limit(20)`
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
    }

    return next();
};

export const getNewUsers = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "new" user
    gremlin`g.V().hasLabel('User').order().by('createdDate', decr).limit(10)`
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

export const getPopularUsers = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "popular" user
    gremlin`g.V().hasLabel('User').limit(10)`
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

export const getUser = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId})`
        .then((users) => {
            return User.getUser(users[0], fields);
        })
        .then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const getUserFavorites = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId}).outE('favorited').inV()`
        .then((favorites) => {
            return bluebird.coroutine(function*(favorites, fields) {
                let result = [];
                for (let i = 0; i < favorites.length; i++) {
                    let favorite = yield Favorite(favorites[i], fields);
                    result.push(favorite);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(favorites, fields);
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

export const getUserFeed = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token
    
    return next();
};

export const postUserFeed = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let post = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);
    
    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`
        v_user = g.V().has('User', 'userId', ${userId});
        if(v_user.hasNext()) {
            v_post = graph.addVertex(label, 'Post', 'postId', ${result.id}, 'details', ${post.details}, 'createdDate', ${result.createdDate});
            v_user.next().addEdge('parented', v_post);
            v_owner = g.V().has('User', 'userId', ${post.owner.id});
            
            if(v_owner.hasNext()) {
                v_owner.next().addEdge('shared', v_post);
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

export const getUserFollowedBy = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId}).inE('follows').outV()`
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

export const getUserFollowing = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token
    
    gremlin`g.V().has('User', 'userId', ${userId}).outE('follows').inV()`
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

export const getUserRecentItems = (req, res, next) => {
    //TODO: implement this
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId}).inE('foloows').outV()`
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

export const getUserRecommendations = (req, res, next) => {
    //TODO: implement this
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId}).inE('follows').outV()`
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

export const getUserRelationship = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    return next();
};

export const postUserRelationship = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    return next();
};

export const deleteUserRelationship = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    return next();
};

export const getUserSkills = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`g.V().has('User', 'userId', ${userId}).out('obtained').hasLabel('Skill')`
        .then((skills) => {
            return bluebird.coroutine(function*(skills, fields) {
                let result = [];
                for (let i = 0; i < skills.length; i++) {
                    let skill = yield Skill(skills[i], fields);
                    result.push(skill);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(skills, fields);
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

export const postUserSkills = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let skills = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);
    
    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`
        v_user = g.V().has('User', 'userId', ${userId})
        if(v_user.hasNext()) {
            v = v_user.next();
            skills = ${skills};
            for(def i=0; i < skills.size(); i++) {
                v_skill = g.V().hasLabel('Skill').has('categoryId', categories[i].id);
                if(v_category.hasNext()) {
                    v.addEdge('obtained', v_skill.next());
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

export const deleteUserSkill = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let userId = req.params.userid;
    if(userId == null)
        userId = '59d1280ee9df'; //TODO: Get the logged in user from the security token

    gremlin`
        gt_skill = g.V().has('User', 'userId', ${userId}).outE('obtained').as('a').inV().has('Skill', 'skillId', ${req.params.skillid}).select('a');
        if(gt_skill.hasNext()) {
            gt_skill.next().remove();
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
    getUsers,
    getNewUsers,
    getPopularUsers,
    getUser,
    getUserFavorites,
    getUserFeed,
    postUserFeed,
    getUserFollowedBy,
    getUserFollowing,
    getUserRecentItems,
    getUserRecommendations,
    getUserRelationship,
    postUserRelationship,
    deleteUserRelationship,
    getUserSkills,
    postUserSkills,
    deleteUserSkill
}