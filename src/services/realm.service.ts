import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import https from 'https';
import * as realmDao from '../dao/realm.dao';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js'; // Add this import
import * as dao from '../dao/realm.dao';
import { Profile } from '../types/User';


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

export const createRealm = async (body: {
    realmId: string; name: string; createdAt:string, userDetails:Profile
}) => {
  console.log("Request body for realm creation:", body);
const name = body.name
 const realmId = body.realmId || uuidv4();

const userDetails =  body.userDetails

console.log("userdetailsuserdetails",userDetails);


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
     
      const organisationResponse = await dao.createRealmDao(realmId,body);
      console.log("Organisation creation successful:", organisationResponse);      


        const groupResponse = await createGroup(name);
        console.log("rgoupResponsergoupResponse",groupResponse);

        const groupName = 'administrative';
        const groupDaoResponse = await dao.createGroupDao(groupResponse,name, groupName);
        console.log("groupDaoResponse creation successful:", groupDaoResponse);

       const userResponse = await createUser(name,groupResponse,body.userDetails);
        console.log("userResponseuserResponse",userResponse);

          const userDaoResponse = await dao.createUserDao(userResponse,groupResponse, userDetails);
        console.log("groupDaoResponse creation successful:", userDaoResponse);

         const roleResponse = await createRole(name,groupResponse,userResponse);
        console.log("roleResponseroleResponse",roleResponse);
        
        const rolesDaoResponse = await dao.createRolesDao(roleResponse,groupName,name, userDetails);
        console.log("groupDaoResponse creation successful:", userDaoResponse);


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




export const createGroup = async (name:string): Promise<string> => {
  const groupName = 'administrative';
 const tokenResponse = await realmDao.getMarketToken();
  const typedTokenResponse = tokenResponse as TokenResponse;

    const accessToken = typedTokenResponse.token;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const keycloakBase = `${process.env.KEYCLOAK_URL}/admin/realms/${name}`; // Replace with actual 
  
  console.log("keycloakBasekeycloakBase",keycloakBase);
  

  // Check if group exists
  const res = await axios.get(`${keycloakBase}/groups`, { headers });
  const existingGroup = res.data.find((g: any) => g.name === groupName);

  if (existingGroup) return existingGroup.id;

  // Create group
  await axios.post(`${keycloakBase}/groups`, { name: groupName }, { headers });

  // Fetch again to get the new group's ID
  const updatedGroups = await axios.get(`${keycloakBase}/groups`, { headers });
  const newGroup = updatedGroups.data.find((g: any) => g.name === groupName);

  return newGroup?.id;
};


export const createUser = async (realmName:string,groupId:string,user:Profile) => {

    console.log("userrrrrrr",user);
    
  const tokenResponse = await realmDao.getMarketToken();
  const typedTokenResponse = tokenResponse as TokenResponse;

    const accessToken = typedTokenResponse.token;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

 
  const userPayload = {
    username:user.first_name,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    enabled: true,
 
  };

  console.log('Creating user:', userPayload);

  const keycloakBase = `${process.env.KEYCLOAK_URL}/admin/realms/${realmName}`; // Replace with actual values

  await axios.post(`${keycloakBase}/users`, userPayload, { headers });

  // Retrieve user ID by querying the username
  const usersResponse = await axios.get(`${keycloakBase}/users?username=${userPayload.firstName}`, { headers });
  console.log("usersResponseusersResponse",usersResponse.data[0]);
  
  const createdUser = usersResponse.data[0].id;
 await axios.put(`${keycloakBase}/users/${createdUser}/groups/${groupId}`, {}, { headers });
console.log(`Role '${createdUser}' assigned to user '${groupId}' successfully.`);

  console.log('User created: in service', createdUser);

 return createdUser;
};


export const createRole = async (realmName: string, groupId: string, userId: string) => {
  const tokenResponse = await realmDao.getMarketToken();
  const typedTokenResponse = tokenResponse as TokenResponse;
  const accessToken = typedTokenResponse.token;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const roleName = "realmAdmin";
  const keycloakBase = `${process.env.KEYCLOAK_URL}/admin/realms/${realmName}`;

  try {
    // Attempt to create the role
    await axios.post(`${keycloakBase}/roles`, { name: roleName }, { headers });
    console.log(`Role '${roleName}' created successfully.`);
  } catch (err: any) {
    if (err.response?.status === 409) {
      console.warn(`Role '${roleName}' already exists in realm '${realmName}'. Proceeding with assignment.`);
    } else if (err.response?.status === 404) {
      console.error(`Attempted to create role '${roleName}' but received 404. Keycloak base URL or realm might be incorrect.`);
      throw err;
    } else {
      console.error(`Error creating role '${roleName}' in realm '${realmName}':`, err);
      throw err;
    }
  }

  try {
      const role = (await axios.get(`${keycloakBase}/roles/${roleName}`, { headers })).data;
        console.log('Role data:', role);
    // Assign role to group and user (whether newly created or already existing)
    const rolePayload = [{ name: roleName }];
    
    await axios.post(`${keycloakBase}/groups/${groupId}/role-mappings/realm`, [role], { headers });
    console.log(`Role '${roleName}' assigned to group '${groupId}' successfully.`);
    
    await axios.post(`${keycloakBase}/users/${userId}/role-mappings/realm`, [role], { headers });
    console.log(`Role '${roleName}' assigned to user '${userId}' successfully.`);
    
    return roleName;
  } catch (err: any) {
    console.error(`Error assigning role '${roleName}':`, err);
    throw err;
  }
};


export const getRealmsevice = async (id:string) => {
    return await dao.getRealmDao(id);
};
 