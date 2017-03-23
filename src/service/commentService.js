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

import Comment from './models/comment'
import fieldParser from '../util/fieldParser';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().has('Comment', 'commentId', ${req.params.commentid})`
        .then((comments) => {
            return Comment.getComment(comments[0], fields);
        })
        .then((comment) => {
            res.send(comment);
        }).catch((e) => {
            console.error(e.stack);
            res.send(e);
        });

    return next();
};

export const postComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let comment = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_comment = g.V().hasLabel('Comment', 'commentId', ${req.params.commentid});
        if(v_comment.hasNext()) {
            v_reply = graph.addVertex(label, 'Comment', 'commentId', ${result.id}, 'details', ${comment.details}, 'createdDate', ${result.createdDate});
            v_user = g.V().has('User', 'userId', ${comment.owner.id});
            
            if(v_user.hasNext()) {
                v_user.next().addEdge('shared', v_comment)
            }
            v_comment.next().addEdge('has', v_reply);
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

export const putComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let comment = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    gremlin`
        v_comment = g.V().has('Comment', 'commentId', ${req.params.commentid});
        if(v_comment.hasNext()) {
            v = v_comment.next();
            if(${comment.details} != null) {
                v.property('details', ${comment.details});
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

export const deleteComment = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    //TODO: Deal with deleting reply comments
    gremlin`
        gt_comment = g.V().has('Comment', 'commentId', ${req.params.commentid});
        if(gt_comment.hasNext()) {
            gt_comment.next().remove();
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
    getComment,
    postComment,
    putComment,
    deleteComment
}