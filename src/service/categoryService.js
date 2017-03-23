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

import Category from './models/category'
import fieldParser from '../util/fieldParser';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getCategories = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let fields = fieldParser(req.query.fields);

    gremlin`g.V().hasLabel('Category')`
        .then((categories) => {
            return bluebird.coroutine(function*(categories, fields) {
                let result = [];
                for (let i = 0; i < categories.length; i++) {
                    let category = yield Category(categories[i], fields);
                    result.push(category);
                }
                if(result.length == 0)
                    result = null;

                return result;
            })(categories, fields);
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

export const postCategory = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let category = req.body;
    
    const client = createClient(nconf.get('gremlin:port'), nconf.get('gremlin:host'));
    const gremlin = makeTemplateTag(client);

    let result = {id: uuid.v4(), createdDate: Math.floor(Date.now() / 1000)};

    gremlin`
        v_category = graph.addVertex(label, 'Category', 'categoryId', ${result.id}, 'name', ${category.name},
            'createdDate', ${result.createdDate});
    `.then((vertices) => {
        res.send(result);
    })
    .catch((e) => {
        console.error(e.stack);
        res.send(e);
    });

    return next();
};

export default {
    getCategories,
    postCategory
}