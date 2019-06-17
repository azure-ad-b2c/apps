import { AuthConfig } from 'angular-oauth2-oidc';
 
export const authConfig: AuthConfig = {
 
  // Url of the Identity Provider
  issuer: 'https://your-tenant.b2clogin.com/de678512-5915-46fd-ae83-a5df4ec052be/v2.0/',
 
  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/',
 
  // The SPA's id. The SPA is registered with this id at the auth-server
  clientId: 'ebce2d28-8fb8-4cc7-83ae-accc9d73ee9d',
 
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  //scope: 'openid ebce2d28-8fb8-4cc7-83ae-accc9d73ee9d',
  scope: 'openid https://your-tenant.onmicrosoft.com/spa-app/read https://your-tenant.onmicrosoft.com/spa-app/write',

  strictDiscoveryDocumentValidation: false

}