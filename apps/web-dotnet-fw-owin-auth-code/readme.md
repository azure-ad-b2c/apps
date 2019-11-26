# Secure a .NET Framework web app (OWIN) with authorization code grant flow and Id token

You add authentication to your Web App, which can therefore sign in users and calls a web API on behalf of the signed-in user.

![web app with REST API](media/web-app-flow.svg)

Web Apps that calls web APIs:

- Are confidential client applications (can store confidential data on the server).
- That's why they've registered a secret (application password or certificate) with Azure AD B2C. This secret is passed-in during the call to Azure AD B2C to exchange the authorization code to an access token.

## Prerequisites

You need the following resources in place before continuing with the steps in this article:

- [Azure AD B2C tenant](tutorial-create-tenant.md)
0- [Application registered](tutorial-register-applications.md) and create a **client secret** for your application.
- [User flows](tutorial-create-user-flows.md), or [custom policies](https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-get-started-custom?tabs=applications) are create in your tenant.
- [Configure scopes](https://docs.microsoft.com/en-us/azure/active-directory-b2c/add-web-application?tabs=applications) and Grant permissions:
    - `read` - Read access to the web API
    - `write` - Write access to the web API

## How it works
Given that letting a user sign in is delegated to the Open ID connect (OIDC) middleware, you want to hook-up in the OIDC process. The way to do that is different depending on the framework you use. In the case of ASP.NET, you'll subscribe to middleware OIDC events. The principle is that:

- You'll let ASP.NET request an authorization code, through the Open ID connect middleware. By doing this ASP.NET will let the user sign in with Azure AD B2C sign-in policy.
- You'll subscribe to the reception of the authorization code by the Web app. This is a C# delegate.
- When the auth code is received, you'll use MSAL libraries to redeem the code. The resulting access tokens and refresh tokens are, then, stored in the token cache. From there, the cache can be used in other parts of the application, for instance in controllers, to acquire other tokens silently.
- Your application will use following tokens:
    - The **Id token** is used to secure the web application itself.
    - The **access token** is used to secure the call to the REST API
    - The **refresh token** is used to acquire new access token (after the access token is expired)


## 1. Setup your web application

This section describes how to install and configure the authentication pipeline through OWIN middleware on an ASP.NET project by using OpenID Connect.

Create a web app project:

* From the **File** menu, select **New** > **Project**.
* Select the **ASP.NET Web Application (.NET Framework)** template and click **Next**.
* Name the project *TaskWebApp* and click **Create**.
* In the **Create a new ASP.NET Web Application** dialog, select the **MVC** template, do NOT select **Enable Docker Support**, and click **Create**. 

![VS new project dialog](media/create-webapi-vs.png)

## 2. Add authentication components

This sample app uses the following libraries:

- [Microsoft.Owin.Security.OpenIdConnect](https://www.nuget.org/packages/Microsoft.Owin.Security.OpenIdConnect/) - Middleware that enables an application to use OpenIdConnect for authentication
- [Microsoft.Owin.Security.Cookies](https://www.nuget.org/packages/Microsoft.Owin.Security.Cookies) - Middleware that enables an application to maintain a user session by using cookies
- [Microsoft.Owin.Host.SystemWeb](https://www.nuget.org/packages/Microsoft.Owin.Host.SystemWeb) Middleware that enables OWIN-based applications to run on Internet Information Services (IIS) by using the ASP.NET request pipeline
- [Microsoft.Identity.Client](https://www.nuget.org/packages/Microsoft.Identity.Client/) Helps to obtain tokens from Azure AD & Azure AD B2C.

These libraries enable single sign-on (SSO) by using OpenID Connect through cookie-based authentication. After authentication is completed and the token representing the user is sent to your application, OWIN middleware creates a session cookie. The browser then uses this cookie on subsequent requests so that the user doesn't have to retype the password, and no additional verification is needed.

1. In Visual Studio: Go to **Tools** > **Nuget Package Manager** > **Package Manager Console**.
2. Add *OWIN middleware NuGet packages* by typing the following in the Package Manager Console window:

    ```powershell
    Install-Package Microsoft.Owin.Security.OpenIdConnect
    Install-Package Microsoft.Owin.Security.Cookies
    Install-Package Microsoft.Owin.Host.SystemWeb
    Install-Package Microsoft.Identity.Client
    ```

You may also need to install following Nunet packages:
- Microsoft.AspNet.WebApi.Core


## 3. Configure the authentication pipeline

The following steps are used to create an OWIN middleware Startup class to configure OpenID Connect authentication. This class is executed automatically when your IIS process starts.

If your project doesn't have a `Startup.cs` file in the root folder:

1. Right-click the project's root folder, and then select **Add** > **New Item** > **OWIN Startup class**.<br/>
1. Name it **Startup.cs**.

> Make sure the class selected is an OWIN Startup class and not a standard C# class. Confirm this by verifying that you see [assembly: OwinStartup(typeof({NameSpace}.Startup))] above the namespace.


1. In the `Startup` class change the class to be `partial`.
1. In the `Configuration` function, make a call to `ConfigureAuth(app)`. You final code should look like following:

    ```csharp
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
    ```


4. Add necessary classes to your project. If the `Utils` doesn't exist, create such a folder, under the root folder of the project.

|File name | Location | Description|
|-----|-----|-----| 
|[Startup.Auth.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/App_Start/Startup.Auth.cs)|App_Start| Configure the OWIN middleware and use MSAL to redeem the authorization code into an access token, which is saved in a cache along with any other useful artifact (such as associated refresh_tokens) so that it can be used later on in the application from the controllers' actions to fetch access tokens after they are expired.|
|[ClaimsPrincipalExtension.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Utils/ClaimsPrincipalExtension.cs)|Utils| Claims principal utility, to get the B2C Account identifier for an MSAL.NET account from a ClaimsPrincipal and builds a ClaimsPrincipal from an IAccount |
|[Constants.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Utils/Constants.cs) | Utils| Some constants used by this project. |
|[Globals.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Utils/Globals.cs) | Utils| Contains the application settings and global variables. |
|[MSALPerUserMemoryTokenCache.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Utils/MSALPerUserMemoryTokenCache.cs) | Utils| A custom cache implementation that uses a shared instance of a MemoryCache to cache tokens. When it acquires the access token, MSAL also saves this token in its token cache. When any code in the rest of the project tries to acquire an access token for to call the REST API, MSAL will return the cached token.|
|[MsalAppBuilder.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Utils/MsalAppBuilder.cs) | Utils| MSAL library builder. |

## 4. Add a controller to handle sign-in and sign-out requests

Create new controllers to expose sign-in and sign-out methods and call the REST API, follow these steps:

1.	Right-click the **Controllers** folder and select **Add** > **Controller**.
2.	Select **MVC (.NET version) Controller – Empty**.
3.	Select **Add**.
4.	Name it **AccountController** and then select **Add**.
5.	Replace the code with the following:

|File name | Location | Description|
|-----|-----|-----| 
|[AccountController.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Controllers/AccountController.cs)|Controllers| A controller to expose sign-in and sign-out methods|
|[TasksController.cs](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Controllers/TasksController.cs) | Controllers| Makes a call to the API to retrieves the list of tasks, create and delete tasks | 

## 5. Add sign-in, edit profile and sign-out buttons

In Visual Studio, create a new view to add the sign-in button and to display user information after authentication:

1.	Right-click the **Views\Shared** folder and select **Add View**.
1.	Name the new view **_LoginPartial**.
1. Select **Create as a partial view** and click **Add**
1.	Add the following code, which includes the sign-in button, to the file:
    
    |File name | Locaiton | Description|
    |-----|-----|-----| 
    |[_LoginPartial.cshtml](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Views/Shared/_LoginPartial.cshtml) |Views\Shared |A view that shows the sign-in button and to display user information after authentication, such as a sign-out and edit profile button. |

    
1.	Open the **Views\Shared\_Layout.cshtml** file.
1. Locate the DIV element `<div class="navbar-collapse collapse">`
1.	Add following snippet just before the closing tag

    ```
    @Html.Partial("_LoginPartial")
    ```

Your final **_Layout.cshtml**should look like [_Layout.cshtml](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi/blob/master/TaskWebApp/Views/Shared/_Layout.cshtml)


## 6. Add the application settings

Open your **web.config** file and add following entries to the `<appSettings>` section. Replace the:

* **ida:Tenant** the name of your B2C tenant.
* **ida:TenantId** the ID of your B2C tenant.
* **ida:ClientId** Application ID you registered.
* **ida:ClientSecret** Application secret you  registered.
* **ida:RedirectUri** the SSL URL of your project.
* **ida:SignUpSignInPolicyId** the name of the sign-up and sign-in policy
* **ida:EditProfilePolicyId** the name of the edit profile policy
* **ida:ResetPasswordPolicyId** the name of the password reset policy

```XML
    <add key="ida:Tenant" value="fabrikamb2c.onmicrosoft.com" />
    <add key="ida:TenantId" value="775527ff-9a37-4307-8b3d-cc311f58d925" />
    <add key="ida:ClientId" value="fdb91ff5-5ce6-41f3-bdbd-8267c817015d" />
    <add key="ida:ClientSecret" value="X330F3#92!z614M4" />
    <add key="ida:AadInstance" value="https://fabrikamb2c.b2clogin.com/tfp/{0}/{1}" />
    <add key="ida:RedirectUri" value="https://localhost:44316/" />
    <add key="ida:SignUpSignInPolicyId" value="b2c_1_susi" />
    <add key="ida:EditProfilePolicyId" value="b2c_1_edit_profile" />
    <add key="ida:ResetPasswordPolicyId" value="b2c_1_reset" />
    <!-- Uncomment the localhost url if you want to run the API locally -->
    <add key="api:TaskServiceUrl" value="https://aadb2cplayground.azurewebsites.net/" />
    <!--add key="api:TaskServiceUrl" value="https://localhost:44332/" /-->
    <!-- The following settings is used for requesting access tokens -->
    <add key="api:ApiIdentifier" value="https://fabrikamb2c.onmicrosoft.com/tasks/" />
    <add key="api:ReadScope" value="read" />
    <add key="api:WriteScope" value="write" />
```

## Test you project

The above configuration requires you to run the project under the `https://localhost:44316/` URL. If it's not so, right click on your MVC Project. Go to **Properties**, then select the **Web** tab.
You can change the port number in the Project Url. In this example: `https://localhost:44316/`. Save and run your project again.