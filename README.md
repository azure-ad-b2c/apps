# Azure Active Directory B2C app samples

The following tables provide links to samples for integrating Azure AD B2C as an identity provider.

## Secure REST API 

|Platform|OAuth2 library|Documentation|Sample|
|----|----|----|----|
|[.Net Core](https://docs.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-3.0)| [Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer/)| [Documentation](apps/rest-api-dotnet-core)| |
|[.Net Framework](https://docs.microsoft.com/en-us/aspnet/web-api/)| [Microsoft.Owin.Security.Jwt](https://www.nuget.org/packages/Microsoft.Owin.Security.Jwt) |[Documentation](apps/rest-api-dotnet-fw-owin)| A combined [sample](https://github.com/Azure-Samples/active-directory-b2c-dotnet-webapp-and-webapi) for a .NET web application that calls a .NET Web API, both secured using Azure AD B2C.|
|[Node.JS](https://nodejs.org/en/), [express](https://www.npmjs.com/package/express)|[passport](https://www.npmjs.com/package/passport)|[Documentation](apps/rest-api-node-js)| A small node.js Web API [sample](https://github.com/Azure-Samples/active-directory-b2c-javascript-nodejs-webapi) for Azure AD B2C that shows how to protect your web api and accept B2C access tokens using passport.js.|


## Secure web and mobile applications 

|Platform|OAuth2 library|Documentation|Flow/Grant|
|----|----|----|----|
|[.Net Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-3.0) | [Microsoft.AspNetCore.Authentication.AzureADB2C.UI](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.AzureADB2C.UI/)|  [Documentation](apps/web-dotnet-core-oidc-b2cui) | Demonstrates how to implement sign-in to Microsoft through an .Net Core MVC solution by using a traditional web browser-based application and **OpenID Connect**|
|[.Net Framework MVC 5](https://docs.microsoft.com/en-us/aspnet/mvc/overview/getting-started/introduction/getting-started)| [Microsoft.Owin.Security.OpenIdConnect](https://www.nuget.org/packages/Microsoft.Owin.Security.OpenIdConnect/) and [Microsoft.Owin.Security.Cookies](https://www.nuget.org/packages/Microsoft.Owin.Security.Cookies) | [Documentation](apps/web-dotnet-fw-owin-oidc) | Demonstrates how to implement sign-in to Microsoft through an ASP.NET MVC solution by using a traditional web browser-based application and **OpenID Connect**|
|[.Net Framework MVC 5](https://docs.microsoft.com/en-us/aspnet/mvc/overview/getting-started/introduction/getting-started)|  [Microsoft.Owin.Security.OpenIdConnect](https://www.nuget.org/packages/Microsoft.Owin.Security.OpenIdConnect/), [Microsoft.Owin.Security.Cookies](https://www.nuget.org/packages/Microsoft.Owin.Security.Cookies) and [Microsoft.Identity.Client](https://www.nuget.org/packages/Microsoft.Identity.Client/) to obtain the tokens from  Azure AD B2C| [Documentation](apps/web-dotnet-fw-owin-auth-code)  | Demonstrates how to implement sign-in to Microsoft through an ASP.NET MVC solution by using a traditional web browser-based application and **Authorization code grant** flow. Which allows the app to call a REST API with access token|


