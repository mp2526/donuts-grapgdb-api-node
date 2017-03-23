/*
 * Copyright (c) 2016. Seedlabs LLC All Rights Reserved.
 */

/**
 * Created by mp2526 on 4/17/16.
 */
'use strict';

import util from 'util';
import restify from 'restify';
import path from 'path';
import nconf from 'nconf';

import assetService from './service/assetService';
import categoryService from './service/categoryService';
import commentService from './service/commentService';
import postService from './service/postService';
import userService from './service/userService';
import groupService from './service/groupService';

//Initialize config settings
nconf.env()
    .argv()
    .file({ file: path.resolve(process.cwd(), 'config.json') });

export default function(server) {
    var ROUTE_ROOT = '/v1',
    ROUTE_ASSETS = util.format('%s/assets', ROUTE_ROOT),
    ROUTE_ASSETSACTIVE = util.format('%s/assets/active', ROUTE_ROOT),
    ROUTE_ASSETSPOPULAR = util.format('%s/assets/popular', ROUTE_ROOT),
    ROUTE_ASSETSRECENT = util.format('%s/assets/recent', ROUTE_ROOT),
    ROUTE_ASSETSSHAREDWITH = util.format('%s/assets/sharedwith', ROUTE_ROOT),
    ROUTE_ASSETSCATEGORIES = util.format('%s/assets/categories', ROUTE_ROOT),
    ROUTE_ASSETSASSETID = util.format('%s/assets/:assetid', ROUTE_ROOT),
    ROUTE_ASSETSASSETIDCATEGORIES = util.format('%s/assets/:assetid/categories', ROUTE_ROOT),
    ROUTE_ASSETSASSETIDCATEGORIESCATEGORYID = util.format('%s/assets/:assetid/categories/:categoryid', ROUTE_ROOT),
    ROUTE_ASSETSASSETIDCOMMENTS = util.format('%s/assets/:assetid/comments', ROUTE_ROOT),
    ROUTE_ASSETSASSETIDLIKES = util.format('%s/assets/:assetid/likes', ROUTE_ROOT),
    ROUTE_COMMENTSCOMMENTID = util.format('%s/comments/:commentid', ROUTE_ROOT),
    ROUTE_GROUPS = util.format('%s/groups', ROUTE_ROOT),
    ROUTE_GROUPSNEW = util.format('%s/groups/new', ROUTE_ROOT),
    ROUTE_GROUPSPOPULAR = util.format('%s/groups/popular', ROUTE_ROOT),
    ROUTE_GROUPSGROUPID = util.format('%s/groups/:groupid', ROUTE_ROOT),
    ROUTE_GROUPSGROUPIDCATEGORIES = util.format('%s/groups/:groupid/categories', ROUTE_ROOT),
    ROUTE_GROUPSGROUPIDCATEGORIESCATEGORYID = util.format('%s/groups/:groupid/categories/:categoryid', ROUTE_ROOT),
    ROUTE_GROUPSGROUPIDFEED = util.format('%s/groups/:groupid/feed', ROUTE_ROOT),
    ROUTE_GROUPSGROUPIDMEMBERS = util.format('%s/groups/:groupid/members', ROUTE_ROOT), 
    ROUTE_GROUPSGROUPIDMEMBERSMEMBERID = util.format('%s/groups/:groupid/members/:memberid', ROUTE_ROOT),
    ROUTE_POSTS = util.format('%s/posts', ROUTE_ROOT),
    ROUTE_POSTSPOSTID = util.format('%s/posts/:postid', ROUTE_ROOT),
    ROUTE_POSTSPOSTIDCOMMENTS = util.format('%s/posts/:postid/comments', ROUTE_ROOT),
    ROUTE_USERS = util.format('%s/users', ROUTE_ROOT),
    ROUTE_USERSNEW = util.format('%s/users/new', ROUTE_ROOT),
    ROUTE_USERSPOPULAR = util.format('%s/users/popular', ROUTE_ROOT),
    ROUTE_USERSSELF = util.format('%s/users/self', ROUTE_ROOT),
    ROUTE_USERSSELFFAVORITES = util.format('%s/users/self/favorites', ROUTE_ROOT),
    ROUTE_USERSSELFFEED = util.format('%s/users/self/feed', ROUTE_ROOT),
    ROUTE_USERSSELFFOLLOWEDBY = util.format('%s/users/self/followedby', ROUTE_ROOT),
    ROUTE_USERSSELFFOLLOWING = util.format('%s/users/self/following', ROUTE_ROOT),
    ROUTE_USERSSELFRECENTITEMS = util.format('%s/users/self/recentitems', ROUTE_ROOT),
    ROUTE_USERSSELFRECOMMENDATIONS = util.format('%s/users/self/recommendations', ROUTE_ROOT),
    ROUTE_USERSSELFSKILLS = util.format('%s/users/self/skills', ROUTE_ROOT),
    ROUTE_USERSSELFSKILLSSKILLID = util.format('%s/users/self/skills/:skillid', ROUTE_ROOT),
    ROUTE_USERSUSERID = util.format('%s/users/:userid', ROUTE_ROOT),
    ROUTE_USERSUSERIDFEED = util.format('%s/users/:userid/feed', ROUTE_ROOT),
    ROUTE_USERSUSERIDFOLLOWEDBY = util.format('%s/users/:userid/followedby', ROUTE_ROOT),
    ROUTE_USERSUSERIDFOLLOWING = util.format('%s/users/:userid/following', ROUTE_ROOT),
    ROUTE_USERSUSERIDRELATIONSHIP = util.format('%s/users/:userid/relationship', ROUTE_ROOT),
    ROUTE_USERSUSERIDSKILLS = util.format('%s/users/:userid/skills', ROUTE_ROOT);

    server.get({ path: ROUTE_ROOT, version: '1.0.0' }, (req, res, next) => {
        let gitHash = {'git': nconf.get('gitHash')};
        res.send(gitHash);
        return next();
    });
    server.get({ path: ROUTE_ASSETS, version: '1.0.0' }, assetService.getAssets);
    server.get({ path: ROUTE_ASSETSACTIVE, version: '1.0.0' }, assetService.getActiveAssets);
    server.get({ path: ROUTE_ASSETSPOPULAR, version: '1.0.0' }, assetService.getPopularAssets);
    server.get({ path: ROUTE_ASSETSRECENT, version: '1.0.0' }, assetService.getRecentAssets);
    server.get({ path: ROUTE_ASSETSSHAREDWITH, version: '1.0.0' }, assetService.getSharedWithAssets);
    server.get({ path: ROUTE_ASSETSCATEGORIES, version: '1.0.0' }, categoryService.getCategories);
    server.post({ path: ROUTE_ASSETSCATEGORIES, version: '1.0.0' }, restify.bodyParser(), categoryService.postCategory);
    server.get({ path: ROUTE_ASSETSASSETID, version: '1.0.0' }, assetService.getAsset);
    server.put({ path: ROUTE_ASSETSASSETID, version: '1.0.0' }, restify.bodyParser(), assetService.putAsset);
    server.post({ path: ROUTE_ASSETSASSETIDCATEGORIES, version: '1.0.0' }, restify.bodyParser(), assetService.postAssetCategories);
    server.del({ path: ROUTE_ASSETSASSETIDCATEGORIESCATEGORYID, version: '1.0.0' }, assetService.deleteAssetCategory);
    server.get({ path: ROUTE_ASSETSASSETIDCOMMENTS, version: '1.0.0' }, assetService.getAssetComments);
    server.post({ path: ROUTE_ASSETSASSETIDCOMMENTS, version: '1.0.0' }, restify.bodyParser(), assetService.postAssetComment);
    server.get({ path: ROUTE_ASSETSASSETIDLIKES, version: '1.0.0' }, assetService.getAssetLikes);
    server.post({ path: ROUTE_ASSETSASSETIDLIKES, version: '1.0.0' }, assetService.postAssetLike);
    server.del({ path: ROUTE_ASSETSASSETIDLIKES, version: '1.0.0' }, assetService.deleteAssetLike);
    server.get({ path: ROUTE_COMMENTSCOMMENTID, version: '1.0.0' }, commentService.getComment);
    server.post({ path: ROUTE_COMMENTSCOMMENTID, version: '1.0.0' }, restify.bodyParser(), commentService.postComment);
    server.put({ path: ROUTE_COMMENTSCOMMENTID, version: '1.0.0' }, restify.bodyParser(), commentService.putComment);
    server.del({ path: ROUTE_COMMENTSCOMMENTID, version: '1.0.0' }, commentService.deleteComment);
    server.get({ path: ROUTE_GROUPS, version: '1.0.0' }, groupService.getGroups);
    server.post({ path: ROUTE_GROUPS, version: '1.0.0' }, restify.bodyParser(), groupService.postGroup);
    server.get({ path: ROUTE_GROUPSNEW, version: '1.0.0' }, groupService.getNewGroups);
    server.get({ path: ROUTE_GROUPSPOPULAR, version: '1.0.0' }, groupService.getPopularGroups);
    server.get({ path: ROUTE_GROUPSGROUPID, version: '1.0.0' }, groupService.getGroup);
    server.put({ path: ROUTE_GROUPSGROUPID, version: '1.0.0' }, restify.bodyParser(), groupService.putGroup);
    server.post({ path: ROUTE_GROUPSGROUPIDCATEGORIES, version: '1.0.0' }, restify.bodyParser(), groupService.postGroupCategories);
    server.del({ path: ROUTE_GROUPSGROUPIDCATEGORIESCATEGORYID, version: '1.0.0' }, groupService.deleteGroupCategory);
    server.get({ path: ROUTE_GROUPSGROUPIDFEED, version: '1.0.0' }, groupService.getGroupFeed);
    server.post({ path: ROUTE_GROUPSGROUPIDFEED, version: '1.0.0' }, restify.bodyParser(), groupService.postGroupFeed);
    server.get({ path: ROUTE_GROUPSGROUPIDMEMBERS, version: '1.0.0' }, groupService.getGroupsMembers);
    server.post({ path: ROUTE_GROUPSGROUPIDMEMBERS, version: '1.0.0' }, restify.bodyParser(), groupService.postGroupsMembers);
    server.del({ path: ROUTE_GROUPSGROUPIDMEMBERSMEMBERID, version: '1.0.0' }, groupService.deleteGroupsMember);
    server.get({ path: ROUTE_POSTS, version: '1.0.0' }, postService.getPosts);
    server.get({ path: ROUTE_POSTSPOSTID, version: '1.0.0' }, postService.getPost);
    server.put({ path: ROUTE_POSTSPOSTID, version: '1.0.0' }, restify.bodyParser(), postService.putPost);
    server.del({ path: ROUTE_POSTSPOSTID, version: '1.0.0' }, postService.deletePost);
    server.get({ path: ROUTE_POSTSPOSTIDCOMMENTS, version: '1.0.0' }, postService.getPostComments);
    server.post({ path: ROUTE_POSTSPOSTIDCOMMENTS, version: '1.0.0' }, restify.bodyParser(), postService.postPostComment);
    server.get({ path: ROUTE_USERS, version: '1.0.0' }, userService.getUsers);
    server.get({ path: ROUTE_USERSNEW, version: '1.0.0' }, userService.getNewUsers);
    server.get({ path: ROUTE_USERSPOPULAR, version: '1.0.0' }, userService.getPopularUsers);
    server.get({ path: ROUTE_USERSSELF, version: '1.0.0' }, userService.getUser);
    server.get({ path: ROUTE_USERSSELFFAVORITES, version: '1.0.0' }, userService.getUserFavorites);
    server.get({ path: ROUTE_USERSSELFFEED, version: '1.0.0' }, userService.getUserFeed);
    server.post({ path: ROUTE_USERSSELFFEED, version: '1.0.0' }, restify.bodyParser(), userService.postUserFeed);
    server.get({ path: ROUTE_USERSSELFFOLLOWEDBY, version: '1.0.0' }, userService.getUserFollowedBy);
    server.get({ path: ROUTE_USERSSELFFOLLOWING, version: '1.0.0' }, userService.getUserFollowing);
    server.get({ path: ROUTE_USERSSELFRECENTITEMS, version: '1.0.0' }, userService.getUserRecentItems);
    server.get({ path: ROUTE_USERSSELFRECOMMENDATIONS, version: '1.0.0' }, userService.getUserRecommendations);
    server.get({ path: ROUTE_USERSSELFSKILLS, version: '1.0.0' }, userService.getUserSkills);
    server.post({ path: ROUTE_USERSSELFSKILLS, version: '1.0.0' }, restify.bodyParser(), userService.postUserSkills);
    server.del({ path: ROUTE_USERSSELFSKILLSSKILLID, version: '1.0.0' }, userService.deleteUserSkill);
    server.get({ path: ROUTE_USERSUSERID, version: '1.0.0' }, userService.getUser);
    server.get({ path: ROUTE_USERSUSERIDFEED, version: '1.0.0' }, userService.getUserFeed);
    server.post({ path: ROUTE_USERSUSERIDFEED, version: '1.0.0' }, restify.bodyParser(), userService.postUserFeed);
    server.get({ path: ROUTE_USERSUSERIDFOLLOWEDBY, version: '1.0.0' }, userService.getUserFollowedBy);
    server.get({ path: ROUTE_USERSUSERIDFOLLOWING, version: '1.0.0' }, userService.getUserFollowing);
    server.get({ path: ROUTE_USERSUSERIDRELATIONSHIP, version: '1.0.0' }, userService.getUserRelationship);
    server.post({ path: ROUTE_USERSUSERIDRELATIONSHIP, version: '1.0.0' }, userService.postUserRelationship);
    server.del({ path: ROUTE_USERSUSERIDRELATIONSHIP, version: '1.0.0' }, userService.deleteUserRelationship);
    server.get({ path: ROUTE_USERSUSERIDSKILLS, version: '1.0.0' }, userService.getUserSkills);
}