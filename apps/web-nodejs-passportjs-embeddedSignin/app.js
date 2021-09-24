/******************************************************************************
 * Module dependencies.
 *****************************************************************************/

const path = require('path');
const express = require('express');
const passport = require('passport');
// const morgan = require('morgan');
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
const PORT = process.env.PORT;


require('./config/passport')(passport);


// app.use(morgan('dev'));
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