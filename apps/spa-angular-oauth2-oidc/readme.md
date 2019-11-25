# Angular Single-Page Application built on angular-oauth2-oidc with Azure AD B2C

This sample shows how to build a SPA application using [angular-oauth2-oidc](https://www.npmjs.com/package/angular-oauth2-oidc),  a client-side JavaScript SDK for authenticating with OAuth2 that performs identity management with Azure AD B2C. It assumes you have some familiarity with Azure AD B2C. If you'd like to learn all that B2C has to offer, start with [Azure AD B2C documentation](http://aka.ms/aadb2c).

The app is a simple web application that performs sign-in, sign-up, and sign-out functions with signIn-signUp policy . Once the user signed it present the JWT token, so you can use is as a Bearer token, to call a REST API. It is intended to help get you started with Azure AD B2C in a simple web application built on [angular-oauth2-oidc](https://www.npmjs.com/package/angular-oauth2-oidc), giving you the necessary tools to execute Azure AD B2C policies & securely identify users in your application.


## 1. Create an Angular application 

We use [Angular CLI tool](https://cli.angular.io/) to create the application a simple [Angular 7](https://angular.io/) application. But, you can use any existing or new application. To install and use the command-line interface as well as run the Angular application server, you'll need the [Node.js](https://nodejs.org/) JavaScript runtime and [npm](https://www.npmjs.com/) (the Node.js package manager) installed. npm is included with Node.js, which you can install from [here](https://nodejs.org/en/download/).

>**Tip**: To test that you have Node.js and npm correctly installed on your machine, you can type `node --version` and `npm --version`.

To install the Angular CLI, in a terminal or command prompt type:

```bash
npm install -g @angular/cli
```

This may take a few minutes to install. You can now create a new Angular application by typing:

```bash
ng new my-app
```

`my-app` is the name of the folder for your application. This may take a few minutes to create the Angular application in [TypeScript](/docs/languages/typescript.md) and install its dependencies.

Let's quickly run our Angular application by navigating to the new folder and typing `ng serve` to start the web server and open the application in a browser:

```bash
cd my-app
ng serve --open
```

You should see "Welcome to app!!" on [http://localhost:4200](http://localhost:4200) in your browser. 

![Angular App](media/angular-app.png)

We'll leave the web server running while we look at the application with VS Code. To open your Angular application in VS Code, open another terminal (or command prompt) and navigate to the `my-app` folder and type `code .`:

```bash
cd my-app
code .
``` 

## 2. Create your own policies

Create one policy of each type by following [the instructions here](https://azure.microsoft.com/documentation/articles/active-directory-b2c-reference-policies).  You may choose to include as many or as few identity providers as you wish. If you already have existing policies in your Azure AD B2C tenant, feel free to reuse those. No need to create new ones just for this sample.

## 3. Create your own application

A Web application needs to be registered in your Azure AD B2C tenant before they can accept and respond to protected resource requests by client applications that present an access token.

1. From Azure AD B2C, select **Applications**, and then select **Add**.
1. Enter a name for the application. For example, `My Angular App`.
1. For **Include web app/ web API** and **Allow implicit flow**, select Yes.
1. For **Reply URL**, enter an endpoint where Azure AD B2C should return any tokens that your application requests. In this tutorial, the Angular sample runs locally and listens at `http://localhost:4200`.
1. For **App ID URI**, enter the identifier used for your web API. The full identifier URI including the domain is generated for you. For example, `https://your-tenant.onmicrosoft.com/angular-api`.
1. Click **Create**.
1. On the properties page, record the **Application ID** that you'll use when you configure the web application.

### 3.1 Configure scopes
Scopes provide a way to govern access to protected resources. Scopes are used by the web API to implement scope-based access control. For example, some users could have both read and write access, whereas other users might have read-only permissions. In this tutorial, you define read permissions for the web API.

1. Select **Applications**, and then select `My Angular App`.
1. Select **Published Scopes**.
1. For **scope**, enter `read`, and for **description**, enter `Read access`.
1. Add another **scope**, `write`, and for **description**, enter `Write access`.
1. Click **Save**.

### 3.2 Grant permissions
To call a protected web API from an application, you need to grant your application permissions to the API. 

1. Select **API access**, and then select **Add**.
1. In the **Select API** dropdown, select `My Angular App`.
1. In the **Select Scopes** dropdown, select the `read` and `write` scopes that you previously defined.
1. Click **OK**.

## 4. Add angular-oauth2-oidc package

### 3.1 Installation angular-oauth2-oidc
The [angular-oauth2-oidc package is available on NPM](https://www.npmjs.com/package/angular-oauth2-oidc). From [VS Code terminal](https://code.visualstudio.com/docs/editor/integrated-terminal), run following command:

```
npm i angular-oauth2-oidc --save
```
### 3.2 Import and initialize the angular-oauth2-oidc

Open `src/app/app.module.ts` and import `OAuthModule` the `HttpClientModule` libraries.

```TypeScript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

//Sample: Import the necessary libraries 
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    //Sample: Import the necessary libraries 
    HttpClientModule,
    OAuthModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 3.3 Create configuration module

Under the **app** folder create a new file: **auth.config.ts**. This class contains the configuration to sign-in and sign-out using Azure AD B2C.

Replce the `your-tenant` with your tenant name, and `app-id` with your app Id.

```TypeScript
import { AuthConfig } from 'angular-oauth2-oidc';
 
export const authConfig: AuthConfig = {
 
  // Url of the Identity Provider
  issuer: 'https://your-tenant.b2clogin.com/your-tenant-id/v2.0/',
 
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/',
 
  // The SPA's id. The SPA is registered with this id at the auth-server
  clientId: 'your-app-id',
 
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  //scope: 'openid your-app-id',
  
  // Or the API scopes  
  scope: 'openid https://your-tenant.onmicrosoft.com/spa-app/read https://your-tenant.onmicrosoft.com/spa-app/write',

  strictDiscoveryDocumentValidation: false

}
```

### 3.4 Initialize the OAuth service and add the login and logout methods
In the `src/app/app.component.ts` import the `OAuthService` and `AuthConfig` to use your Azure AD B2C settings. Then add some fuctions, such as `login()` and `logout()` methods.

Replace the `tenant-name` with your tenant name, and `policy-name` with your policy name

```TypeScript
import { Component } from '@angular/core';

// Sample: Import the OAuth service with the token validation
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';

// Sample: Import configuration module
import { authConfig } from './auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-app';

  // Sample: inject and initiate the OAuth service  
  constructor(private oauthService: OAuthService) {
    
    // Sample: You can send custom query string paramters to Azure AD B2C sign-up or sign-in page, such as login_hint and ui_locales
    //authConfig.customQueryParams =  { 'login_hint': 'bob@contoso.com', 'ui_locales': 'es' };
    
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    
    //this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocument('https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy/v2.0/.well-known/openid-configuration')
    this.oauthService.tryLogin();
  }

  // Sample: Login method
  public login() {
    this.oauthService.initImplicitFlow();
  }

  // Sample: Logout method
  public logout() {
    this.oauthService.logOut();
  }

  // Sample: Call this function before using the access token, to make sure you have a valid access token
  public getToken() {
    if (!this.oauthService.hasValidAccessToken()) {
      console.log("Refreshing the token")
      this.oauthService.silentRefresh();
    }
    else
    {
      console.log("Token is still valid")
    };
  }
  
  // Sample: Get the dispaly name claim
  public get name() {
    const claims = this.oauthService.getIdentityClaims();
    if (!claims) {
      return null;
    }
    return claims['name'];
  }

  // Sample: Get the access token
  public get token() {
    return this.oauthService.getAccessToken();
  }

  // Sample: Get the access token expiration ticks (numeric)
  public get tokenExpiration() {
    return new Date(this.oauthService.getAccessTokenExpiration());
  }

  // Sample: Get the access token expiration date (in date format)
  public get tokenExpirationDate() {
    return this.oauthService.getAccessTokenExpiration();
  }
}
```

### 3.5 Add sign-in and sign-out buttons

In this step, you add the sign-in and sign-out buttons. Open the `src/app/app.component.html` file and add following code. 

```HTML
<div style="text-align:center">
  <h1>
    Welcome to {{ title }}!
  </h1>
  <img width="300" alt="Angular Logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg==">
</div>

<h1 *ngIf="!name">
  Hallo
</h1>
<h1 *ngIf="name">
  Hallo, {{name}}
</h1>

<button class="btn btn-default" *ngIf="!name" (click)="login()">
  Login
</button>
<button class="btn btn-default" *ngIf="name" (click)="logout()">
  Logout
</button>

<button class="btn btn-default" *ngIf="name" (click)="getToken()">
    Get a token
  </button>

<div class="form-group" *ngIf="name">
  <label for="token">Access token:</label>
  <textarea class="form-control" rows="5" columns="20" id="token">{{token}}</textarea>
</div>

<div class="row" *ngIf="name">
  Token expiration: ({{tokenExpiration}})
  <br />
  Token expiration date: ({{tokenExpirationDate}})
</div>
```
