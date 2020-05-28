# java-rest-api-b2c
This is a Java Spring Boot sample REST API that can use Azure AD B2C as its Identity Provider.

## Background
In the [samples for MSAL J](https://github.com/AzureAD/microsoft-authentication-library-for-java) there is a WebApp called [msal-b2c-web-sample](https://github.com/AzureAD/microsoft-authentication-library-for-java/tree/dev/src/samples/msal-b2c-web-sample) that is a WebApp that uses Azure AD B2C for its authentication. The sample has the possibility of calling a WebAPI to illustrate the use of JWT access token. If you read the Microsoft documentation for B2C, the WebAPI mentioned is a node.js sample. If you are looking for a way to build a Java WebAPI instead, this is that sample.

## Where this sample is derived from
MSAL (Microsoft Authentication Library) is a client side library for aquiring tokens from OIDC/OAuth sources. It is not a library to use on the WebApi side to validate access tokens received. So if you're looking for a Microsoft MSAL sample for how to build a WebApi, you will not find it. But, you can easily create a WebApi out of the sample code in the MSAL samples called [msal-obo-sample](https://github.com/AzureAD/microsoft-authentication-library-for-java/tree/dev/src/samples/msal-obo-sample). This sample demonstrates how you use the On-Behalf-Of authentication flow, but if you remove the OBO functionality that calls downstreams APIs, what remains is a WebApi and a WebApi that can be used together with Azure AD B2C. 

## How to build
You need Docker on your laptop to build this sample, but you don't need Java, Maven, etc, since the [Dockerfile](Dockerfile) does the build for you.

```bash
git clone https://github.com/azure-ad-b2c/apps.git

cd apps/web-java-springboot-api

docker build -t java-rest-api-b2c:v1.0 .
```

## How to test
First you must create your Azure AD B2C instance and either use the User Flows or built your Custom Policies with the Identity Experience Framework. Then you git clone and build the webapp [msal-b2c-web-sample](https://github.com/AzureAD/microsoft-authentication-library-for-java/tree/dev/src/samples/msal-b2c-web-sample) according to the official Microsoft instructions for the sample

Before you run the docker container, you need to set a few variables that needs to be passed as environment variables to the container. The below example can be run in a Terminal window on Mac/Linux or Windows Linux Subsystem

```bash
b2c.tenant=yourtenant.onmicrosoft.com
b2c.host=yourtenant.b2clogin.com
b2cauthoritybase=https://$b2chost/tfp/$b2ctenant/
b2c.clientId=...webapp client_id...
b2c.secret=...webapp secret/key...
b2credirectUri=http://localhost:8080/msal4jsample/secure/aad
b2capi=https://cljungdemob2c-api.azurewebsites.net/hello
b2capiscope=https://$b2ctenant/cljung-jwtms-demo-api/demo.read
policysignupsignin=b2c_1A_UX_signup_signin
policyeditprofile=b2c_1A_UX_edit_profile
```

Then you can start the docker container

```bash
docker run -it --rm -p 8081:8081 -t java-rest-api-b2c:v1.0 \
-e spring.profiles.active=dev \
-e b2c.tenant=$b2ctenant \
-e b2c.host=$b2chost \
-e b2c.authority.base=$b2cauthoritybase \
-e b2c.clientId=$b2cclientId \
-e b2c.secret="$b2csecret" \
-e b2c.redirectUri=$b2credirectUri \
-e b2c.api=$b2capi \
-e b2c.api-scope=$b2capiscope \
-e policy.sign-up-sign-in=$policysignupsignin \
-e policy.edit-profile=$policyeditprofile
```

To test that the API is responding, you can try and access [http://localhost:8081/](http://localhost:8081/) from your browser. You will get a message saying that you are unauthorized, but that is because you didn't pass an access_token, but you should atleast see some activity in the docker container running.

If you build and run the two samples simultaneously, you will have an all Java sample of a WebApp authenticating using Azure AD B2C calling a Java WebAPI with the B2C access token

## Things to pay attention to

**Scope** value to be set in application.properties for the WebApp is the long ***Value*** in portal.azure.com and have a format like this: https://yourtenant.onmicrosoft.com/your-api-name/demo.read. It is easy to get wrong, so copy-n-paste the value from the portal. In application.properties for the **WebApi** you also need to add the long value.

**Secrets** from B2C may contain characters like " and $. In application.properties, you don't need to escape them as everything after the = sign is treated like the settings value by Java. But if you set the secret value in environment variables in bash, powershell or in the env section of the vscode launch.json file, remember to escape the secret characters " and $

**RedirectUri** The error handeling in the WebApp around the login part isn't perfect, so if you have a B2C config error, like the RedirectUri misspelled, you will just land in the error page with no explanation. If you encounter these types of errors, run the page in Chrome with DevTools open and look at the real response from B2C to see the real error.

**Packaging** The WebApp builds to a WAR file that you deploy to Tomcat. If you prefer to run it as a .jar file or debug it in vscode, just change war to jar in the pom.xml file
```XML
<packaging>jar</packaging>
```