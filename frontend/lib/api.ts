export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Turns FastAPI error payloads into a readable message.
 *
 * `detail` is a plain string for normal HTTPExceptions, but an array of
 * objects for validation errors (422). Passing that array straight into
 * `new Error()` stringifies it as the literal text "[object Object]".
 */
function formatApiError(detail: unknown, fallback: string): string {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }

        return typeof item === 'string' ? item : null;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return fallback;
}

// ==================== AUTH TYPES ====================

export interface User {
  id: number;
  party_id: number;
  username: string;
  email: string;
  display_name?: string;
  role?: string;
  is_active: boolean;
  account_status: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan_number?: string;
  aadhaar_number?: string;
  legal_name?: string;
  remarks?: string;
  country?: string;
}

export type RegisterResponse = User;

// ==================== AUTH API ====================

export async function registerUser(data: RegisterData, idempotencyKey = crypto.randomUUID()): Promise<RegisterResponse> {
  const { phone, ...fields } = data;
  const payload = {
    ...fields,
    mobile_number: data.mobile_number || phone,
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Registration failed'));
  }

  return response.json();
}

// Alias for compatibility
export const register = registerUser;

// ==================== OTP API ====================

export interface OTPSendResponse {
  message: string;
  expires_in_minutes: number;
}

export interface OTPVerifyResponse {
  message: string;
  verified: boolean;
}

export async function sendOTP(email: string, purpose: string = 'registration'): Promise<OTPSendResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ destination: email, purpose }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Failed to send OTP'));
  }

  return response.json();
}

export async function verifyOTP(email: string, otpCode: string, purpose: string = 'registration'): Promise<OTPVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ destination: email, otp_code: otpCode, purpose: purpose || 'registration' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Invalid or expired OTP'));
  }

  return response.json();
}

export async function loginUser(credentials: LoginCredentials & { role?: string }, idempotencyKey = crypto.randomUUID()): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      role: credentials.role || 'user'
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(formatApiError(errorJson.detail, 'Login failed'));
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error('Login failed. Please try again.');
      }
      throw e;
    }
  }

  return response.json();
}

export async function logoutUser(token?:string|null): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(token ? {'Authorization':`Bearer ${token}`} : {}),
    },
    credentials: 'include',
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

export async function refreshToken(): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = 'Token refresh failed';

    try {
      const error = await response.json();
      errorMessage = formatApiError(error.detail, errorMessage);
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(errorMessage);
  }

  const data: TokenResponse = await response.json();

  localStorage.setItem('finplan_token', data.access_token);

  return data;
}




async function advisorRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const makeRequest = async (accessToken: string) => {
    const headers = new Headers(options.headers);

    headers.set('Authorization', `Bearer ${accessToken}`);
    headers.set('Accept', 'application/json');

    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(`${API_BASE_URL}/advisors${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  let response = await makeRequest(token);

  // Access token expired/invalid → refresh and retry once
  if (response.status === 401) {
    try {
      const refreshed = await refreshToken();

      response = await makeRequest(refreshed.access_token);
    } catch (error) {
      console.error('Automatic token refresh failed:', error);

      localStorage.removeItem('finplan_token');
      localStorage.removeItem('finplan_refresh_token');
      localStorage.removeItem('finplan_user');

      window.location.href = '/login';

      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

// ==================== PASSWORD RESET API ====================

export interface ForgotPasswordResponse {
  message: string;
  expires_in_minutes: number;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Failed to send password reset OTP'));
  }

  return response.json();
}

export async function resetPassword(email: string, otpCode: string, newPassword: string): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      otp_code: otpCode,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Password reset failed'));
  }

  return response.json();
}

// ==================== ADVISOR API ====================

export interface AdvisorDashboard {
  advisor_name: string;
  email: string;
  portfolio_value: number;
  portfolio_change: number;
  total_reports: number;
  pending_reports: number;
  unread_messages: number;
  last_login: string | null;
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  total_aum: number;
  avg_portfolio_size: number;
  client_satisfaction: number;
  reviews_completed: number;
  upcoming_reviews: number;
}

export interface AdvisorPortfolio {
  holdings: Array<{
    name: string;
    value: number;
    allocation: number;
    returns: number;
  }>;
  total_value: number;
  total_cost: number;
  total_returns: number;
  returns_percentage: number;
}

export type AdvisorDocuments = DocumentListResponse;
export type AdvisorMessages = MessageListResponse;

export interface AdvisorProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  member_since: string;
  plan_type: string;
  display_name?: string | null;
  mobile_number?: string | null;
}

export async function advisorFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = { method: 'GET' }
): Promise<T> {
  const response = await advisorRequest(endpoint, token, options);

  if (!response.ok) {
    let errorMessage = 'Request failed';

    try {
      const error = await response.json();
      errorMessage = formatApiError(error.detail, errorMessage);
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export function getAdvisorDashboard(token: string): Promise<AdvisorDashboard> {
  return advisorFetch('/dashboard', token);
}

export function getAdvisorPortfolio(token: string): Promise<AdvisorPortfolio> {
  return advisorFetch('/portfolio', token);
}

export interface FinancialReportClient {
  customer_id: number;
  customer_name: string;
  assets: number;
  liabilities: number;
  net_worth: number;
  invested_value: number;
  current_value: number;
  unrealized_gain: number;
  goal_target: number;
  goal_funding: number;
}

export interface AccessContext {
  user_id: number;
  session_id?: number | null;
  party_id: number;
  organization_id: number;
  actor_type: 'HEAD' | 'EMPLOYEE' | 'CLIENT';
  employee_id?: number | null;
  customer_id?: number | null;
  roles: string[];
  permissions: string[];
  denied_permissions: string[];
  customer_ids: number[];
  subscription_status: string;
  subscription_active: boolean;
  subscription_period_end?: string | null;
  subscription_grace_ends_at?: string | null;
  entitlements: string[];
  limits: Record<string, number>;
}

export async function getAccessContext(token: string): Promise<AccessContext | null> {
  const response = await fetch(`${API_BASE_URL}/auth/access-context`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (response.status === 403) return null;
  if (!response.ok) throw new Error('Unable to resolve account access');
  return response.json();
}

export interface OrganizationBootstrapResponse {
  organization_id: number;
  branch_id: number;
  employee_id: number;
  role: string;
  organization_code: string;
  branch_code: string;
}

export async function bootstrapOrganization(
  token: string,
  organizationName: string,
  branchName: string,
): Promise<OrganizationBootstrapResponse> {
  const response = await fetch(`${API_BASE_URL}/onboarding/organization`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ organization_name: organizationName, branch_name: branchName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiError(error.detail, 'Organization setup failed'));
  }
  return response.json();
}

export interface OrganizationAdminProfile {
  id: number; organization_code: string; legal_name: string; trade_name?: string | null;
  registration_number?: string | null; pan_number?: string | null; gst_number?: string | null;
  organization_type?: string | null; financial_year_start?: string | null;
  default_currency_code?: string | null; timezone?: string | null;
  email?: string | null; phone?: string | null; website?: string | null; logo_url?: string | null;
  is_active: boolean; created_at: string; updated_at?: string | null;
}
export interface AdminBranch { id:number; organization_id:number; branch_code:string; branch_name:string; branch_type?:string|null; parent_branch_id?:number|null; email?:string|null; phone?:string|null; address?:string|null; city?:string|null; district?:string|null; state?:string|null; country?:string|null; postal_code?:string|null; opening_date?:string|null; closing_date?:string|null; remarks?:string|null; is_active:boolean; }
export interface AdminDepartment { id:number; organization_id:number; branch_id:number; department_code:string; department_name:string; description?:string|null; is_active:boolean; }
export interface AdminDesignation { id:number; organization_id:number; designation_code:string; designation_name:string; hierarchy_level?:number|null; description?:string|null; is_active:boolean; }

async function adminOrganizationRequest<T>(token:string, path:string, options:RequestInit={}):Promise<T> {
  const response=await fetch(`${API_BASE_URL}/admin/organization${path}`, { ...options, headers:{ Authorization:`Bearer ${token}`, Accept:'application/json', ...(options.body?{'Content-Type':'application/json'}:{}), ...options.headers } });
  if(!response.ok){const error=await response.json(); throw new Error(formatApiError(error.detail,'Organization request failed'));}
  return response.json();
}
export type ApplicationConfigurationSection = 'COMMON' | 'PRE_SALES' | 'DOMAIN_RELATED';
export interface ApplicationConfigurationVersion {
  id: number;
  section: ApplicationConfigurationSection;
  version: number;
  values: Record<string, unknown>;
  created_by: number;
  created_at: string;
}
async function adminConfigurationRequest<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/admin/configuration${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(formatApiError(error?.detail, 'Configuration request failed'));
  }
  return response.json();
}
export const getApplicationConfiguration = (token: string, section: ApplicationConfigurationSection) =>
  adminConfigurationRequest<ApplicationConfigurationVersion | null>(token, `/${section}`);
export const listApplicationConfigurationHistory = (token: string, section: ApplicationConfigurationSection) =>
  adminConfigurationRequest<ApplicationConfigurationVersion[]>(token, `/${section}/history`);
export const saveApplicationConfiguration = (token: string, section: ApplicationConfigurationSection, expectedVersion: number, values: Record<string, unknown>) =>
  adminConfigurationRequest<ApplicationConfigurationVersion>(token, `/${section}`, {
    method: 'PUT', body: JSON.stringify({ expected_version: expectedVersion, values }),
  });
export const getAdminOrganization=(token:string)=>adminOrganizationRequest<OrganizationAdminProfile>(token,'');
export const updateAdminOrganization=(token:string,data:Partial<OrganizationAdminProfile>)=>adminOrganizationRequest<OrganizationAdminProfile>(token,'',{method:'PUT',body:JSON.stringify(data)});
export const listAdminBranches=(token:string,all=true)=>adminOrganizationRequest<AdminBranch[]>(token,`/branches?include_inactive=${all}`);
export const createAdminBranch=(token:string,data:Partial<AdminBranch>,key=crypto.randomUUID())=>adminOrganizationRequest<AdminBranch>(token,'/branches',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminBranch=(token:string,id:number,data:Partial<AdminBranch>)=>adminOrganizationRequest<AdminBranch>(token,`/branches/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminBranchActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminBranch>(token,`/branches/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminBranchActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/branches/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export const listAdminDepartments=(token:string,all=true)=>adminOrganizationRequest<AdminDepartment[]>(token,`/departments?include_inactive=${all}`);
export const createAdminDepartment=(token:string,data:Partial<AdminDepartment>,key=crypto.randomUUID())=>adminOrganizationRequest<AdminDepartment>(token,'/departments',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminDepartment=(token:string,id:number,data:Partial<AdminDepartment>)=>adminOrganizationRequest<AdminDepartment>(token,`/departments/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminDepartmentActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminDepartment>(token,`/departments/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminDepartmentActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/departments/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export const listAdminDesignations=(token:string,all=true)=>adminOrganizationRequest<AdminDesignation[]>(token,`/designations?include_inactive=${all}`);
export const createAdminDesignation=(token:string,data:Partial<AdminDesignation>,key=crypto.randomUUID())=>adminOrganizationRequest<AdminDesignation>(token,'/designations',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminDesignation=(token:string,id:number,data:Partial<AdminDesignation>)=>adminOrganizationRequest<AdminDesignation>(token,`/designations/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminDesignationActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminDesignation>(token,`/designations/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminDesignationActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/designations/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});

export interface AdminEmployee {
  id:number; organization_id:number; party_id:number; employee_code:string;
  first_name?:string|null; middle_name?:string|null; last_name?:string|null; display_name:string;
  personal_email?:string|null; mobile_number?:string|null; date_of_birth?:string|null;
  branch_id:number; department_id:number; designation_id:number;
  employment_type:string; joining_date:string; confirmation_date?:string|null; relieving_date?:string|null;
  employment_status:string; official_email?:string|null; official_mobile?:string|null;
  reporting_manager_employee_id?:number|null; remarks?:string|null; is_active:boolean; created_at:string;
}
export interface AdminEmployeeInput {
  employee_code:string; first_name:string; middle_name?:string|null; last_name?:string|null;
  display_name?:string|null; personal_email?:string|null; mobile_number?:string|null; date_of_birth?:string|null;
  branch_id:number; department_id:number; designation_id:number; employment_type:string; joining_date:string;
  confirmation_date?:string|null; official_email:string; official_mobile?:string|null;
  reporting_manager_employee_id?:number|null; remarks?:string|null;
}
export interface AdminEmploymentHistory {
  id:number; effective_from?:string|null; effective_to?:string|null; remarks?:string|null;
  branch_id?:number|null; department_id?:number|null; designation_id?:number|null; manager_employee_id?:number|null;
}
export interface AdminEmployeeHistory {
  branches:AdminEmploymentHistory[]; departments:AdminEmploymentHistory[]; designations:AdminEmploymentHistory[]; reporting:AdminEmploymentHistory[];
}
export const listAdminEmployees=(token:string,all=true,filters?:{search?:string;employment_status?:string;branch_id?:number})=>{const query=new URLSearchParams({include_inactive:String(all)});if(filters?.search)query.set('search',filters.search);if(filters?.employment_status)query.set('employment_status',filters.employment_status);if(filters?.branch_id)query.set('branch_id',String(filters.branch_id));return adminOrganizationRequest<AdminEmployee[]>(token,`/employees?${query}`);};
export const getAdminEmployee=(token:string,id:number)=>adminOrganizationRequest<AdminEmployee>(token,`/employees/${id}`);
export const createAdminEmployee=(token:string,data:AdminEmployeeInput,idempotencyKey=crypto.randomUUID())=>adminOrganizationRequest<AdminEmployee>(token,'/employees',{method:'POST',headers:{'Idempotency-Key':idempotencyKey},body:JSON.stringify(data)});
export const updateAdminEmployee=(token:string,id:number,data:Partial<AdminEmployee>)=>adminOrganizationRequest<AdminEmployee>(token,`/employees/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminEmployeeActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminEmployee>(token,`/employees/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminEmployeeActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/employees/bulk/${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export const getAdminEmployeeHistory=(token:string,id:number)=>adminOrganizationRequest<AdminEmployeeHistory>(token,`/employees/${id}/history`);

export interface AdminPermission { id:number; permission_code:string; permission_name:string; module_name:string; }
export interface AdminPermissionProfile { id:number; profile_code:string; profile_name:string; description?:string|null; organization_id?:number|null; }
export interface AdminPermissionOverride { permission_code:string; allow_access:boolean; }
export interface AdminEmployeePermissionState { employee_id:number; profiles:AdminPermissionProfile[]; overrides:AdminPermissionOverride[]; }
async function adminAccessRequest<T>(token:string,path:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(`${API_BASE_URL}/admin/access${path}`,{...options,headers:{Authorization:`Bearer ${token}`,Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'Access request failed'));}return response.json();
}
export const listAdminPermissions=(token:string)=>adminAccessRequest<AdminPermission[]>(token,'/permissions');
export const listAdminPermissionProfiles=(token:string)=>adminAccessRequest<AdminPermissionProfile[]>(token,'/profiles');
export const getAdminEmployeePermissions=(token:string,id:number)=>adminAccessRequest<AdminEmployeePermissionState>(token,`/employees/${id}`);
export const setAdminEmployeeProfiles=(token:string,id:number,profileIds:number[])=>adminAccessRequest<AdminEmployeePermissionState>(token,`/employees/${id}/profiles`,{method:'PUT',body:JSON.stringify({profile_ids:profileIds})});
export const setAdminEmployeeOverrides=(token:string,id:number,overrides:AdminPermissionOverride[])=>adminAccessRequest<AdminEmployeePermissionState>(token,`/employees/${id}/overrides`,{method:'PUT',body:JSON.stringify({overrides})});
export type AdminAssignmentEntityType='CUSTOMER'|'CUSTOMER_GROUP'|'BRANCH';
export interface AdminEmployeeAssignment { id:number; employee_id:number; assignment_type:string; entity_type:AdminAssignmentEntityType; entity_id:number; entity_name:string; effective_from:string; effective_to?:string|null; is_primary:boolean; remarks?:string|null; is_active:boolean; }
export interface AdminEmployeeAssignmentInput { entity_type:AdminAssignmentEntityType; entity_id:number; effective_from:string; is_primary?:boolean; remarks?:string|null; }
export const listAdminEmployeeAssignments=(token:string,id:number,history=true)=>adminAccessRequest<AdminEmployeeAssignment[]>(token,`/employees/${id}/assignments?include_history=${history}`);
export const createAdminEmployeeAssignment=(token:string,id:number,data:AdminEmployeeAssignmentInput)=>adminAccessRequest<AdminEmployeeAssignment>(token,`/employees/${id}/assignments`,{method:'POST',body:JSON.stringify(data)});
export const endAdminEmployeeAssignment=(token:string,employeeId:number,assignmentId:number,effectiveTo:string)=>adminAccessRequest<AdminEmployeeAssignment>(token,`/employees/${employeeId}/assignments/${assignmentId}/end`,{method:'POST',body:JSON.stringify({effective_to:effectiveTo})});
export interface AdminEmployeeActivity { id:number; actor_user_id?:number|null; actor_name?:string|null; module_name?:string|null; action?:string|null; old_values?:Record<string,unknown>|null; new_values?:Record<string,unknown>|null; created_at:string; }
export const listAdminEmployeeActivity=(token:string,id:number)=>adminAccessRequest<AdminEmployeeActivity[]>(token,`/employees/${id}/activity`);
export interface AdminAgency {id:number;organization_id:number;party_id:number;agency_code:string;name:string;legal_name?:string|null;pan?:string|null;gstin?:string|null;email?:string|null;mobile_number?:string|null;registration_number?:string|null;branch_id?:number|null;primary_contact_party_id?:number|null;start_date:string;end_date?:string|null;status:string;remarks?:string|null;is_active:boolean;created_at:string;}
export interface AdminAssociate {id:number;organization_id:number;party_id:number;associate_code:string;associate_type:string;name:string;legal_name?:string|null;pan?:string|null;email?:string|null;mobile_number?:string|null;branch_id?:number|null;agency_id?:number|null;joining_date:string;end_date?:string|null;status:string;referral_code?:string|null;remarks?:string|null;is_active:boolean;created_at:string;}
export interface AdminArnHolder {id:number;organization_id:number;arn_number:string;holder_party_id:number;holder_name:string;holder_type:'ORGANIZATION'|'EMPLOYEE'|'ASSOCIATE'|'AGENCY'|'OTHER';branch_id?:number|null;employee_id?:number|null;associate_id?:number|null;agency_id?:number|null;registration_date?:string|null;valid_from?:string|null;valid_to?:string|null;status:'ACTIVE'|'EXPIRED'|'SUSPENDED'|'INACTIVE';remarks?:string|null;is_active:boolean;created_at:string;}
type ExternalInput=Record<string,unknown>;
export const listAdminAgencies=(token:string,all=true)=>adminOrganizationRequest<AdminAgency[]>(token,`/agencies?include_inactive=${all}`);
export const createAdminAgency=(token:string,data:ExternalInput,key=crypto.randomUUID())=>adminOrganizationRequest<AdminAgency>(token,'/agencies',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminAgency=(token:string,id:number,data:ExternalInput)=>adminOrganizationRequest<AdminAgency>(token,`/agencies/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminAgencyActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminAgency>(token,`/agencies/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminAgencyActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/agencies/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export const listAdminAssociates=(token:string,all=true)=>adminOrganizationRequest<AdminAssociate[]>(token,`/associates?include_inactive=${all}`);
export const createAdminAssociate=(token:string,data:ExternalInput,key=crypto.randomUUID())=>adminOrganizationRequest<AdminAssociate>(token,'/associates',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminAssociate=(token:string,id:number,data:ExternalInput)=>adminOrganizationRequest<AdminAssociate>(token,`/associates/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminAssociateActive=(token:string,id:number,active:boolean)=>adminOrganizationRequest<AdminAssociate>(token,`/associates/${id}/${active?'reactivate':'deactivate'}`,{method:'POST'});
export const bulkSetAdminAssociateActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/associates/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export const listAdminArnHolders=(token:string,all=true)=>adminOrganizationRequest<AdminArnHolder[]>(token,`/arn-holders?include_inactive=${all}`);
export const createAdminArnHolder=(token:string,data:ExternalInput,key=crypto.randomUUID())=>adminOrganizationRequest<AdminArnHolder>(token,'/arn-holders',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(data)});
export const updateAdminArnHolder=(token:string,id:number,data:ExternalInput)=>adminOrganizationRequest<AdminArnHolder>(token,`/arn-holders/${id}`,{method:'PUT',body:JSON.stringify(data)});
export const setAdminArnStatus=(token:string,id:number,status:AdminArnHolder['status'],reason?:string)=>adminOrganizationRequest<AdminArnHolder>(token,`/arn-holders/${id}/status`,{method:'POST',body:JSON.stringify({status,reason:reason||null})});
export const bulkSetAdminArnActive=(token:string,ids:number[],active:boolean)=>adminOrganizationRequest<{updated_ids:number[]}>(token,`/arn-holders/bulk-${active?'reactivate':'deactivate'}`,{method:'POST',body:JSON.stringify({ids})});
export interface AdminArnStatusHistory {id:number;arn_holder_id:number;old_status:string|null;new_status:string;changed_at:string;changed_by:number;reason:string|null;}
export const listAdminArnStatusHistory=(token:string,id:number)=>adminOrganizationRequest<AdminArnStatusHistory[]>(token,`/arn-holders/${id}/history`);
export interface AdminArnDocument {id:number;document_type:number;file_name:string|null;file_size:number|null;uploaded_at:string;}
export const listAdminArnDocuments=(token:string,id:number)=>adminOrganizationRequest<AdminArnDocument[]>(token,`/arn-holders/${id}/documents`);
export async function uploadAdminArnDocument(token:string,id:number,type:string,file:File):Promise<AdminArnDocument>{
  const data=new FormData();data.append('document_type',type);data.append('file',file);
  const response=await fetch(`${API_BASE_URL}/admin/organization/arn-holders/${id}/documents`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:data});
  if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'ARN document upload failed'));}
  return response.json();
}
export async function downloadAdminArnDocument(token:string,arnId:number,documentId:number):Promise<Blob>{
  const response=await fetch(`${API_BASE_URL}/admin/organization/arn-holders/${arnId}/documents/${documentId}/download`,{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'ARN document download failed'));}
  return response.blob();
}
export interface AccessInvitation { id:number;employee_id?:number|null;customer_id?:number|null;invitation_type:string;email:string;status:string;expires_at:string;created_at:string;invitation_url?:string|null; }
export async function createEmployeeInvitation(token:string,employeeId:number,key=crypto.randomUUID()):Promise<AccessInvitation>{const response=await fetch(`${API_BASE_URL}/admin/invitations`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({employee_id:employeeId,expires_in_hours:72})});if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'Invitation failed'));}return response.json();}
export async function createClientInvitation(token:string,customerId:number,key=crypto.randomUUID()):Promise<AccessInvitation>{const response=await fetch(`${API_BASE_URL}/admin/client-invitations`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({customer_id:customerId,expires_in_hours:72})});if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'Invitation failed'));}return response.json();}
export async function previewAccessInvitation(token:string){const response=await fetch(`${API_BASE_URL}/auth/invitations/preview?token=${encodeURIComponent(token)}`);if(!response.ok)throw new Error('Invitation is invalid or expired');return response.json() as Promise<{email:string;display_name:string;invitation_type:string;organization_id:number;expires_at:string}>;}
export async function acceptAccessInvitation(token:string,password:string){const response=await fetch(`${API_BASE_URL}/auth/invitations/accept`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password})});if(!response.ok){const error=await response.json();throw new Error(formatApiError(error.detail,'Unable to accept invitation'));}return response.json() as Promise<{message:string;email:string}>;}
export interface EmployeeDashboardData {employee_id:number;organization_id:number;actor_type:string;assigned_client_count:number;permissions:string[];subscription_status:string;}
export interface EmployeeAssignedClient {id:number;customer_code:string;display_name:string;email?:string|null;mobile_number?:string|null;status:string;}
async function employeeFetch<T>(token:string,path:string):Promise<T>{const response=await fetch(`${API_BASE_URL}/employee${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Employee request failed'));}return response.json();}
export const getEmployeeDashboard=(token:string)=>employeeFetch<EmployeeDashboardData>(token,'/dashboard');
export const getEmployeeClients=(token:string)=>employeeFetch<EmployeeAssignedClient[]>(token,'/clients');
export interface ClientPortalDashboard {customer_id:number;display_name:string;customer_code:string;email?:string|null;mobile_number?:string|null;goal_count:number;account_count:number;}
async function clientPortalFetch<T>(token:string,path:string):Promise<T>{const response=await fetch(`${API_BASE_URL}/client-portal${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Unable to load client portal'));}return response.json();}
export const getClientPortalDashboard=(token:string)=>clientPortalFetch<ClientPortalDashboard>(token,'/dashboard');
export interface ClientPortalProfile {customer_id:number;customer_code:string;display_name:string;first_name?:string|null;middle_name?:string|null;last_name?:string|null;email?:string|null;mobile_number?:string|null;date_of_birth?:string|null;occupation?:string|null;resident_status?:string|null;}
export interface ClientPortalGoal {id:number;title:string;goal_type:string;target_amount:number;current_amount:number;target_date:string;priority:number;status:string;}
export interface ClientPortalHolding {id:number;security_type:string;security_name:string;symbol?:string|null;quantity:number;average_cost:number;current_price:number;valuation_as_of?:string|null;}
export interface ClientPortalInvestment {id:number;account_type:string;account_nature:string;account_name:string;institution_name?:string|null;account_number_masked?:string|null;currency_code:string;current_balance:number;valuation_as_of?:string|null;status:string;holdings:ClientPortalHolding[];}
export interface ClientPortalTransaction {id:number;transaction_date:string;transaction_type:string;amount:number;description?:string|null;status:string;reference_number?:string|null;}
export interface ClientPortalHousehold {id:number;group_name:string;group_type:string;members:{customer_id:number;display_name:string;relationship_type?:string|null;is_group_head:boolean}[];}
export const getClientPortalProfile=(token:string)=>clientPortalFetch<ClientPortalProfile>(token,'/profile');
export const getClientPortalGoals=(token:string)=>clientPortalFetch<ClientPortalGoal[]>(token,'/goals');
export const getClientPortalInvestments=(token:string)=>clientPortalFetch<ClientPortalInvestment[]>(token,'/investments');
export const getClientPortalTransactions=(token:string)=>clientPortalFetch<ClientPortalTransaction[]>(token,'/transactions');
export const getClientPortalHousehold=(token:string)=>clientPortalFetch<ClientPortalHousehold|null>(token,'/household');
export interface PortalPublication {id:number;customer_id:number;resource_type:'DOCUMENT'|'REPORT';resource_id:number;published_at:string;revoked_at?:string|null;status:'PUBLISHED'|'REVOKED';}
export interface ClientPortalDocument {id:number;publication_id:number;document_type:string;document_name:string;description?:string|null;file_name?:string|null;file_type?:string|null;file_size?:number|null;published_at:string;}
export interface ClientPortalReport {id:number;publication_id:number;title:string;report_type:string;report_date:string;period_start:string;period_end:string;created_at:string;published_at:string;assumptions:Record<string,unknown>;client:Record<string,number|string>;}
export const listPortalPublications=(token:string,customerId:number,includeRevoked=false)=>advisorFetch<PortalPublication[]>(`/clients/${customerId}/portal-publications?include_revoked=${includeRevoked}`,token);
export const publishPortalResource=(token:string,customerId:number,resourceType:'DOCUMENT'|'REPORT',resourceId:number)=>advisorFetch<PortalPublication>(`/clients/${customerId}/portal-publications`,token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resource_type:resourceType,resource_id:resourceId})});
export const revokePortalPublication=(token:string,customerId:number,publicationId:number)=>advisorFetch<PortalPublication>(`/clients/${customerId}/portal-publications/${publicationId}/revoke`,token,{method:'POST'});
export const getClientPortalDocuments=(token:string)=>clientPortalFetch<ClientPortalDocument[]>(token,'/documents');
export const getClientPortalReports=(token:string)=>clientPortalFetch<ClientPortalReport[]>(token,'/reports');
async function clientPortalDownload(token:string,path:string):Promise<Blob>{const response=await fetch(`${API_BASE_URL}/client-portal${path}`,{headers:{Authorization:`Bearer ${token}`}});if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Download failed'));}return response.blob();}
export const downloadClientPortalDocument=(token:string,id:number)=>clientPortalDownload(token,`/documents/${id}/download`);
export const downloadClientPortalReport=(token:string,id:number)=>clientPortalDownload(token,`/reports/${id}/download`);
export interface ClientPortalAccessStatus {customer_id:number;user_id?:number|null;has_account:boolean;enabled:boolean;account_status:string;pending_invitation:boolean;revoked_sessions?:number;}
async function clientPortalAccessRequest<T>(token:string,customerId:number,path='',options?:RequestInit):Promise<T>{const response=await fetch(`${API_BASE_URL}/admin/clients/${customerId}/portal-access${path}`,{...options,headers:{Authorization:`Bearer ${token}`,...options?.headers}});if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Portal access request failed'));}return response.json();}
export const getClientPortalAccessStatus=(token:string,customerId:number)=>clientPortalAccessRequest<ClientPortalAccessStatus>(token,customerId);
export const enableClientPortalAccess=(token:string,customerId:number)=>clientPortalAccessRequest<ClientPortalAccessStatus>(token,customerId,'/enable',{method:'POST'});
export const disableClientPortalAccess=(token:string,customerId:number)=>clientPortalAccessRequest<ClientPortalAccessStatus>(token,customerId,'/disable',{method:'POST'});
export interface AdminClientAccess {customer_id:number;customer_code:string;display_name:string;email?:string|null;mobile_number?:string|null;customer_status:string;has_account:boolean;enabled:boolean;account_status:string;pending_invitation:boolean;}
export async function listAdminClientAccess(token:string,search?:string,status?:string):Promise<AdminClientAccess[]>{const query=new URLSearchParams();if(search?.trim())query.set('search',search.trim());if(status)query.set('status',status);const response=await fetch(`${API_BASE_URL}/admin/client-access${query.size?`?${query}`:''}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Unable to load client access'));}return response.json();}
export interface ClientPortalMessage {id:number;message_type:string;subject?:string|null;body:string;status:string;sent_at:string;sender_name:string;}
export const getClientPortalMessages=(token:string)=>clientPortalFetch<ClientPortalMessage[]>(token,'/messages');

export interface FinancialSummaryReport {
  report_date: string;
  client_count: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  invested_value: number;
  current_value: number;
  unrealized_gain: number;
  goal_target: number;
  goal_funding: number;
  clients: FinancialReportClient[];
}

export function getFinancialSummaryReport(token: string): Promise<FinancialSummaryReport> {
  return advisorFetch('/reports/financial-summary', token);
}

export interface CashFlowReport {
  period_start: string;
  period_end: string;
  total_inflows: number;
  total_outflows: number;
  net_cash_flow: number;
  months: Array<{
    month: string;
    inflows: number;
    outflows: number;
    net_cash_flow: number;
  }>;
}

export function getCashFlowReport(token: string): Promise<CashFlowReport> {
  return advisorFetch('/reports/cash-flow', token);
}

export interface ReportSnapshotSummary {
  id: number;
  title: string;
  report_type: string;
  report_date: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface ReportSnapshot extends ReportSnapshotSummary {
  assumptions: Record<string, unknown>;
  payload: {
    financial_summary: FinancialSummaryReport;
    cash_flow: CashFlowReport;
  };
}

export async function listReportSnapshots(token: string): Promise<{
  reports: ReportSnapshotSummary[];
  total: number;
}> {
  return advisorFetch('/reports/snapshots', token);
}

export async function getReportSnapshot(token: string, snapshotId: number): Promise<ReportSnapshot> {
  return advisorFetch(`/reports/snapshots/${snapshotId}`, token);
}

export async function createReportSnapshot(token: string, title?: string, idempotencyKey = crypto.randomUUID()): Promise<ReportSnapshot> {
  return advisorFetch('/reports/snapshots', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ title: title || null }),
  });
}

export function getAdvisorDocuments(token: string): Promise<AdvisorDocuments> {
  return getDocuments(token);
}

export function getAdvisorMessages(token: string): Promise<AdvisorMessages> {
  return getMessages(token);
}

export function getAdvisorProfile(token: string): Promise<AdvisorProfile> {
  return advisorFetch('/profile', token);
}

// ==================== CLIENT MANAGEMENT ====================

export interface Client {
  id: number;
  advisor_id: number;

  customer_code?: string | null;
  status?: string | null;
  resident_status?: string | null;
  onboarding_date?: string | null;

  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  alternate_phone?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  gender?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  pan_number?: string | null;
  aadhar_number?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  annual_income?: number | null;
  net_worth?: number | null;
  risk_profile?: string | null;
  investment_experience?: string | null;
  nominee_name?: string | null;
  nominee_relation?: string | null;
  nominee_contact?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
  kyc_status?: string | null;
  kyc_verified_date?: string | null;
  kyc_document_url?: string | null;
  notes?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  is_active: boolean;
  assigned_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ClientCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  pan_number?: string;
  aadhar_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  annual_income?: number;
  net_worth?: number;
  risk_profile?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_type?: string;
  kyc_status?: string;
  notes?: string;
}

// Updates can explicitly clear optional values with null.
export type ClientUpdate = {
  [K in keyof ClientCreate]?: ClientCreate[K] | null;
};

export interface ClientListResponse {
  clients: Client[];
  total: number;
  page: number;
  page_size: number;
}

export async function advisorPost(
  endpoint: string,
  token: string,
  body: unknown,
  idempotencyKey?: string,
) {
  const response = await advisorRequest(endpoint, token, {
    method: 'POST',
    ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    console.error('API ERROR:', {
      status: response.status,
      body: errorBody,
    });

    throw new Error(
      formatApiError(
        errorBody?.detail,
        errorBody ? JSON.stringify(errorBody, null, 2) : 'Request failed',
      ),
    );
  }

  return response.json();
}

export async function advisorPut(
  endpoint: string,
  token: string,
  body: unknown,
) {
  const response = await advisorRequest(endpoint, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(formatApiError(error?.detail, 'Request failed'));
  }

  return response.json();
}

export async function advisorDelete(
  endpoint: string,
  token: string,
) {
  const response = await advisorRequest(endpoint, token, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(formatApiError(error?.detail, 'Request failed'));
  }

  return response.json();
}

export function getClients(
  token: string,
  params?: { page_size?: number; page?: number; search?:string; customer_status?:string; risk_profile?:string },
): Promise<ClientListResponse> {
  const queryParams = new URLSearchParams();

  const safePage = params?.page ? Math.max(1, Math.trunc(params.page)) : undefined;
  const safePageSize = params?.page_size
    ? Math.min(100, Math.max(1, Math.trunc(params.page_size)))
    : undefined;

  if (safePage) queryParams.set('page', String(safePage));
  if (safePageSize) queryParams.set('page_size', String(safePageSize));
  if (params?.search) queryParams.set('search', params.search);
  if (params?.customer_status) queryParams.set('customer_status', params.customer_status);
  if (params?.risk_profile) queryParams.set('risk_profile', params.risk_profile);

  const qs = queryParams.toString();
  return advisorFetch(`/clients${qs ? `?${qs}` : ''}`, token);
}

export function getClientById(
  token: string,
  id: string,
): Promise<Client> {
  return advisorFetch(`/clients/${id}`, token);
}

export function updateClient(
  token: string,
  clientId: string,
  data: ClientUpdate,
): Promise<Client> {
  return advisorPut(`/clients/${clientId}`, token, data);
}

export function createClient(token: string, data: ClientCreate, idempotencyKey = crypto.randomUUID()): Promise<Client> {
  return advisorFetch<Client>('/clients', token, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(data),
  });
}

export function getClient(token: string, id: number): Promise<Client> {
  return advisorFetch(`/clients/${id}`, token);
}

export interface ClientRiskParameters {
  risk_code: string | null;
  configuration_version: number | null;
  parameters: {
    equity_allocation_pct: string;
    debt_allocation_pct: string;
    expected_equity_return_pct: string;
    expected_debt_return_pct: string;
  } | null;
}
export function getClientRiskParameters(token: string, id: number): Promise<ClientRiskParameters> {
  return advisorFetch(`/clients/${id}/risk-parameters`, token);
}

export function deleteClient(token: string, id: number): Promise<{ message: string }> {
  return advisorDelete(`/clients/${id}`, token);
}

export async function downloadAdvisorDocument(token:string,documentId:number):Promise<Blob>{
  const response=await advisorRequest(`/documents/${documentId}/download`,token);
  if(!response.ok){const error=await response.json().catch(()=>null);throw new Error(formatApiError(error?.detail,'Document download failed'));}
  return response.blob();
}

export interface ClientKYC {
  customer_id: number;
  kyc_status: string;
  kyc_verified_date?: string | null;
  kyc_expiry_date?: string | null;
  verification_method?: string | null;
  verification_reference?: string | null;
  politically_exposed_person: boolean;
  remarks?: string | null;
}

export interface KYCHistory {
  id: number;
  previous_status?: string | null;
  new_status?: string | null;
  reviewed_on: string;
  reviewed_by?: number | null;
  review_reason?: string | null;
}

export interface ServiceTeamMember {
  assignment_id: number;
  employee_id: number;
  employee_name: string;
  role: string;
  effective_from: string;
  remarks?: string | null;
}

export interface EmployeeOption {
  id: number;
  display_name: string;
  employee_code: string;
}

export function getClientKYC(token: string, clientId: number): Promise<ClientKYC> {
  return advisorFetch(`/clients/${clientId}/kyc`, token);
}

export function updateClientKYC(token: string, clientId: number, payload: Partial<ClientKYC> & { kyc_status: string; review_reason?: string }): Promise<ClientKYC> {
  return advisorFetch(`/clients/${clientId}/kyc`, token, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
}

export function getClientKYCHistory(token: string, clientId: number): Promise<KYCHistory[]> {
  return advisorFetch(`/clients/${clientId}/kyc/history`, token);
}

export function getClientServiceTeam(token: string, clientId: number): Promise<ServiceTeamMember[]> {
  return advisorFetch(`/clients/${clientId}/service-team`, token);
}

export function getServiceTeamEmployees(token: string, clientId: number): Promise<EmployeeOption[]> {
  return advisorFetch(`/clients/${clientId}/service-team/employees`, token);
}

export function addClientServiceTeamMember(token: string, clientId: number, employeeId: number, role: string): Promise<ServiceTeamMember> {
  return advisorFetch(`/clients/${clientId}/service-team`, token, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId, role }),
  });
}

export async function removeClientServiceTeamMember(token: string, clientId: number, assignmentId: number): Promise<void> {
  const response = await advisorRequest(`/clients/${clientId}/service-team/${assignmentId}`, token, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove service-team member');
}

export type GoalType =
  | 'RETIREMENT'
  | 'EDUCATION'
  | 'HOME_PURCHASE'
  | 'WEALTH_CREATION'
  | 'OTHER';

export type GoalStatus =
  | 'ACTIVE'
  | 'ON_TRACK'
  | 'NEEDS_ATTENTION'
  | 'ACHIEVED'
  | 'PAUSED'
  | 'CANCELLED';

export interface FinancialGoal {
  id: number;
  organization_id: number;
  customer_id?: number | null;
  customer_group_id?: number | null;
  goal_type: GoalType;
  title: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: number;
  expected_inflation_rate?: number | null;
  expected_return_rate?: number | null;
  status: GoalStatus;
  remarks?: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at?: string | null;
}

export interface FinancialGoalInput {
  customer_id?: number;
  customer_group_id?: number;
  goal_type: GoalType;
  title: string;
  description?: string | null;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  priority?: number;
  expected_inflation_rate?: number | null;
  expected_return_rate?: number | null;
  status?: GoalStatus;
  remarks?: string | null;
}

export function getClientGoals(token: string, customerId: number): Promise<{ goals: FinancialGoal[]; total: number }> {
  return advisorFetch(`/goals?customer_id=${customerId}`, token);
}
export function getGroupGoals(token: string, groupId: number): Promise<{ goals: FinancialGoal[]; total: number }> {
  return advisorFetch(`/goals?customer_group_id=${groupId}`, token);
}

export function createFinancialGoal(token: string, data: FinancialGoalInput, idempotencyKey = crypto.randomUUID()): Promise<FinancialGoal> {
  return advisorPost('/goals', token, data, idempotencyKey);
}

export function updateFinancialGoal(
  token: string,
  goalId: number,
  data: Partial<Omit<FinancialGoalInput, 'customer_id' | 'customer_group_id'>>,
): Promise<FinancialGoal> {
  return advisorPut(`/goals/${goalId}`, token, data);
}

export function archiveFinancialGoal(token: string, goalId: number): Promise<{ message: string }> {
  return advisorDelete(`/goals/${goalId}`, token);
}

export type FinancialAccountType =
  | 'BANK' | 'CASH' | 'MUTUAL_FUND_FOLIO' | 'BROKERAGE_DEMAT'
  | 'FIXED_DEPOSIT' | 'PPF' | 'EPF' | 'NPS'
  | 'INSURANCE_CASH_VALUE' | 'LOAN' | 'OTHER';

export type FinancialAccountStatus = 'ACTIVE' | 'CLOSED' | 'MATURED' | 'FROZEN';

export interface FinancialAccount {
  id: number;
  organization_id: number;
  customer_id?: number | null;
  customer_group_id?: number | null;
  account_type: FinancialAccountType;
  account_nature: 'ASSET' | 'LIABILITY';
  account_name: string;
  institution_name?: string | null;
  account_number_masked?: string | null;
  currency_code: string;
  current_balance: number;
  valuation_as_of?: string | null;
  opened_on?: string | null;
  maturity_date?: string | null;
  interest_rate?: number | null;
  status: FinancialAccountStatus;
  remarks?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FinancialAccountInput {
  customer_id?: number;
  customer_group_id?: number;
  account_type: FinancialAccountType;
  account_name: string;
  institution_name?: string | null;
  account_number_masked?: string | null;
  currency_code?: string;
  current_balance?: number;
  valuation_as_of?: string | null;
  opened_on?: string | null;
  maturity_date?: string | null;
  interest_rate?: number | null;
  status?: FinancialAccountStatus;
  remarks?: string | null;
}

export function getClientFinancialAccounts(token: string, customerId: number): Promise<{ accounts: FinancialAccount[]; total: number }> {
  return advisorFetch(`/financial-accounts?customer_id=${customerId}`, token);
}
export function getGroupFinancialAccounts(token: string, groupId: number): Promise<{ accounts: FinancialAccount[]; total: number }> {
  return advisorFetch(`/financial-accounts?customer_group_id=${groupId}`, token);
}

export function createFinancialAccount(token: string, data: FinancialAccountInput, idempotencyKey = crypto.randomUUID()): Promise<FinancialAccount> {
  return advisorPost('/financial-accounts', token, data, idempotencyKey);
}

export function updateFinancialAccount(
  token: string,
  accountId: number,
  data: Partial<Omit<FinancialAccountInput, 'customer_id' | 'customer_group_id'>>,
): Promise<FinancialAccount> {
  return advisorPut(`/financial-accounts/${accountId}`, token, data);
}

export function archiveFinancialAccount(token: string, accountId: number): Promise<{ message: string }> {
  return advisorDelete(`/financial-accounts/${accountId}`, token);
}

export interface InvestmentHolding {
  id: number; financial_account_id: number; security_type: string; security_name: string;
  symbol?: string | null; isin?: string | null; folio_number?: string | null;
  quantity: number; average_cost: number; current_price: number;
  invested_value: number; current_value: number; gain: number; gain_percentage: number;
  valuation_as_of?: string | null; remarks?: string | null;
}
export function getAccountHoldings(token: string, accountId: number): Promise<{ holdings: InvestmentHolding[]; total: number }> {
  return advisorFetch(`/holdings?financial_account_id=${accountId}`, token);
}
export function createHolding(token: string, data: Omit<InvestmentHolding, 'id' | 'invested_value' | 'current_value' | 'gain' | 'gain_percentage'>, idempotencyKey = crypto.randomUUID()): Promise<InvestmentHolding> {
  return advisorPost('/holdings', token, data, idempotencyKey);
}
export function updateHolding(token: string, id: number, data: Partial<InvestmentHolding>): Promise<InvestmentHolding> {
  return advisorPut(`/holdings/${id}`, token, data);
}
export function archiveHolding(token: string, id: number): Promise<{ message: string }> {
  return advisorDelete(`/holdings/${id}`, token);
}

export interface GroupFinancialSummary {
  group_id: number; active_member_count: number; account_count: number; holding_count: number;
  total_assets: number; total_liabilities: number; net_worth: number;
  invested_value: number; holdings_value: number; unrealized_gain: number;
  goal_count: number; goal_target_amount: number; goal_current_amount: number;
}
export function getGroupFinancialSummary(token: string, groupId: number): Promise<GroupFinancialSummary> {
  return advisorFetch(`/groups/${groupId}/financial-summary`, token);
}

// ==================== MARKET DATA ====================

export interface MarketData {
  nifty50: number;
  nifty50_change: number;
  nifty50_change_percent: number;
  sensex: number;
  sensex_change: number;
  sensex_change_percent: number;
  gold_price: number;
  gold_change: number;
  gold_change_percent: number;
  last_updated: string;
}

export async function fetchMarketData(): Promise<MarketData> {
  try {
    const response = await fetch(`${API_BASE_URL}/market/live`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as MarketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return fallback data
    return {
      nifty50: 24891.0,
      nifty50_change: 295.35,
      nifty50_change_percent: 1.2,
      sensex: 81456.0,
      sensex_change: 889.15,
      sensex_change_percent: 1.1,
      gold_price: 6180.0,
      gold_change: 45.0,
      gold_change_percent: 0.73,
      last_updated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };
  }
  
}

/**
 * Local (timezone-naive) datetime string for the `from_date` / `to_date`
 * query params, matching how meetings are stored in the database.
 */
function toLocalDateTimeParam(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export async function getAdvisorTodayMeetings(
  token: string
): Promise<MeetingListResponse> {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  return getMeetings(token, {
    from_date: toLocalDateTimeParam(startOfDay),
    to_date: toLocalDateTimeParam(endOfDay),
  });
}


// ============================================================
// GROUPS / HOUSEHOLDS
// ============================================================

export type GroupType =
  | 'HOUSEHOLD'
  | 'FAMILY'
  | 'BUSINESS'
  | 'INVESTMENT'
  | 'TRUST'
  | 'HUF'
  | 'OTHER';

export interface Group {
  id: number;
  organization_id: number;
  group_code: string;
  group_name: string;
  group_type: GroupType | string;

  head_customer_id: number | null;
  head_customer_name: string | null;

  primary_branch_id: number | null;
  primary_advisor_employee_id: number | null;

  risk_profile: string | null;
  investment_objective: string | null;
  remarks: string | null;

  is_active: boolean;

  member_count: number;
  active_member_count: number;

  created_at: string;
  updated_at: string | null;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
}

export interface GroupMember {
  id: number;
  customer_id: number;
  customer_code: string;
  display_name: string;
  email: string | null;
  phone: string | null;

  relationship_type: string | null;

  is_group_head: boolean;
  is_primary: boolean;

  joined_on: string | null;
  left_on: string | null;

  remarks: string | null;
}

export interface GroupMemberListResponse {
  group_id: number;
  members: GroupMember[];
  total: number;
}

export interface GroupCreatePayload {
  group_name: string;
  group_type?: GroupType | string;
  risk_profile?: string | null;
  investment_objective?: string | null;
  remarks?: string | null;
  head_customer_id?: number | null;
}

export interface GroupUpdatePayload {
  group_name?: string;
  group_type?: GroupType | string;
  risk_profile?: string | null;
  investment_objective?: string | null;
  remarks?: string | null;
}

export interface GroupMemberAddPayload {
  customer_id: number;
  relationship_type?: string;
  is_group_head?: boolean;
  remarks?: string | null;
}

export interface GroupActionResponse {
  message: string;
  group: Group;
}

export async function getGroups(
  token: string,
  params?: {
    search?: string;
    group_type?: string;
    include_inactive?: boolean;
  }
): Promise<GroupListResponse> {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set('search', params.search);
  }

  if (params?.group_type) {
    query.set('group_type', params.group_type);
  }

  if (params?.include_inactive) {
    query.set('include_inactive', 'true');
  }

  const queryString = query.toString();

  return advisorFetch<GroupListResponse>(
    `/groups/${queryString ? `?${queryString}` : ''}`,
    token
  );
}

export async function getGroup(
  token: string,
  id: string | number
): Promise<Group> {
  return advisorFetch<Group>(`/groups/${id}`, token);
}

export async function getGroupById(
  token: string,
  id: string | number
): Promise<Group> {
  return getGroup(token, id);
}

export async function getGroupMembers(
  token: string,
  id: string | number
): Promise<GroupMemberListResponse> {
  return advisorFetch<GroupMemberListResponse>(
    `/groups/${id}/members`,
    token
  );
}

export async function getGroupMembershipHistory(
  token: string,
  id: string | number
): Promise<GroupMemberListResponse> {
  return advisorFetch<GroupMemberListResponse>(
    `/groups/${id}/members/history`,
    token
  );
}

export async function createGroup(
  token: string,
  payload: GroupCreatePayload,
  idempotencyKey = crypto.randomUUID(),
): Promise<Group> {
  return advisorFetch<Group>('/groups/', token, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export async function updateGroup(
  token: string,
  id: string | number,
  payload: GroupUpdatePayload
): Promise<Group> {
  return advisorFetch<Group>(`/groups/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function addGroupMember(
  token: string,
  groupId: string | number,
  payload: GroupMemberAddPayload
): Promise<GroupMember> {
  return advisorFetch<GroupMember>(
    `/groups/${groupId}/members`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function changeGroupHead(
  token: string,
  groupId: string | number,
  customerId: number
): Promise<GroupActionResponse> {
  return advisorFetch<GroupActionResponse>(
    `/groups/${groupId}/head`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify({
        customer_id: customerId,
      }),
    }
  );
}

export async function removeGroupMember(
  token: string,
  groupId: string | number,
  customerId: string | number
): Promise<{
  message: string;
  customer_id: number;
  left_on: string;
}> {
  return advisorFetch(
    `/groups/${groupId}/members/${customerId}`,
    token,
    {
      method: 'DELETE',
    }
  );
}

export async function deactivateGroup(
  token: string,
  id: string | number
): Promise<GroupActionResponse> {
  return advisorFetch<GroupActionResponse>(
    `/groups/${id}/deactivate`,
    token,
    {
      method: 'POST',
    }
  );
}










export type Meeting = {
  id: number;
  organization_id: number;
  advisor_employee_id: number;

  title: string;
  meeting_type: string;
  description: string | null;

  scheduled_start: string;
  scheduled_end: string;

  location: string | null;
  meeting_link: string | null;

  status: string;

  outcome: string | null;
  notes: string | null;

  customer_id: number | null;
  customer_group_id: number | null;

  customer_name: string | null;
  group_name: string | null;

  created_at: string;
  updated_at: string;
};

export type MeetingCreatePayload = {
  title: string;
  meeting_type?: string;
  description?: string | null;

  scheduled_start: string;
  scheduled_end: string;

  location?: string | null;
  meeting_link?: string | null;

  status?: string;

  outcome?: string | null;
  notes?: string | null;

  customer_id?: number | null;
  customer_group_id?: number | null;
};

export type MeetingUpdatePayload = {
  title?: string;
  meeting_type?: string;
  description?: string | null;

  scheduled_start?: string;
  scheduled_end?: string;

  location?: string | null;
  meeting_link?: string | null;

  status?: string;

  outcome?: string | null;
  notes?: string | null;

  customer_id?: number | null;
  customer_group_id?: number | null;
};

export type MeetingListResponse = {
  meetings: Meeting[];
  total: number;
};



export async function getMeetings(
  token: string,
  params?: {
    search?: string;
    status?: string;
    meeting_type?: string;
    from_date?: string;
    to_date?: string;
  }
): Promise<MeetingListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.meeting_type) {
    searchParams.set("meeting_type", params.meeting_type);
  }

  if (params?.from_date) {
    searchParams.set("from_date", params.from_date);
  }

  if (params?.to_date) {
    searchParams.set("to_date", params.to_date);
  }

  const query = searchParams.toString();

  return advisorFetch<MeetingListResponse>(
    `/meetings/${query ? `?${query}` : ""}`,
    token
  );
}

export async function getMeeting(
  token: string,
  id: number
): Promise<Meeting> {
  return advisorFetch<Meeting>(`/meetings/${id}`, token);
}

export async function createMeeting(
  token: string,
  payload: MeetingCreatePayload,
  idempotencyKey = crypto.randomUUID(),
): Promise<Meeting> {
  return advisorFetch<Meeting>("/meetings/", token, {
    method: "POST",
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export async function updateMeeting(
  token: string,
  id: number,
  payload: MeetingUpdatePayload,
): Promise<Meeting> {
  return advisorFetch<Meeting>(`/meetings/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function cancelMeeting(
  token: string,
  id: number
): Promise<Meeting> {
  return advisorFetch<Meeting>(`/meetings/${id}/cancel`, token, {
    method: "POST",
  });
}

export async function completeMeeting(
  token: string,
  id: number
): Promise<Meeting> {
  return advisorFetch<Meeting>(`/meetings/${id}/complete`, token, {
    method: "POST",
  });
}







// =========================
// Tasks
// =========================

export type Task = {
  id: number;
  organization_id: number;
  assigned_employee_id: number;

  title: string;
  task_type: string;
  description: string | null;

  due_at: string;

  priority: string;
  status: string;

  notes: string | null;
  completed_at: string | null;

  customer_id: number | null;
  customer_group_id: number | null;

  customer_name: string | null;
  group_name: string | null;

  created_at: string;
  updated_at: string;
};

export type TaskCreatePayload = {
  title: string;
  task_type?: string;
  description?: string | null;
  due_at: string;
  priority?: string;
  status?: string;
  notes?: string | null;
  customer_id?: number | null;
  customer_group_id?: number | null;
};

export type TaskUpdatePayload = {
  title?: string;
  task_type?: string;
  description?: string | null;
  due_at?: string;
  priority?: string;
  status?: string;
  notes?: string | null;
  customer_id?: number | null;
  customer_group_id?: number | null;
};

export type TaskListResponse = {
  tasks: Task[];
  total: number;
};

export async function getTasks(
  token: string,
  params?: {
    search?: string;
    status?: string;
    priority?: string;
    task_type?: string;
    customer_id?: number;
    customer_group_id?: number;
    from_date?: string;
    to_date?: string;
  }
): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.priority) {
    searchParams.set("priority", params.priority);
  }

  if (params?.task_type) {
    searchParams.set("task_type", params.task_type);
  }
  if (params?.customer_id) {
    searchParams.set("customer_id", String(params.customer_id));
  }

  if (params?.customer_group_id) {
    searchParams.set("customer_group_id", String(params.customer_group_id));
  }

  if (params?.from_date) {
    searchParams.set("from_date", params.from_date);
  }

  if (params?.to_date) {
    searchParams.set("to_date", params.to_date);
  }

  const query = searchParams.toString();

  return advisorFetch<TaskListResponse>(
    `/tasks/${query ? `?${query}` : ""}`,
    token
  );
}

export async function getTask(
  token: string,
  id: number
): Promise<Task> {
  return advisorFetch<Task>(`/tasks/${id}`, token);
}

export async function createTask(
  token: string,
  payload: TaskCreatePayload,
  idempotencyKey = crypto.randomUUID(),
): Promise<Task> {
  return advisorFetch<Task>("/tasks/", token, {
    method: "POST",
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export async function updateTask(
  token: string,
  id: number,
  payload: TaskUpdatePayload
): Promise<Task> {
  return advisorFetch<Task>(`/tasks/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function completeTask(
  token: string,
  id: number
): Promise<Task> {
  return advisorFetch<Task>(`/tasks/${id}/complete`, token, {
    method: "POST",
  });
}

export async function reopenTask(
  token: string,
  id: number
): Promise<Task> {
  return advisorFetch<Task>(`/tasks/${id}/reopen`, token, {
    method: "POST",
  });
}




// =========================
// Messages
// =========================

export type Message = {
  id: number;
  organization_id: number;
  sender_employee_id: number;

  message_type: string;
  subject: string | null;
  body: string;
  status: string;

  customer_id: number | null;
  customer_group_id: number | null;

  customer_name: string | null;
  group_name: string | null;

  sent_at: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageListResponse = {
  messages: Message[];
  total: number;
};

export type MessageCreatePayload = {
  message_type?: string;
  subject?: string | null;
  body: string;
  status?: string;
  customer_id?: number | null;
  customer_group_id?: number | null;
};

export type MessageUpdatePayload = {
  subject?: string | null;
  body?: string;
  status?: string;
};

export type MessageListParams = {
  search?: string;
  status?: string;
  message_type?: string;
  customer_id?: number;
  customer_group_id?: number;
  from_date?: string;
  to_date?: string;
};

export function getMessages(
  token: string,
  params?: MessageListParams,
): Promise<MessageListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.set("search", params.search);
  }

  if (params?.status) {
    queryParams.set("status", params.status);
  }

  if (params?.message_type) {
    queryParams.set("message_type", params.message_type);
  }

  if (params?.customer_id) {
    queryParams.set("customer_id", String(params.customer_id));
  }

  if (params?.customer_group_id) {
    queryParams.set(
      "customer_group_id",
      String(params.customer_group_id),
    );
  }

  if (params?.from_date) {
    queryParams.set("from_date", params.from_date);
  }

  if (params?.to_date) {
    queryParams.set("to_date", params.to_date);
  }

  const qs = queryParams.toString();

  return advisorFetch(
    `/messages/${qs ? `?${qs}` : ""}`,
    token,
  );
}

export function getMessage(
  token: string,
  id: number,
): Promise<Message> {
  return advisorFetch(`/messages/${id}`, token);
}

export function createMessage(
  token: string,
  payload: MessageCreatePayload,
  idempotencyKey = crypto.randomUUID(),
): Promise<Message> {
  return advisorFetch("/messages/", token, {
    method: "POST",
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export function updateMessage(
  token: string,
  id: number,
  payload: MessageUpdatePayload,
): Promise<Message> {
  return advisorFetch(`/messages/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function markMessageRead(
  token: string,
  id: number,
): Promise<Message> {
  return advisorFetch(`/messages/${id}/read`, token, {
    method: "POST",
  });
}

export function archiveMessage(
  token: string,
  id: number,
): Promise<Message> {
  return advisorFetch(`/messages/${id}/archive`, token, {
    method: "POST",
  });
}



// ==================== Documents ====================

export type Document = {
  id: number;
  organization_id: number;
  customer_id: number | null;
  customer_group_id: number | null;
  uploaded_by_employee_id: number;

  document_type: string;
  document_name: string;
  description: string | null;

  file_name: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;

  status: string;
  notes: string | null;

  customer_name: string | null;
  group_name: string | null;

  created_at: string;
  updated_at: string;
};

export type DocumentListResponse = {
  documents: Document[];
  total: number;
};

export type DocumentCreatePayload = {
  customer_id?: number | null;
  customer_group_id?: number | null;

  document_type: string;
  document_name: string;
  description?: string | null;

  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;

  status?: string;
  notes?: string | null;
};

export type DocumentUpdatePayload = {
  customer_id?: number | null;
  customer_group_id?: number | null;

  document_type?: string;
  document_name?: string;
  description?: string | null;

  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;

  status?: string;
  notes?: string | null;
};

export type DocumentListParams = {
  search?: string;
  status?: string;
  document_type?: string;
  customer_id?: number;
  customer_group_id?: number;
  from_date?: string;
  to_date?: string;
};

export function getDocuments(
  token: string,
  params?: DocumentListParams,
): Promise<DocumentListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.set("search", params.search);
  if (params?.status) queryParams.set("status", params.status);

  if (params?.document_type) {
    queryParams.set("document_type", params.document_type);
  }

  if (params?.customer_id) {
    queryParams.set("customer_id", String(params.customer_id));
  }

  if (params?.customer_group_id) {
    queryParams.set(
      "customer_group_id",
      String(params.customer_group_id),
    );
  }

  if (params?.from_date) {
    queryParams.set("from_date", params.from_date);
  }

  if (params?.to_date) {
    queryParams.set("to_date", params.to_date);
  }

  const qs = queryParams.toString();

  return advisorFetch(
    `/documents/${qs ? `?${qs}` : ""}`,
    token,
  );
}

export function getDocument(
  token: string,
  id: number,
): Promise<Document> {
  return advisorFetch(`/documents/${id}`, token);
}

/**
 * Upload a real document file.
 *
 * The backend automatically determines:
 * - document name
 * - file name
 * - file type
 * - file size
 * - file URL
 */
export async function uploadDocument(
  token: string,
  data: {
    customer_id?: number | null;
    customer_group_id?: number | null;
    document_type: string;
    description?: string | null;
    notes?: string | null;
    file: File;
  },
  idempotencyKey = crypto.randomUUID(),
): Promise<Document> {
  const formData = new FormData();

  if (data.customer_id) {
    formData.append(
      "customer_id",
      String(data.customer_id),
    );
  }

  if (data.customer_group_id) {
    formData.append(
      "customer_group_id",
      String(data.customer_group_id),
    );
  }

  formData.append(
    "document_type",
    data.document_type,
  );

  if (data.description?.trim()) {
    formData.append(
      "description",
      data.description.trim(),
    );
  }

  if (data.notes?.trim()) {
    formData.append(
      "notes",
      data.notes.trim(),
    );
  }

  formData.append("file", data.file);

  return advisorFetch("/documents/upload", token, {
    method: "POST",
    headers: { 'Idempotency-Key': idempotencyKey },
    body: formData,
  });
}

export function createDocument(
  token: string,
  payload: DocumentCreatePayload,
  idempotencyKey = crypto.randomUUID(),
): Promise<Document> {
  return advisorFetch("/documents/", token, {
    method: "POST",
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });
}

export function updateDocument(
  token: string,
  id: number,
  payload: DocumentUpdatePayload,
): Promise<Document> {
  return advisorFetch(`/documents/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function archiveDocument(
  token: string,
  id: number,
): Promise<Document> {
  return advisorFetch(`/documents/${id}/archive`, token, {
    method: "POST",
  });
}

export interface MoveHouseholdRequest {
  customer_id: number;
  relationship_type?: string;
  new_head_customer_id?: number | null;
}

export function moveClientToHousehold(
  token: string,
  groupId: number,
  data: MoveHouseholdRequest
) {
  return advisorPost(
    `/groups/${groupId}/move-client`,
    token,
    data
  );
}

