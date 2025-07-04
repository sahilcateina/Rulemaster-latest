import axios, { AxiosResponse } from 'axios';
import { createClient } from '@supabase/supabase-js';
import { body,Profile } from '../types/User';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Interface for Keycloak token response
interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  'not-before-policy': number;
  scope: string;
}

// Interface for our token response
interface TokenResponse {
  token: string;
}

// Environment validation
const validateEnvironment = (): void => {
  if (!process.env.KEYCLOAK_URL) {
    throw new Error('KEYCLOAK_URL environment variable is required');
  }
  if (!process.env.KEYCLOAK_ADMIN_USERNAME) {
    console.warn('KEYCLOAK_ADMIN_USERNAME not set, using default "admin"');
  }
  if (!process.env.KEYCLOAK_ADMIN_PASSWORD) {
    console.warn('KEYCLOAK_ADMIN_PASSWORD not set, using default "admin"');
  }
};

export const getMarketToken = async (): Promise<TokenResponse> => {
  console.log("Inside getMarketToken Dao");
  
  try {
    validateEnvironment();
    
    const keycloakURL = process.env.KEYCLOAK_URL!;
    const adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
    
    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", "admin-cli");
    urlencoded.append("username", adminUsername);
    urlencoded.append("password", adminPassword);
    urlencoded.append("grant_type", "password");

    const response: AxiosResponse<KeycloakTokenResponse> = await axios.post(
      `${keycloakURL}/realms/master/protocol/openid-connect/token`,
      urlencoded,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 second timeout
      }
    );
  
    console.log('Token request successful');
    console.log("Access token received:", response.data.access_token ? "✓" : "✗");
    
    if (!response.data.access_token) {
      throw new Error('No access token received from Keycloak');
    }
    
    return {
      token: response.data.access_token
    };
    
  } catch (error: any) {
    console.error("Error getting market token:", error.message);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Keycloak error response:", error.response.status, error.response.data);
        throw new Error(`Keycloak authentication failed: ${error.response.status} - ${error.response.data?.error_description || error.response.statusText}`);
      } else if (error.request) {
        console.error("No response from Keycloak server");
        throw new Error('Unable to connect to Keycloak server');
      }
    }
    
    throw new Error(`Token retrieval failed: ${error.message}`);
  }
};

export const createRealmDao = async (realmId:string,body: body,userId:string) => {
  try {
    const result = await supabase
      .from('organization')
      .insert({
        id:realmId,
        name:body.name,
        created_at:new Date().toISOString().replace('T', ' ').split('.')[0],
        admin_id:userId
      })
      .select()
      .single()
    
    if (result.error) {
      console.error('Supabase error creating user:', result.error);
      throw new Error(`Failed to create user: ${result.error.message}`);
    }
    
    return result;
    
  } catch (error: any) {
    console.error('Error in createUser:', error.message);
    throw error;
  }
};


export const createGroupDao = async (groupResponse:string,realmName:string, groupName:string,userId:string,realmId:string) => {
  try {
    const result = await supabase
      .from('groups')
      .insert({
        id:groupResponse,
        tenant_name:realmName,
        tenant_id:realmId,
        group_name:groupName,
        created_at:new Date().toISOString().replace('T', ' ').split('.')[0],
        admin_id:userId
      })
      .select()
      .single()
    
    if (result.error) {
      console.error('Supabase error creating user:', result.error);
      throw new Error(`Failed to create user: ${result.error.message}`);
    }
    
    return result;
    
  } catch (error: any) {
    console.error('Error in createUser:', error.message);
    throw error;
  }
};

export const createUserDao = async (id:string, groupId:string,userDetail:Profile) => {

    console.log("userDetailuserDetailuserDetail",userDetail,id,groupId);
    
  try {
    const result = await supabase
      .from('users')
      .insert({
        id:id,
        group_id:groupId,
        first_name:userDetail.first_name,
        last_name:userDetail.last_name,
        email:userDetail.email,
        created_at:new Date().toISOString().replace('T', ' ').split('.')[0],
        admin_id:userDetail.userId
      })
      .select();
    
    if (result.error) {
      console.error('Supabase error creating user:', result.error);
      throw new Error(`Failed to create user: ${result.error.message}`);
    }
    
    return result;
    
  } catch (error: any) {
    console.error('Error in createUser:', error.message);
    throw error;
  }
};

export const createRolesDao = async (roleName:string, groupName:string,realmName:string,userDetail:Profile,realmId:string) => {

    
  try {
    const result = await supabase
      .from('roles')
      .insert({
        role_name:roleName,
        group_name:groupName,
        tenant_id:realmId,
        tenant_name:realmName,
        created_at:new Date().toISOString().replace('T', ' ').split('.')[0],
        admin_id:userDetail.userId
      })
      .select();
    
    if (result.error) {
      console.error('Supabase error creating user:', result.error);
      throw new Error(`Failed to create user: ${result.error.message}`);
    }
    
    return result;
    
  } catch (error: any) {
    console.error('Error in createUser:', error.message);
    throw error;
  }
};

// Utility function to validate token (optional)
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const keycloakURL = process.env.KEYCLOAK_URL!;
    
    await axios.get(`${keycloakURL}/realms/master/protocol/openid-connect/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });
    
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export const getRealmDao = async (id:string) => {
  return await supabase
    .from('organization')
    .select("*")
    .eq("admin_id",id)
    .order('created_at', { ascending: false });
};