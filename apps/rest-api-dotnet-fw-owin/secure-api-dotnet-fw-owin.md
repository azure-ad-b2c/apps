---
title: Secure a .NET Framework web API (OWIN) by using Azure Active Directory B2C
description: Learn how to use access tokens issued by Azure Active Directory B2C to Secure a .NET Framework web API endpoint.
services: active-directory-b2c
author: mmacy
manager: celestedg

ms.service: active-directory
ms.workload: identity
ms.topic: conceptual
ms.date: 08/31/2019
ms.author: marsma
ms.subservice: B2C
---

# Secure a .NET Framework web API (OWIN)

ASP.NET Framework supports creating RESTful services, also known as [web APIs](https://docs.microsoft.com/en-us/aspnet/web-api/), using C#. Learn how to restrict access to your ASP.NET Framework web API to clients that have authenticated with Azure Active Directory B2C (Azure AD B2C).

## Prerequisites

You need the following resources in place before continuing with the steps in this article:

* [Azure AD B2C tenant](tutorial-create-tenant.md)
* [Application registered](tutorial-register-applications.md) in your tenant
* [User flows created](tutorial-create-user-flows.md) in your tenant
* [Postman](https://www.getpostman.com/) to test secured access (optional)

## Get Azure AD B2C application ID

When you secure an web API with Azure AD B2C, you need to specify the list of apps (web/mobile SPA applications) that are allow to acess the web API. First, record the application ID of an application you've previously created in your Azure AD B2C tenant. If you're using the application you created in the prerequisites, use the application ID for *webbapp1*.

1. Browse to your Azure AD B2C tenant in the [Azure portal](https://portal.azure.com).
1. Under **Manage**, select **Applications**.
1. Record the value in the **APPLICATION ID** for *webapp1* or another application you've previously created.

  ![Location of a B2C application's Application ID in the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-b2c/media/secure-apim-with-b2c-token/portal-02-app-id.png)

## Get token metadata endpoint

Next, get the well-known config URL for one of your Azure AD B2C user flows. 

1. Browse to your Azure AD B2C tenant in the [Azure portal](https://portal.azure.com).
1. Under **Policies**, select **User flows (policies)**.
1. Select an existing policy, for example *B2C_1_signupsignin1*, then select **Run user flow**.
1. Record the URL in hyperlink displayed under the **Run user flow** heading near the top of the page. This URL is the OpenID Connect metadata endpoint for the user flow, and you use it in the next section when you configure the authentication middleware.

    ![Well-known URI hyperlink in the Run now page of the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-b2c/media/secure-apim-with-b2c-token/portal-01-policy-link.png)


## Setup your web API

## 1. Create a web API project

* From the **File** menu, select **New** > **Project**.
* Select the **ASP.NET Web Application (.NET Framework)** template and click **Next**.
* Name the project *TodoApi* and click **Create**.
* In the **Create a new ASP.NET Web Application** dialog, select the **Web API** template, do NOT select **Enable Docker Support**, and click **Create**. 

![VS new project dialog](media/create-webapi-vs.png)

## Add the application settings

Open your **web.cofig** file and add following entries to the `<appSettings>` section. Replace the:

* **ida:MetadataEndpoint** with your Azure AD B2C user flow metadata URI.
* **ida:ClientIds** with your application ID. You can specify more than one application ID, by adding `;` delimiter between the app IDs.
* **ida:Issuer** leave it empty, you will use this parmeter late in this document.

```XML
<add key="ida:MetadataEndpoint" value="https://sunflowersdemo.b2clogin.com/sunflowersdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_susi_v2" />
<add key="ida:ClientIds" value="0239a9cc-309c-4d41-87f1-31288feb2e82;999919a0-c6b0-4e74-a76f-01684b821780" />
<add key="ida:Issuers" value="https://login.microsoftonline.com/de678512-5915-46fd-ae83-a5df4ec052be/v2.0/;https://sunflowersdemo.b2clogin.com/de678512-5915-46fd-ae83-a5df4ec052be/v2.0/"/>
```

## 2. Install the authentication middleware
 Add the [Microsoft.Owin.Security.Jwt](hhttps://www.nuget.org/packages/Microsoft.Owin.Security.Jwt) package to your application. This ASP.NET  middleware that enables an application to receive and validate an OAuth2/OpenID Connect bearer token.


```console
Install-Package Microsoft.Owin.Security.Jwt
Install-Package Microsoft.IdentityModel.Protocols.OpenIdConnect
Install-Package Microsoft.Owin.Host.SystemWeb
```

## 3. Configure the authentication middleware

Under the root folder of your visual studio project, create new  `Startup.cs` file and add following code. This code initiates the authentication middleware.

```C#
// Startup.cs

using Owin;
using Microsoft.Owin;

[assembly: OwinStartup(typeof(TodoApi.Startup))]

namespace TodoApi
{
    public partial class Startup
    {
        // The OWIN middleware will invoke this method when the app starts
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
```

Under the **App_Start** folder create new file **Startup.Auth.cs** with the following code. This file is a partial class of the `Startup` class. It configures the OWIN middleware with the relevant properties.

```C#
// App_Start/Startup.Auth.cs

using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Security.Jwt;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using System.Configuration;
using TodoApi;

namespace TodoApi
{
    public partial class Startup
    {
        // These values are pulled from web.config
        public static string MetadataEndpoint = ConfigurationManager.AppSettings["ida:MetadataEndpoint"];
        public static string ClientIDs = ConfigurationManager.AppSettings["ida:ClientIds"]; 
        public static string Issuers = ConfigurationManager.AppSettings["ida:Issuers"];

        /*
         * Configure the authorization OWIN middleware 
         */
        public void ConfigureAuth(IAppBuilder app)
        {
            TokenValidationParameters tvps = new TokenValidationParameters
            {
                // Specify what in the JWT needs to be checked 
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                // Accept only those tokens where the audience of the token is equal to the client ID of this app
                ValidAudiences = ClientIDs.Split(';'),
            };

            // Override the issuer name provided by the OIDC metadata endpoint
            if (!string.IsNullOrEmpty(Issuers))
            {
                tvps.ValidIssuers = Issuers.Split(';');
            }

            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions
            {
                // This SecurityTokenProvider fetches the Azure AD B2C metadata & signing keys from the OpenIDConnect metadata endpoint
                AccessTokenFormat = new JwtFormat(tvps, new OpenIdConnectCachingSecurityTokenProvider(MetadataEndpoint))
            });
        }
    }
}
```

Under the **App_Start** folder create new file **OpenIdConnectCachingSecurityTokenProvider.cs**. This class reads the OpenID connect metadata file and stores the relevant data (the issuer name and the public keys) in memory. Most of the time you don't need to make any change to this file.

```C#
// App_Start/OpenIdConnectCachingSecurityTokenProvider.cs

using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Security.Jwt;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TodoApi
{
    // This class is necessary because the OAuthBearer Middleware does not leverage
    // the OpenID Connect metadata endpoint exposed by the STS by default.
    public class OpenIdConnectCachingSecurityTokenProvider : IIssuerSecurityKeyProvider
    {
        public ConfigurationManager<OpenIdConnectConfiguration> _configManager;
        private string _issuer;
        private IEnumerable<SecurityKey> _keys;
        private readonly string _metadataEndpoint;

        private readonly ReaderWriterLockSlim _synclock = new ReaderWriterLockSlim();

        public OpenIdConnectCachingSecurityTokenProvider(string metadataEndpoint)
        {
            _metadataEndpoint = metadataEndpoint;
            _configManager = new ConfigurationManager<OpenIdConnectConfiguration>(metadataEndpoint, new OpenIdConnectConfigurationRetriever());

            RetrieveMetadata();
        }

        /// <summary>
        /// Gets the issuer the credentials are for.
        /// </summary>
        /// <value>
        /// The issuer the credentials are for.
        /// </value>
        public string Issuer
        {
            get
            {
                RetrieveMetadata();
                _synclock.EnterReadLock();
                try
                {
                    return _issuer;
                }
                finally
                {
                    _synclock.ExitReadLock();
                }
            }
        }

        /// <summary>
        /// Gets all known security keys.
        /// </summary>
        /// <value>
        /// All known security keys.
        /// </value>
        public IEnumerable<SecurityKey> SecurityKeys
        {
            get
            {
                RetrieveMetadata();
                _synclock.EnterReadLock();
                try
                {
                    return _keys;
                }
                finally
                {
                    _synclock.ExitReadLock();
                }
            }
        }

        private void RetrieveMetadata()
        {
            _synclock.EnterWriteLock();
            try
            {
                OpenIdConnectConfiguration config = Task.Run(_configManager.GetConfigurationAsync).Result;
                _issuer = config.Issuer;
                _keys = config.SigningKeys;
            }
            finally
            {
                _synclock.ExitWriteLock();
            }
        }
    }
}
```

## 4. Protect the API endpoints

At this point the authentication middleware looks for bearer token in the HTTP `Authorization` header of incoming requests. If a valid token is found, the request is authorized. But, the API values controller is anonymous. To secure an endpoint, add the [Authorize](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/simple?view=aspnetcore-2.2) attribute to the controller or to the action. Under the **Controllers** folder, open the **ValuesController.cs** file, and add the Authorize attribute to the class. This will protect every method in the class.

```C#
[Authorize]
public class ValuesController : ApiController
```

You can also use the [AllowAnonymous](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/simple?view=aspnetcore-2.2) attribute to allow access by non-authenticated users to individual actions. For example:

```C#
[AllowAnonymous]
public IEnumerable<string> Get()
```

## 5. Validate secure API access

To ensure only authenticated callers can access your API, you can validate your web API configuration by calling the API with [Postman](https://www.getpostman.com/). To call the API, you need an access token issued by Azure AD B2C.

### Get an access token

You first need a token issued by Azure AD B2C to use in the `Authorization` header in Postman. You can get one by using the **Run now** feature of your sign-up/sign-in user flow you should have created as one of the prerequisites.

1. Browse to your Azure AD B2C tenant in the [Azure portal](https://portal.azure.com).
1. Under **Policies**, select **User flows (policies)**.
1. Select an existing sign-up/sign-in user flow, for example *B2C_1_signupsignin1*.
1. For **Application**, select *webapp1*.
1. For **Reply URL**, choose `https://jwt.ms`.
1. Select **Run user flow**.

    ![Run user flow page for sign up sign in user flow in Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-b2c/media/secure-apim-with-b2c-token/portal-03-user-flow.png)

1. Complete the sign-in process. You should be redirected to `https://jwt.ms`.
1. Record the encoded token value displayed in your browser. You use this token value for the Authorization header in Postman.

    ![Encoded token value displayed on jwt.ms](https://docs.microsoft.com/en-us/azure/active-directory-b2c/media/secure-apim-with-b2c-token/jwt-ms-01-token.png)


### Test a secure API call

With the access token recorded, you're now ready to test whether you've correctly configured secure access to the API.

1. Create a new `GET` request in [Postman](https://www.getpostman.com/). For the request URL, specify the speakers list endpoint of the API you published as one of the prerequisites. For example:

    `http://localhost:5000/api/values`

1. Next, select **Authorization**. From the **Type** select **Bearer**, and provide your access token.
    Your **GET** request URL and **Authorization** should appear similar to:

    ![Postman UI showing the GET request URL and headers](media/postman.png)

1. Select the **Send** button in Postman to execute the request. If you've configured everything correctly, you should be presented with a JSON response with a collection of conference speakers (shown here truncated):

    ```JSON
    [
        "value1",
        "value2"
    ]
    ```

### Test an insecure API call

Now that you've made a successful request, test the failure case to ensure that calls to your API with an *invalid* token are rejected as expected. One way to perform the test is to add or change a few characters in the token value, then execute the same `GET` request as before.

1. Add several characters to the token value to simulate an invalid token. For example, add "INVALID" to the token value:

1. Select the **Send** button to execute the request. With an invalid token, the expected result is a `401` unauthorized status code.

If you see the `401` status code, you've verified that only callers with a valid access token issued by Azure AD B2C can make successful requests to your web API.

## 6. [Optional] Add authorization

Authorization refers to the process that determines what a user is able to do. For example, only users who sign-in with a policy that requires MFA (multi factor authentication) have access to a certain endpoint or actions. By using .Net Framework [AuthorizeAttribute](https://docs.microsoft.com/en-us/dotnet/api/system.web.mvc.authorizeattribute?view=aspnet-mvc-5.2) you can verify that the token issued by a specific policy.

Following code set two policies:

*Under the **Controllers** folder, create new file **PolicyAuthorizeAttribute.cs**, and add following code. The code is triggered for each incoming HTTP request. It gets the claim principal, extracts the `tpf` (policy name) claim, and evaluate whether the access token policy name mach the action policy name set to the endpoint or action.

```C#
// Controllers/PolicyAuthorizeAttribute.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace TaskAPI.Controllers
{

    public class PolicyAuthorizeAttribute : AuthorizeAttribute
    {
        private readonly string Policy;

        public PolicyAuthorizeAttribute(string policy)
        {
            this.Policy = policy;
        }

        public override void OnAuthorization(HttpActionContext actionContext)
        {
            base.OnAuthorization(actionContext);

            // Get the claim principal
            ClaimsPrincipal principal = actionContext.ControllerContext.RequestContext.Principal as ClaimsPrincipal;

            // Get the tpf (policy name) claim. 
            var tfpClaim = principal?.Claims.FirstOrDefault(c => c.Type == "tfp");
            if (tfpClaim != null)
            {
                // Check the access token policy name mach the action policy name 
                if (tfpClaim.Value == this.Policy)
                    return;
            }
            HandleUnauthorizedRequest(actionContext);
        }
    }
}
```

In the controller, you can specify the policy you want to use for the entire endpoint or the action. To do so, locate the `[Authorize]` and add replace it with `[PolicyAuthorize]` attribute and specify the  the policy name, such as:

```C#
//[Authorize]
[PolicyAuthorize("B2C_1_susi_with_MFA")]
public class ValuesController : ApiController
```

## Migrate to b2clogin.com

If you have a web API that validates tokens issued by the legacy `login.microsoftonline.com` endpoint, you should migrate the API and the applications that call it to use tokens issued by [b2clogin.com](b2clogin.md).

You can follow this general process to perform a staged migration:

1. In the web.config file, locate app setting with the **ida:Issuers** key. In the value the add both b2clogin.com and login.microsoftonline.com, using `;` delimiter. See the next section, to lear how to get token issuer name from the metadata endpoint.
    ```XML
    <add key="ida:Issuers" value="https://login.microsoftonline.com/de678512-5915-46fd-ae83-a5df4ec052be/v2.0/;https://sunflowersdemo.b2clogin.com/de678512-5915-46fd-ae83-a5df4ec052be/v2.0/"/>
    ```
1. Update your applications one at a time to obtain tokens from the b2clogin.com endpoint.
1. Once all of your applications are correctly obtaining tokens from b2clogin.com, remove support for login.microsoftonline.com-issued tokens from the API.

