/******************************************************************************
 * Module dependencies.
 *****************************************************************************/

const path = require('path');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

//Load Config
dotenv.config({path: './config/.env'});

//-----------------------------------------------------------------------------
// Config the app, include middlewares
//-----------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;  
// const allowCrossDomain = (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
//     if (req.method === "OPTIONS") res.send(200);
//     else next();
// }

require('./config/passport')(passport);

// app.use(allowCrossDomain);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride());
app.use(express.urlencoded({extended:false}));

app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'secretSession'
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

/** Initializing Static Folder */
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/routes'));


//Listening to the server
app.listen(PORT, () => { 
    console.log(`Server running on http://localhost:${PORT}`);
}); 