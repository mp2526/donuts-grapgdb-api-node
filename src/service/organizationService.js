/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/26/16.
 */
'use strict';

import { createClient, makeTemplateTag } from 'gremlin';
import restify from 'restify';
import path from 'path';
import nconf from 'nconf';
import bluebird from 'bluebird';
import uuid from 'node-uuid';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export const getCategories = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    return next();
};

export const postCategory = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let category = req.body;

    return next();
};

export const deleteCategory = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    let categoryId = req.params.categoryid;

    return next();
};

export const getDivisions = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    return next();
};

export const postDivision = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let division = req.body;

    return next();
};

export const deleteDivision = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    let divisionId = req.params.divisionid;

    return next();
};

export const getJobTitles = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    return next();
};

export const postJobTitle = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let jobTitle = req.body;

    return next();
};

export const deleteJobTitle = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    let jobTitleId = req.params.jobtitleid;

    return next();
};

export const getLocations = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    return next();
};

export const postLocation = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let location = req.body;

    return next();
};

export const deleteLocation = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    let locationId = req.params.locationid;

    return next();
};

export const getSkills = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    return next();
};

export const postSkill = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    if(req.headers['content-type'].indexOf('application/json') == -1) {
        return next(new restify.errors.InvalidHeaderError('Content-Type header must be set to application/json'));
    }

    let skills = req.body;

    return next();
};

export const deleteSkill = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    let skillId = req.params.skillid;

    return next();
};

export default {
    getCategories,
    postCategory,
    deleteCategory,
    getDivisions,
    postDivision,
    deleteDivision,
    getJobTitles,
    postJobTitle,
    deleteJobTitle,
    getLocations,
    postLocation,
    deleteLocation,
    getSkills,
    postSkill,
    deleteSkill
}