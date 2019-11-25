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
    this.oauthService.loadDiscoveryDocument('https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_susi_v1/v2.0/.well-known/openid-configuration')
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
