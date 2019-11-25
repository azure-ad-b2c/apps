# Angular Single-Page Application built on angular-auth-oidc-client with Azure AD B2C

This sample shows how to build a SPA application using [angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client),  a client-side JavaScript SDK for authenticating with OAuth2 that performs identity management with Azure AD B2C. It assumes you have some familiarity with Azure AD B2C. If you'd like to learn all that B2C has to offer, start with [Azure AD B2C documentation](http://aka.ms/aadb2c).

The app is a simple web application that performs sign-in, sign-up, and sign-out functions with signIn-signUp policy . Once the user signed it present the JWT token, so you can use is as a Bearer token, to call a REST API. It is intended to help get you started with Azure AD B2C in a simple web application built on [angular-auth-oidc-client](https://www.npmjs.com/package/angular-auth-oidc-client), giving you the necessary tools to execute Azure AD B2C policies & securely identify users in your application.


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

## 4. Add angular-auth-oidc-client package

### 3.1 Installation angular-auth-oidc-client
The [angular-auth-oidc-client package is available on NPM](https://www.npmjs.com/package/angular-auth-oidc-client). From [VS Code terminal](https://code.visualstudio.com/docs/editor/integrated-terminal), run following command:

```
npm install angular-auth-oidc-client
```
### 3.2 Import and initialize the angular-auth-oidc-client

TBD

### 3.3 Create configuration module

TBD

### 3.4 Initialize the OAuth service and add the login and logout methods
TBD
### 3.5 Add sign-in and sign-out buttons

TBD