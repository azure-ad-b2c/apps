const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1A_EMBEDDEDSIGNIN_SIGNUP_SIGNIN",
        resetPassword: "B2C_1A_EMBEDDEDSIGNIN_PASSWORDRESET",
        editprofile: "B2C_1A_EMBEDDEDSIGNIN_PROFILEEDIT",
    },
    authorities: {
        signUpSignIn: {
            authority: "https://login.yourcustomdomain.com/yourcustomdomain.com/B2C_1A_EMBEDDEDSIGNIN_SIGNUP_SIGNIN",
        },
        resetPassword: {
            authority: "https://login.yourcustomdomain.com/yourcustomdomain.com/B2C_1A_EMBEDDEDSIGNIN_PASSWORDRESET",
        },
        editprofile: {
            authority: "https://login.yourcustomdomain.com/yourcustomdomain.com/B2C_1A_EMBEDDEDSIGNIN_PROFILEEDIT",
        },
    },
    authorityDomain: "yourcustomdomain.com",
    destroySessionUrl: "https://login.yourcustomdomain.com/yourcustomdomain.com/oauth2/v2.0/logout?p=B2C_1A_EMBEDDEDSIGNIN_SIGNUP_SIGNIN" + "&post_logout_redirect_uri=https://yourcustomdomain.com/"
}

module.exports = b2cPolicies;