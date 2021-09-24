const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const configAuth = require('./config');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        console.log(`User (serialize) ------> ${JSON.stringify(user)} \n\n`);
        done(null, user.oid);
    });

    passport.deserializeUser((oid, done) => {
        findByOid(oid, (err, user) => {
            console.log(`User (deserialize) ----> ${JSON.stringify(user)} \n\n`);
            done(err, user);
        });
    });

    let users = [];

    let findByOid = (oid, fn) => {
        console.log(`OID ------> ${oid} \n\n`);
        console.log(`Users_Array ------> ${JSON.stringify(users)} \n\n`);
        for(let i = 0, len = users.length; i < len; i++){
            let user = users[i];
            if(user.oid === oid) {
                console.log(`User found --------> ${JSON.stringify(user)} \n\n`);
                return fn(null, user);
            }
        }
        return fn(null, null);
    }

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
    }, (req, iss, sub, profile, access_token, refresh_token, params, done)  => {
        console.log(`Profile ------>  + ${JSON.stringify(profile)} \n\n`);
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
