/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/15/16.
 */
'use strict';

import { createClient, makeTemplateTag } from 'gremlin';
import restify from 'restify';
import path from 'path';
import nconf from 'nconf';
import bluebird from 'bluebird';
import uuid from 'node-uuid';

import Asset from './models/asset';
import Comment from './models/comment';
import User from './models/user';
import fieldParser from '../util/fieldParser';

//TODO: Get the logged in user from the security token
var userId = '59d1280ee9df';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getAssets = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let ids = req.query.ids;

    if(ids && ids.length > 0) {
        gremlin`g.V().hasLabel('Asset').has('assetId', within(${ids}))`
            .then((assets) => {
                return bluebird.coroutine(function*(assets, userId, fields) {
                    let result = [];
                    for (let i = 0; i < assets.length; i++) {
                        let asset = yield Asset(assets[i], userId, fields);
                        result.push(asset);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(assets, userId, fields);
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
        gremlin`g.V().has('User', 'userId', ${userId}).out('shared').hasLabel('Asset')`
            .then((assets) => {
                return bluebird.coroutine(function*(assets, userId, fields) {
                    let result = [];
                    for (let i = 0; i < assets.length; i++) {
                        let asset = yield Asset(assets[i], userId, fields);
                        result.push(asset);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(assets, userId, fields);
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

export const getActiveAssets = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "active" asset
    gremlin`g.V().has('User', 'userId', ${userId}).out('shared').hasLabel('Asset').limit(10)`
        .then((assets) => {
            return bluebird.coroutine(function*(assets, userId, fields) {
                let result = [];
                for (let i = 0; i < assets.length; i++) {
                    let asset = yield Asset(assets[i], userId, fields);
                    result.push(asset);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(assets, userId, fields);
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

export const getPopularAssets = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "popular" asset
    //Combination of date added and like count
    gremlin`g.V().has('User', 'userId', ${userId}).out('shared').hasLabel('Asset').limit(10)`
        .then((assets) => {
            return bluebird.coroutine(function*(assets, userId, fields) {
                let result = [];
                for (let i = 0; i < assets.length; i++) {
                    let asset = yield Asset(assets[i], userId, fields);
                    result.push(asset);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(assets, userId, fields);
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

export const getRecentAssets = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: add assets at user level and determine criteria of a "recent" asset
    //List of descending order of assets
    gremlin`g.V().has('User', 'userId', ${userId}).out('member').out('contains').order().by('createdDate', decr).limit(10)`
        .then((assets) => {
            return bluebird.coroutine(function*(assets, userId, fields) {
                let result = [];
                for (let i = 0; i < assets.length; i++) {
                    let asset = yield Asset(assets[i], userId, fields);
                    result.push(asset);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(assets, userId, fields);
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

export const getSharedWithAssets = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    //TODO: determine criteria of an "shared with" asset
    gremlin`g.V().has('User', 'userId', ${userId}).out('shared').hasLabel('Asset').limit(10)`
        .then((assets) => {
            return bluebird.coroutine(function*(assets, userId, fields) {
                let result = [];
                for (let i = 0; i < assets.length; i++) {
                    let asset = yield Asset(assets[i], userId, fields);
                    result.push(asset);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(assets, userId, fields);
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

export const getAsset = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Asset', 'assetId', ${req.params.assetid})`
        .then((assets) => {
            return Asset(assets[0], userId, fields);
        })
        .then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const putAsset = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let asset = req.body;

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_asset = g.V().has('Asset', 'assetId', ${req.params.assetid});
        if(v_asset.hasNext()) {
            v = v_asset.next();
            if(${asset.mimeType} != null) {
                v.property('mimeType', ${asset.mimeType});
            }
            if(${asset.name} != null) {
                v.property('name', ${asset.name});
            }
            if(${asset.description} != null) {
                v.property('description', ${asset.description});
            }
            if(${asset.thumbnail} != null) {
                v.property('thumbnail', ${asset.thumbnail});
            }
            if(${asset.fileName} != null) {
                v.property('fileName', ${asset.fileName});
            }
            if(${asset.url} != null) {
                v.property('url', ${asset.url});
            }
            if(${asset.size} != null) {
                v.property('size', ${asset.size});
            }
            if(${asset.likeCount} != null) {
                v.property('likeCount', ${asset.likeCount});
            }
            if(${asset.openCount} != null) {
                v.property('openCount', ${asset.openCount});
            }
            if(${asset.starCount} != null) {
                v.property('starCount', ${asset.starCount});
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

export const postAssetCategories = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let categories = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_asset = g.V().has('Asset', 'assetId', ${req.params.assetid})
        if(v_asset.hasNext()) {
            v = v_asset.next();
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

export const deleteAssetCategory = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        gt_category = g.V().has('Asset', 'assetId', ${req.params.assetid}).outE('categorized').as('a').inV().has('Category', 'categoryId', ${req.params.categoryid}).select('a');
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

export const getAssetComments = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Asset', 'assetId', ${req.params.assetid}).out('has').hasLabel('Comment').order().by('createdDate', incr)`
        .then((comments) => {
            return bluebird.coroutine(function*(comments, fields) {
                let result = [];
                for (let i = 0; i < comments.length; i++) {
                    let comment = yield Comment.getComment(comments[i], fields);
                    result.push(comment);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(comments, fields);
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

export const postAssetComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }
    
    let comment = req.body;    
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_asset = g.V().has('Asset', 'assetId', ${req.params.assetid});
        if(v_asset.hasNext()) {
            v_comment = graph.addVertex(label, 'Comment', 'commentId', ${result.id}, 'details', ${comment.details}, 'createdDate', ${result.createdDate});
            v_asset.next().addEdge('has', v_comment);
            v_user = g.V().has('User', 'userId', ${userId});
            
            if(v_user.hasNext()) {
                v_user.next().addEdge('shared', v_comment)
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

export const getAssetLikes = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Asset', 'assetId', ${req.params.assetid}).in('liked')`
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

export const postAssetLike = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_user = g.V().has('User', 'userId', ${userId});
        if(v_user.hasNext()) { 
            gt_liked = g.V().has('Asset', 'assetId', ${req.params.assetid}).in('liked').has('User', 'userId', ${userId});
            if(!gt_liked.hasNext()) {
                v_asset = g.V().has('Asset', 'assetId', ${req.params.assetid});
                if(v_asset.hasNext()) {
                    v = v_asset.next();
                    v_user.next().addEdge('liked', v);
                    v.property('likeCount', v.property('likeCount').value() + 1)
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

export const deleteAssetLike = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        gt_liked = g.V().has('Asset', 'assetId', ${req.params.assetid}).as('a').inE('liked').as('b').outV().has('User', 'userId', ${userId}).select('a', 'b');
        if(gt_liked.hasNext()) {
            map = gt_liked.next();
            map.get('b').remove();
            v =  map.get('a');
            v.property('likeCount', v.property('likeCount').value() - 1)
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
    getAssets,
    getActiveAssets,
    getPopularAssets,
    getRecentAssets,
    getSharedWithAssets,
    getAsset,
    putAsset,
    getAssetComments,
    postAssetComment,
    postAssetCategories,
    deleteAssetCategory,
    getAssetLikes,
    postAssetLike,
    deleteAssetLike
}