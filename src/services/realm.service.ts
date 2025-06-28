import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import https from 'https';
import * as realmDao from '../dao/realm.dao';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js'; // Add this import
import * as dao from '../dao/realm.dao';


interface TokenResponse {
  token: string;
  // add other expected properties
}
// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// For example:
// import * as realmDao from './path/to/realmDao'; 

export const createRealm = async (body: { realmId: string; name: string; createdAt:string}) => {
  console.log("Request body for realm creation:", body);

 const realmId = body.realmId || uuidv4();

  try {
    const tokenResponse = await realmDao.getMarketToken();

    console.log("Token retrieval response:", tokenResponse);

  if (!tokenResponse || typeof tokenResponse !== 'object' || !('token' in tokenResponse) || typeof tokenResponse.token !== 'string') {
      return {
        status: 'failed',
        error: true,
        msg: 'Authentication token error: No token available or token retrieval failed.',
      };
    }

    const typedTokenResponse = tokenResponse as TokenResponse;

    const accessToken = typedTokenResponse.token;

    console.log("accessTokenaccessTokenaccessToken",accessToken);
    

    // --- Keycloak Realm Creation ---
    const keycloakConfig = {
      method: 'post',
      url: `${process.env.KEYCLOAK_URL}/admin/realms`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
         "id": realmId,
        "realm": body.name,
        "notBefore": 0,
        "revokeRefreshToken": false,
        "refreshTokenMaxReuse": 0,
        "accessTokenLifespan": 300,
        "accessTokenLifespanForImplicitFlow": 900,
        "ssoSessionIdleTimeout": 1800,
        "ssoSessionMaxLifespan": 36000,
        "ssoSessionIdleTimeoutRememberMe": 0,
        "ssoSessionMaxLifespanRememberMe": 0,
        "offlineSessionIdleTimeout": 2592000,
        "offlineSessionMaxLifespanEnabled": false,
        "offlineSessionMaxLifespan": 5184000,
        "clientSessionIdleTimeout": 0,
        "clientSessionMaxLifespan": 0,
        "accessCodeLifespan": 60,
        "accessCodeLifespanUserAction": 300,
        "accessCodeLifespanLogin": 1800,
        "actionTokenGeneratedByAdminLifespan": 43200,
        "actionTokenGeneratedByUserLifespan": 300,
        "enabled": true,
        "sslRequired": "external",
        "registrationAllowed": false,
        "registrationEmailAsUsername": false,
        "rememberMe": false,
        "verifyEmail": false,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "resetPasswordAllowed": false,
        "editUsernameAllowed": false,
        "bruteForceProtected": false,
        "permanentLockout": false,
        "maxFailureWaitSeconds": 900,
        "minimumQuickLoginWaitSeconds": 60,
        "waitIncrementSeconds": 60,
        "quickLoginCheckMilliSeconds": 1000,
        "maxDeltaTimeSeconds": 43200,
        "failureFactor": 30,
        "defaultRoles": [
          "offline_access",
          "uma_authorization"
        ],
        "requiredCredentials": [
          "password"
        ],
        "otpPolicyType": "totp",
        "otpPolicyAlgorithm": "HmacSHA1",
        "otpPolicyInitialCounter": 0,
        "otpPolicyDigits": 6,
        "otpPolicyLookAheadWindow": 1,
        "otpPolicyPeriod": 30,
        "otpSupportedApplications": [
          "FreeOTP",
          "Google Authenticator"
        ],
        "webAuthnPolicyRpEntityName": "keycloak",
        "webAuthnPolicySignatureAlgorithms": [
          "ES256"
        ],
        "webAuthnPolicyRpId": "",
        "webAuthnPolicyAttestationConveyancePreference": "not specified",
        "webAuthnPolicyAuthenticatorAttachment": "not specified",
        "webAuthnPolicyRequireResidentKey": "not specified",
        "webAuthnPolicyUserVerificationRequirement": "not specified",
        "webAuthnPolicyCreateTimeout": 0,
        "webAuthnPolicyAvoidSameAuthenticatorRegister": false,
        "webAuthnPolicyAcceptableAaguids": [],
        "webAuthnPolicyPasswordlessRpEntityName": "keycloak",
        "webAuthnPolicyPasswordlessSignatureAlgorithms": [
          "ES256"
        ],
        "webAuthnPolicyPasswordlessRpId": "",
        "webAuthnPolicyPasswordlessAttestationConveyancePreference": "not specified",
        "webAuthnPolicyPasswordlessAuthenticatorAttachment": "not specified",
        "webAuthnPolicyPasswordlessRequireResidentKey": "not specified",
        "webAuthnPolicyPasswordlessUserVerificationRequirement": "not specified",
        "webAuthnPolicyPasswordlessCreateTimeout": 0,
        "webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister": false,
        "webAuthnPolicyPasswordlessAcceptableAaguids": [],
        "browserSecurityHeaders": {
          "contentSecurityPolicyReportOnly": "",
          "xContentTypeOptions": "nosniff",
          "xRobotsTag": "none",
          "xFrameOptions": "SAMEORIGIN",
          "contentSecurityPolicy": "frame-src 'self'; frame-ancestors 'self'; object-src 'none';",
          "xXSSProtection": "1; mode=block",
          "strictTransportSecurity": "max-age=31536000; includeSubDomains"
        },
        "smtpServer": {},
        "eventsEnabled": false,
        "eventsListeners": [
          "jboss-logging"
        ],
        "enabledEventTypes": [],
        "adminEventsEnabled": false,
        "adminEventsDetailsEnabled": false,
        "internationalizationEnabled": false,
        "supportedLocales": [],
        "browserFlow": "browser",
        "registrationFlow": "registration",
        "directGrantFlow": "direct grant",
        "resetCredentialsFlow": "reset credentials",
        "clientAuthenticationFlow": "clients",
        "dockerAuthenticationFlow": "docker auth",
        "attributes": {},
        "userManagedAccessAllowed": false
      }),
    };

    console.log("keycloakConfigkeycloakConfig",keycloakConfig);
    

    let keycloakResponse;
    try {
      keycloakResponse = await axios(keycloakConfig);
      console.log("Keycloak Realm creation successful:", keycloakResponse.data);
    } catch (axiosError: any) {
      console.error('Axios error creating Keycloak realm:', axiosError.response?.data || axiosError.message);
      return {
        status: 'failed',
        error: true,
        msg: `Keycloak Realm creation failed: ${axiosError.response?.data?.errorMessage || axiosError.message}.`,
      };
    }

    // --- Post to localhost:4002/organisation ---
    try {
     
      const organisationResponse = await dao.createRealmDao(body);
      console.log("Organisation creation successful:", organisationResponse);

      return {
        status: 'success',
        error: false,
        msg: `Realm '${body.name}' and organisation created successfully.`,
        data: {
          keycloakRealm: keycloakResponse.data,
          organisation: organisationResponse.data,
        },
      };

    } catch (axiosError: any) {
      console.error('Axios error posting to /organisation:', axiosError.response?.data || axiosError.message);
      return {
        status: 'failed',
        error: true,
        msg: `Keycloak Realm created, but Organisation creation failed: ${axiosError.response?.data?.message || axiosError.message}. You might need to manually handle the organisation creation or implement a rollback.`,
        data: {
          keycloakRealm: keycloakResponse.data, // Still return the successfully created realm data
        },
      };
    }

  } catch (error: any) {
    // This catches errors from realmDao.getMarketToken() or other unexpected issues
    console.error("Unexpected error in createRealm function:", error);
    return {
      status: 'failed',
      error: true,
      msg: `An unexpected error occurred: ${error.message}.`,
    };
  }
};