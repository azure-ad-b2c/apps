import { OpenIdConfiguration } from 'angular-auth-oidc-client';
export const authConfig: OpenIdConfiguration = {
    stsServer: 'https://localhost:44363',
    redirect_url: window.location.origin + '/',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences not trusted by the Client.
    client_id: 'singleapp',
    response_type: 'code', // 'id_token token' Implicit Flow
    scope: 'dataEventRecords openid',
    post_logout_redirect_uri: window.location.origin + '/Unauthorized',
    start_checksession: false,
    silent_renew: true,
    silent_renew_url: window.location.origin + '/silent-renew.html',
    post_login_route: '/dataeventrecords',

    forbidden_route: '/Forbidden',
    // HTTP 401
    unauthorized_route: '/Unauthorized',
    log_console_warning_active: true,
    log_console_debug_active: true,
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    max_id_token_iat_offset_allowed_in_seconds: 10,
}
