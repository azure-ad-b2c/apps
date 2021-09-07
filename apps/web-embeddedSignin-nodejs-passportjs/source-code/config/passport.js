const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const configAuth = require('./config');

/******************************************************************************
 * Set up passport in the app 
 ******************************************************************************/

module.exports = (passport) => {

    //-----------------------------------------------------------------------------
    // To support persistent login sessions, Passport needs to be able to
    // serialize users into and deserialize users out of the session.  Typically,
    // this will be as simple as storing the user ID when serializing, and finding
    // the user by ID when deserializing.
    //-----------------------------------------------------------------------------

    passport.serializeUser((user, done) => {
        done(null, user.oid);
    });

    passport.deserializeUser((oid, done) => {
        findByOid(oid, (err, user) => {
            done(err, user);
        });
    });

    let users = [];

    var findByOid = (oid, fn) => {
        console.log(`OID >>> ${oid}`);
        console.log(`Users_Array >>>>>> ${JSON.stringify(users)}`);
        for(let i = 0, len = users.length; i < len; i++){
            let user = users[i];
            if(user.oid === oid) { 
                console.log('Hey, we found the user >>>>>>> ' + JSON.stringify(user));
                return fn(null, user);
            }
        }
        return fn(null, null);
    }

    //-----------------------------------------------------------------------------
    // Use the OIDCStrategy within Passport.
    // 
    // Strategies in passport require a `verify` function, which accepts credentials
    // (in this case, the `oid` claim in id_token), and invoke a callback to find
    // the corresponding user object.
    // 
    // The following are the accepted prototypes for the `verify` function
    // (1) function(iss, sub, done)
    // (2) function(iss, sub, profile, done)
    // (3) function(iss, sub, profile, access_token, refresh_token, done)
    // (4) function(iss, sub, profile, access_token, refresh_token, params, done)
    // (5) function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done)
    // (6) prototype (1)-(5) with an additional `req` parameter as the first parameter
    //
    // To do prototype (6), passReqToCallback must be set to true in the config.
    //-----------------------------------------------------------------------------
    passport.use(new OIDCStrategy({
        identityMetadata: configAuth.creds.identityMetadata,
        clientID: configAuth.creds.clientID, 
        responseType: configAuth.creds.responseType,
        responseMode: configAuth.creds.responseMode,
        redirectUrl: configAuth.creds.redirectUrl, 
        allowHttpForRedirectUrl: configAuth.creds.allowHttpForRedirectUrl,
        clientSecret: configAuth.creds.clientSecret,
        validateIssuer: configAuth.creds.validateIssuer,
        isB2C: configAuth.creds.isB2C,
        issuer: configAuth.creds.issuer,
        passReqToCallback: configAuth.creds.passReqToCallback, 
        scope: configAuth.creds.scope,
        loggingLevel: configAuth.creds.loggingLevel, 
        nonceLifetime: configAuth.creds.nonceLifetime,
        nonceMaxAmount: configAuth.creds.nonceMaxAmount,
        useCookieInsteadOfSession: configAuth.creds.useCookieInsteadOfSession,
        cookieEncryptionKeys: configAuth.creds.cookieEncryptionKeys,
        clockSkew: configAuth.creds.clockSkew,
    }, (req, iss, sub, profile, access_token, refresh_token, params, done) => {
        if(!profile.oid) {
            return done(new Error("No oid found"), null);
        }
        profile.tokens = params;
        // asynchronous verification, for effect...
        process.nextTick(() => {
            findByOid(profile.oid, (err, user) => {
                if(err) {
                    return done(err);
                }
                if(!user) {
                    // "Auto-registration"
                    users.push(profile);
                    return done(null, profile);
                }
                return done(null, user);      
            });
        });
    }));
};

