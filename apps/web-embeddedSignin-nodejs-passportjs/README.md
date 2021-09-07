---
services: azure-active-directory-B2C
platforms: nodejs
author: soumi
level: 200
client: NodeJs WebApp
endpoint: Microsoft Identity Platform
---
# A NodeJS WebApp signing-in users with the Microsoft Identity Platform in Azure AD B2C using the Embedded sign-in experience using iframe.

[![Build status](https://identitydivision.visualstudio.com/IDDP/_apis/build/status/AAD%20Samples/.NET%20client%20samples/ASP.NET%20Core%20Web%20App%20tutorial)](https://identitydivision.visualstudio.com/IDDP/_build/latest?definitionId=819)

## Scenario

This sample shows how to build a NodeJS Express Web app that uses Passport.js to implement OpenID Connect to sign in users in **Azure AD B2C** using the embedded sign-in experience. The sample server included in the download are designed to run on any platform. It assumes you have some familiarity with **Azure AD B2C**. If you'd like to learn all that B2C has to offer, start with our documentation at [https://aka.ms/aadb2c](https://aka.ms/aadb2c).

![Sign in with Azure AD](ReadmeFiles/sign-in.png)

Try out the working sample: [B2C-OIDC Login App](https://app.thegamesstore.in/)

### Step 1: Clone or download this repository

From your shell or command line:

```powershell
git clone https://github.com/azure-ad-b2c/apps.git
```

Navigate to the `"B2C_EmbeddedSignin_nodejs_passportjs_Sample-main"` folder

 ```Sh
  cd "B2C_EmbeddedSignin_nodejs_passportjs_Sample-main"
  ```

### Step 2: Download node.js for your platform

To successfully use this sample, you need a working installation of Node.js.

### Step 3: Install NPM modules

Next, install the NPM.

From your shell or command line:
* `$ npm install`

### Step 4: Get your own Azure AD B2C tenant

If you don't have an Azure AD B2C tenant yet, you'll need to create an Azure AD B2C tenant by following the [Tutorial: Create an Azure Active Directory B2C tenant](https://azure.microsoft.com/documentation/articles/active-directory-b2c-get-started).

### Step 5: Enable custom domains for Azure Active Directory B2C

To use Azure AD B2C Embedded sign-in, you need to first enable a custom domain with your Azure AD B2C account, and configure it with a custom domain which is on the same domain as your published application, i.e. **Same Origin**. This is required because Azure AD B2C should not allow you to load the sign-in experience in an iframe unless you enable CORS for the source domains loading the iframe using a custom policy. So first, enable a custom domain similar to **login.yourcustomdomain.com** if your application is published on something similar to **www.yourcustomdomain.com**. 
To read more on enabling custom domains for B2C please check [Tutorial: Enable custom domains for Azure Active Directory B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-domain?pivots=b2c-custom-policy).

>Note: This will effectively disallow you from using sign-in if the application is run from a development machine. To get around that, you may want to create a separate Azure AD Tenant for development, with a development version of the custom policy which has CORS enabled for **<https://localhost:XXXX>**. Also note that this may result in an undesirable user experience Because Azure AD B2C session cookies within an iframe are considered third-party cookies, certain browsers (for example Safari or Chrome in incognito mode) either block or clear these cookies. This should never be done in your production Azure AD B2C tenant.

### Step 6: Create your SignUp/SignIn, Password Reset, and Profile Edit policies (custom policy)

This sample depends on a custom sign-up/sign-in policy. This is because you need to customize the policy to allow **JourneyFraming**, where you allow the user journey to be loaded into an iframe.
You can use one of the policies in the [Azure AD B2C Custom Policy Starter Pack](https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack). Follow the [Tutorial: Create user flows in Azure Active Directory B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-user-flows?pivots=b2c-custom-policy) to deploy such policy.

In your policy, aside from the normal steps in customizing the policy, make sure to add the following in **SignUpOrSignIn.xml**, **PasswordReset.xml**, and **ProfileEdit.xml**, inside the `<RelyingParty>` tag, right after the `<DefaultUserJourney>` tag.

```xml
<!--
<RelyingParty>
  <DefaultUserJourney ReferenceId="SignUpOrSignIn" /> -->
  <UserJourneyBehaviors> 
    <JourneyFraming Enabled="true" Sources="https://yourcustomdomain.com https://www.yourcustomdomain.com" /> 
  </UserJourneyBehaviors>
<!--
</RelyingParty> -->
```

>Note: If you want to allow the custom policies to be used with your development environment, make sure you add **<https://localhost:xxxx>** to the list of sources in the `<JourneyFraming>' tag.

Additionally, make sure the `PublicPolicyUri` element in the `<TrustFrameworkPolicy>` in all policy xml files (including **TrustedFramewordBase.xml** and **TrustedFrameworkExtensions.xml**) is referncing your custom domain, not the instance name. The example below is for **SignUpOrSignin.xml**.

```xml
PublicPolicyUri="http://login.yourcustomdomain.com/B2C_1A_signup_signin"
```

### Step 7: Create your own Web app

Now you need to [register your web app in your B2C tenant](https://docs.microsoft.com/azure/active-directory-b2c/active-directory-b2c-app-registration#register-a-web-application), so that it has its own Application ID.

Your web application registration should include the following information:

- Enable the **Web App/Web API** setting for your application.
- Set the **Reply URL** to `https://www.yourcustomdomain.com/auth/openid/return`.
- Copy the Application ID generated for your application, so you can use it in the next step.

### Step 8: Configure the sample with your app coordinates

1. Open the sample in Visual Studio Code.
1. Create a file called `.env` under the `config` folder and add `PORT = 5000` or your preferred port to run the app.
1. Open the `config/config.js` file.
1. Provide the parameters in `exports.creds` in config.js as instructed.
1. Find the instances of `yourcustomdomain.com` and replace the value with your Azure AD B2C domain name. For example, `constoso.com`
1. Find the assignment for `client_id` and replace the value with the Application ID from Step 4.


### Step 9: Customize the View Components

Update the index.ejs file.
1. Open the `views/index.ejs` file.
1. Update the following lines with the name of your custom policy names.
    * Update this line with your PasswordReset policy name: `<a class="dropdown-item" href="/login/?p=B2C_1A_PasswordReset"><i class="fas fa-key"></i> Reset Password</a>`
    * Update this line with your SignUpSignIn policy name: `$('#loginFrame').attr('src', '/login/?p=B2C_1A_signup_signin');`

Update the profile.ejs file
1. Open the `views/profile.ejs` file.
1. Update the following lines with the name of your custom policy names.
    * Update this line with your SignIn Button policy name: `<a class="btn btn-custom" href="/login/?p=B2C_1A_signup_signin" id="signIn" style="color: rgb(240, 238, 235);"><i class="fas fa-sign-in-alt"></i> SignIn</a>`
    * Update this line with your PasswordReset policy name: `<a class="dropdown-item" href="/login/?p=B2C_1A_PasswordReset_EmbeddedSignin"><i class="fas fa-key" aria-hidden="true"></i> Reset Password</a>`
    * Also update the following lines with the PasswordReset and ProfileEdit policiy names: `<a class="btn profileEdit-btn" href="/login/?p=B2C_1A_ProfileEdit_EmbeddedSignin" ><i class="fas fa-pencil-alt"></i> Edit Profile</a>`
    `<a class="btn profileEdit-btn" href="/login/?p=B2C_1A_PasswordReset_EmbeddedSignin"><i class="fas fa-key" aria-hidden="true"></i> Reset Password</a>`


>Note: You may find a JavaScript error `Blocked autofocusing on a <input> element in a cross-origin subframe.` in your browser's console. This is because the default behavior of the sign-in experience attempts to focus the user input on the first available user input in the sign-in page, which is not allowed inside an iframe for security reasons. You may want to attempt to override this behavior in your custom UI.

```error
Blocked autofocusing on a <input> element in a cross-origin subframe.
```

### Step 10: Run the sample

1. To locally run the sample, you can use `npm run start`.
1. You can also upload this sample as an App Service and configure the App Service to use HTTPS.
1. If you don't have an account registered on the **Azure AD B2C** used in this sample, follow the sign up process. Otherwise, input the email and password for your account and click on **Sign in**.

## Notes about the code

### Defining the Login Modal Dialog

In **index.ejs**, note the modal dialog definition:

```html
<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="loginModalLabel"><img src="/images/CloudLogo.gif" width="50" height="50" > B2C Login</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div id="frameWrap">
        <img id="loader1" src="/images/spinner.gif" width="100" height="100" alt="loading gif" />
      </div>
      <iframe id="loginFrame" frameborder="0" src="about:blank" data-isloaded="0" ></iframe> 
    </div>
  </div>
</div>
```

### Showing the Login Modal Dialog

We need to show the modal dialog which contains the iframe when the sign-in button is clicked. We do not need to worry about closing it when the login, is complete, this will be handled when we reload the entire page post-login in the next step.

```html
<!-- Shows the loginModal when the SignIn/SignUp button is clicked-->
    <script>
        $("#signIn").on("click", function () {
            $("#loginModal").modal("show");
            $('#loginFrame').on('load', function () {
                $('#loader1').hide();
            });
            $('#loginFrame').attr('src', '/login/?p=B2C_1A_signup_signin');
        });
    </script>
```

### Javascript required for post-login redirect

Because all the login experience and redirects happen inside the iframe, we need to identify when the user journey is completed, and the user is directed back to our application. We track the **document.referrer** value. If we're coming back form our login domain, we know the user journey is compelted, and we can reload the main window (not the iframe) so it reflects the logged-in user's details.

```html
<!-- Because the authorization flow happens inside the iframe, we need to reload the main page.-->
<script>
  if (document.referrer.startsWith('https://login.yourcustomdomain.com/'))
    window.top.location.reload();
</script>
```

>Note: There are other alternatives here which we can do to accomplish the same logic, one being creating your own SignIn action which includes generating your own sign-in challenge and using the *state* parameter of the sign-in request using OpenIdConnect Events to indicate the redirect url. However, for the purposes of demo, this JavaScript snippet will do.



> Did the sample not work for you as expected? Did you encounter issues trying this sample? Then please reach out to us using the [GitHub Issues](../../../../issues) page.
> [Consider taking a moment to share your experience with us.](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRz0h_jLR5HNJlvkZAewyoWxUNEFCQ0FSMFlPQTJURkJZMTRZWVJRNkdRMC4u)



