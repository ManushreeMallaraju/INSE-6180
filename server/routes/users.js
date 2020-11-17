var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var router = express.Router();
var cors = require('./cors');
router.use(bodyParser.json());

router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  // res.send('respond with a resource');
  User.find({})
    .then((users) => {
      if (users) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      }
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  // User.findOne({username: req.body.username})
  //using register method for passport

  let user = [];
  for (let i = 0; i < req.body.length; i++) {
    User.register(new User({ username: req.body[i].username }), req.body[i].password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        //adding first name and last name of user to db
        user.push({"username": req.body[i].username});
      }
    });
  }
  res.json({"msg": "successs"});
  // user.save((err, user) => {
  //   if (err) {
  //     res.statusCode = 500;
  //     res.setHeader('Content-Type', 'application/json');
  //     res.json({ err: err });
  //     return;
  //   }
  //   passport.authenticate('local')(req, res, () => {
  //     res.statusCode = 200;
  //     res.setHeader('Content-Type', 'application/json');
  //     res.json({ success: true, status: 'Registration Successful!' });
  //   });
  // });
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

  //added passport local inside the method to provide additional 
  //info to the client side
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, status: 'Login Unsuccessful!', err: info });
    }

    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, status: 'Login Unsuccessful!', err: 'Could not login the user!' });
      }

      //creating a token
      var token = authenticate.getToken({ _id: req.user._id });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, token: token, status: 'Login Successful!' });
    });

  })(req, res, next);
})

router.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();
    // res.clearCookie('session-id');
    res.clearCookie('session-id', { httpOnly: true, path: "/" });
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'JWT Invalid!', success: false, err: info });
    }

    else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'JWT Valid!', success: true, user: user });
    }
  })(req, res);
})

module.exports = router;
