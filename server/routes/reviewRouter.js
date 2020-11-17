const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto-js');
const e_data = require('../public/encrypt');
const Reviews = require('../models/review');

const reviewRouter = express.Router();
const authenticate = require('../authenticate');

const cors = require('./cors');

reviewRouter.use(bodyParser.json());

function encryptUser(user) {
    let enc_user = e_data.getArray().filter(ele => {
        return ele.username === user
    })
    return enc_user[0].encrypted;
}

function decryptData(data) {
    let outArr = [];
    for (let i = 0; i < data.length; i++) {
        let username = crypto.AES.decrypt(data[i].username, 'user');
        let email = crypto.AES.decrypt(data[i].email, 'email');
        let obj = {
            label: data[i].label,
            username: JSON.parse(username.toString(crypto.enc.Utf8)),
            email: JSON.parse(email.toString(crypto.enc.Utf8)),
            review: data[i].review,
            status: data[i].status,
        };
        outArr.push(obj);
    }
    return outArr;
    // for (let i = 0; i < data.length; i++) {
    //     let username = crypto.AES.decrypt(data[i].username, 'user' + i);
    //     let email =  crypto.AES.decrypt(data[i].email, 'email' + i);

    //     // if(username.toString() && email.toString()){
    //         data[i].username = username.toString(crypto.enc.Utf8);
    //         data[i].email = email.toString(crypto.enc.Utf8); 
    //     // }
    // }
    // return data;
}

reviewRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus = 200 })
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Reviews.find(req.query)
            .then((reviews) => {
                console.log("Noise added Username : " + reviews[0].username);
                console.log("Noise added Email ID : " + reviews[0].email);
                let dReviews = decryptData(reviews);
                console.log("Original Username : " + dReviews[0].username);
                console.log("Original Email ID : " + dReviews[0].email);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // res.json(reviews);
                res.json(crypto.AES.encrypt(JSON.stringify(dReviews), "say-open").toString());
            }, err => next(err))
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        // res.end('Will add the dish ' + req.body.name
        //     + 'with details ' + req.body.description);
        let outArr = [];
        for (let i = 0; i < req.body.length; i++) {
            let obj = {
                label: req.body[i].label,
                // username: req.body[i].username,
                // email: req.body[i].email,
                username: (crypto.AES.encrypt(JSON.stringify(req.body[i].username), "user").toString()),
                email: (crypto.AES.encrypt(JSON.stringify(req.body[i].email), "email").toString()),
                review: req.body[i].review,
                status: req.body[i].status,
            };
            outArr.push(Object.assign({}, obj));
        }
        Reviews.create(outArr)
            .then((review) => {
                console.log('Review created: ', review);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(review);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

reviewRouter.route('/:userName')

    .options(cors.corsWithOptions, (req, res) => { res.sendStatus = 200 })
    .get(cors.corsWithOptions, (req, res, next) => {
        const e_user = encryptUser(req.params.userName)
        Reviews.findOne({ "username": e_user })
            .then((data) => {
                console.log(data);
                let dReviews = decryptData([data]);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(crypto.AES.encrypt(JSON.stringify(dReviews), "say-open").toString());
            }, err => next(err))
            .catch(err => next(err));
    });



module.exports = reviewRouter;