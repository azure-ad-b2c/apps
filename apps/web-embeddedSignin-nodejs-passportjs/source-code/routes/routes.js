const express = require('express');
const passport = require('passport');
const router = express.Router();
const config = require('../config/config');

const isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()) {
        return next();
    }
	res.redirect('/login');
};

//-----------------------------------------------------------------------------
// Set up the route controller
//
// 1. For 'login' route and 'returnURL' route, use `passport.authenticate`. 
// This way the passport middleware can redirect the user to login page, receive
// id_token etc from returnURL.
//
// 2. For the routes you want to check if user is already logged in, use 
// `ensureAuthenticated`. It checks if there is an user stored in session, if not
// it will call `passport.authenticate` to ask for user to log in.
//-----------------------------------------------------------------------------

router.get('/', (req, res) => {
    res.render('index.ejs', { user: req.user });
});

// '/profile' is only available to logged in user
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/login', (req, res, next) => {
    passport.authenticate('azuread-openidconnect',
    {
        response: res,                 //required
        failureRedirect: '/'
    }) (req, res, next);
}, (req, res) => {
    res.redirect('/');
});

/** Check:  Just reload the page in the login and make sure the page reloads */
// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
router.get('/auth/openid/return', (req, res, next) => {
    passport.authenticate('azuread-openidconnect', {
        response: res,                   //required
        failureRedirect: '/'
    })(req, res, next);
},
function(req, res) {
  res.redirect('/');
});

// POST /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   home page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.post('/auth/openid/return', (req, res, next) => {
    passport.authenticate('azuread-openidconnect', {
        response: res,                 //required 
        failureRedirect: '/'
    })(req, res, next);
},
function(req, res) {
  res.redirect('/');
});

// 'logout' route, logout from passport, and destroy the session with AAD.
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        req.logout();
        res.redirect(config.destroySessionUrl);
    });
});

module.exports = router;