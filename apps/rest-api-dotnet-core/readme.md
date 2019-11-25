

# Secure a .NET Core web API with Azure AD B2C

ASP.NET Core supports creating RESTful services, also known as web APIs, using C#. Learn how to restrict access to your ASP.NET Core web API  to clients that have authenticated with Azure Active Directory B2C (Azure AD B2C). 

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

# [Visual Studio](#tab/visual-studio)

* From the **File** menu, select **New** > **Project**.
* Select the **ASP.NET Core Web Application** template and click **Next**.
* Name the project *TodoApi* and click **Create**.
* In the **Create a new ASP.NET Core Web Application** dialog, confirm that **.NET Core** and **ASP.NET Core 3.0** are selected. Select the **API** template and click **Create**. **Don't** select **Enable Docker Support**.

![VS new project dialog](media/create-webapi-vs.png)

# [Visual Studio Code](#tab/visual-studio-code)

* Open the [integrated terminal](https://code.visualstudio.com/docs/editor/integrated-terminal).
* Change directories (`cd`) to the folder that will contain the project folder.
* Run the following commands, to create a new web API project and open it in Visual Studio Code.

   ```console
   dotnet new webapi -o TodoApi
   code -r TodoApi
   ```

* When a dialog box asks if you want to add required assets to the project, select **Yes**.

---

## 2. Install the authentication middleware
 Add the [Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer/) package to your application. This ASP.NET Core middleware that enables an application to receive and validate an OAuth2/OpenID Connect bearer token.

# [Visual Studio](#tab/visual-studio)
```console
Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
```

# [Visual Studio Code](#tab/visual-studio-code)

```console
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

## 3. Configure the authentication middleware

Open the `Startup.cs` file and import the authentication libraries.

```C#
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
```

In the `ConfigureServices` method, and the authentication middleware. Replace:

* **options.MetadataAddress** with your Azure AD B2C user flow metadata
* **ValidAudiences** with your application ID. You can specify more than one application ID, by adding `;` delimiter between the app IDs.
* **options.RequireHttpsMetadata** If you run the WebApi using HTTP protocol, instead of HTTPS (in development environment), make sure to set it to `false`, otherwise `true`.

```C#
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    // Azure AD B2C OpenId connect metadata endpoint
    options.MetadataAddress = "https://sunflowersdemo.b2clogin.com/sunflowersdemo.onmicrosoft.com/B2C_1A_signup_signin/v2.0/.well-known/openid-configuration";

    // Token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
{
    // Specify what in the JWT needs to be checked 
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,

    // Specify your applications ID 
    ValidAudiences =  new string []{"0239a9cc-309c-4d41-87f1-31288feb2e82",
                                    "9219ee1d-2366-4f8f-a189-044b05694a87"}
};
    options.RequireHttpsMetadata = true;
});
```

Add the authentication middleware to the pipeline 
In the `Configure` method, just before the `app.UseMvc`, add a call to the `UseAuthentication` method:

```C#
app.UseAuthentication();
```

## 4. Protect the API endpoints

At this point the authentication middleware looks for bearer token in the HTTP `Authorization` header of incoming requests. If a valid token is found, the request is authorized. The API values controller is anonymous. To secure an endpoint, add the [Authorize](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/simple?view=aspnetcore-2.2) attribute to the controller or to the action. Under the **Controllers** folder, open the **ValuesController.cs** file, and add the Authorize attribute to the class. This will protect every method in the class.

```C#
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ValuesController : ControllerBase
```

You can also use the [AllowAnonymous](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/simple?view=aspnetcore-2.2) attribute to allow access by non-authenticated users to individual actions. For example:

```C#
[HttpGet]
[AllowAnonymous]
public ActionResult<IEnumerable<string>> Get()
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

Authorization refers to the process that determines what a user is able to do. For example, only users who sign-in with a policy that requires MFA (multi factor authentication) have access to a certain endpoint or actions. By using .Net core [Policy-based authorization](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-2.2) you can verify that the token issued by a specific policy.

Following code set two policies:

* **Read** which checks the the `tfp` claim that contains the policy name is **B2C_1_signupsignin1**
* **Write** which checks the the `tfp` claim that contains the policy name is **B2C_1_signupsignin1_with_MFA**. This policy requires MFA.

```C#
services.AddAuthorization(options =>
{
    options.AddPolicy("Read",  policyBuilder => policyBuilder.RequireClaim("tfp", "B2C_1_signupsignin1"));
    options.AddPolicy("Write", policyBuilder => policyBuilder.RequireClaim("tfp", "B2C_1_signupsignin1_with_MFA"));
});
```

In the controller, you can specify the policy you want to use for the entire endpoint or the action. To do so, locate the `[Authorize]` and specify the policy name, such as:

```C#
[Route("api/[controller]")]
[ApiController]
[Authorize("Read")]
public class ValuesController : ControllerBase
```
