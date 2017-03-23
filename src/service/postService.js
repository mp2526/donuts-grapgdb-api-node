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

import Comment from './models/comment';
import Post from './models/post';
import fieldParser from '../util/fieldParser';

//TODO: Get the logged in user from the security token
var userId = '59d1280ee9df';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getPosts = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);
    let ids = req.query.ids;

    if(ids && ids.length > 0) {
        gremlin`g.V().hasLabel('Post').has('postId', within(${ids}))`
            .then((posts) => {
                return bluebird.coroutine(function*(posts, userId, fields) {
                    let result = [];
                    for (let i = 0; i < posts.length; i++) {
                        let post = yield Post(posts[i], userId, fields);
                        result.push(post);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(posts, userId, fields);
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
        gremlin`g.V().has('User', 'userId', ${userId}).out('shared').hasLabel('Post')`
            .then((posts) => {
                return bluebird.coroutine(function*(posts, userId, fields) {
                    let result = [];
                    for (let i = 0; i < posts.length; i++) {
                        let post = yield Post(posts[i], userId, fields);
                        result.push(post);
                    }
                    if(result.length == 0)
                        result = null;

                    return result;
                })(posts, userId, fields);
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

export const getPost = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Post', 'postId', ${req.params.postid})`
        .then((posts) => {
            return Post(posts[0], userId, fields);
        })
        .then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const putPost = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let post = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_post = g.V().has('Post', 'postId', ${req.params.postid});
        if(v_post.hasNext()) {
            v = v_post.next();
            if(${post.details} != null) {
                v.property('details', ${post.details});
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

export const deletePost = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    //TODO: Deal with deleting comments
    gremlin`
        gt_post = g.V().has('Post', 'postId', ${req.params.postid});
        if(gt_post.hasNext()) {
            gt_post.next().remove();
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

export const getPostComments = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Post', 'postId', ${req.params.postid}).out('has').hasLabel('Comment').order().by('createdDate', incr)`
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

export const postPostComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let comment = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_post = g.V().has('Post', 'postId', ${req.params.postid});
        if(v_post.hasNext()) {
            v_comment = graph.addVertex(label, 'Comment', 'commentId', ${result.id}, 'details', ${comment.details}, 'createdDate', ${result.createdDate});
            v_post.next().addEdge('has', v_comment);
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

export default {
    getPosts,
    getPost,
    putPost,
    deletePost,
    getPostComments,
    postPostComment
}