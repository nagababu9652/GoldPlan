const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  refresh_token: string;
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
  role?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan_number?: string;
  aadhaar_number?: string;
  legal_name?: string;
  remarks?: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// ==================== AUTH API ====================

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  const payload = {
    ...data,
    mobile_number: data.mobile_number || data.phone,
  };

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}

// Alias for compatibility
export const register = registerUser;

// ==================== OTP API ====================

export interface OTPSendResponse {
  message: string;
  expires_in_minutes: number;
  otp_code?: string; // Only in development mode
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
    throw new Error(error.detail || 'Failed to send OTP');
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
    throw new Error(error.detail || 'Invalid or expired OTP');
  }

  return response.json();
}

export async function loginUser(credentials: LoginCredentials & { role?: string }): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
      throw new Error(errorJson.detail || 'Login failed');
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error('Login failed. Please try again.');
      }
      throw e;
    }
  }

  return response.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
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
      errorMessage = error.detail || errorMessage;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(errorMessage);
  }

  const data: TokenResponse = await response.json();

  localStorage.setItem('finplan_token', data.access_token);

  if (data.refresh_token) {
    localStorage.setItem('finplan_refresh_token', data.refresh_token);
  }

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
  otp_code?: string; // Only in development mode
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
    throw new Error(error.detail || 'Failed to send password reset OTP');
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
    throw new Error(error.detail || 'Password reset failed');
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

export interface AdvisorReports {
  reports: Array<{
    id: number;
    title: string;
    date: string;
    type: string;
    status: string;
  }>;
}

export interface AdvisorDocuments {
  documents: Array<{
    id: number;
    name: string;
    date: string;
    category: string;
    size: string;
  }>;
}

export interface AdvisorMessages {
  messages: Array<{
    id: number;
    from: string;
    subject: string;
    date: string;
    unread: boolean;
  }>;
}

export interface AdvisorProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  member_since: string;
  plan_type: string;
  client_name: string;
  risk_profile: string;
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
      errorMessage = error.detail || errorMessage;
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

export function getAdvisorReports(token: string): Promise<AdvisorReports> {
  return advisorFetch('/reports', token);
}

export function getAdvisorDocuments(token: string): Promise<AdvisorDocuments> {
  return advisorFetch('/documents', token);
}

export function getAdvisorMessages(token: string): Promise<AdvisorMessages> {
  return advisorFetch('/messages', token);
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
  financial_goals?: string | null;
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
  age?: number;
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
  investment_experience?: string;
  financial_goals?: string;
  nominee_name?: string;
  nominee_relation?: string;
  nominee_contact?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_type?: string;
  kyc_status?: string;
  notes?: string;
  group_id?: number;
}

export interface ClientListResponse {
  advisor_id: number;
  employee_id: number | null;
  clients: Client[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export async function advisorPost(
  endpoint: string,
  token: string,
  body: unknown,
) {
  const response = await advisorRequest(endpoint, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    console.error('API ERROR:', {
      status: response.status,
      body: errorBody,
    });

    throw new Error(
      typeof errorBody === 'string'
        ? errorBody
        : errorBody?.detail || JSON.stringify(errorBody, null, 2),
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

    throw new Error(error?.detail || 'Request failed');
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

    throw new Error(error?.detail || 'Request failed');
  }

  return response.json();
}

export function getClients(
  token: string,
  params?: { page_size?: number; page?: number },
): Promise<ClientListResponse> {
  const queryParams = new URLSearchParams();

  const safePage = params?.page ? Math.max(1, Math.trunc(params.page)) : undefined;
  const safePageSize = params?.page_size
    ? Math.min(100, Math.max(1, Math.trunc(params.page_size)))
    : undefined;

  if (safePage) queryParams.set('page', String(safePage));
  if (safePageSize) queryParams.set('page_size', String(safePageSize));

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
  data: Partial<ClientCreate>,
): Promise<Client> {
  return advisorPut(`/clients/${clientId}`, token, data);
}

export function createClient(token: string, data: ClientCreate): Promise<Client> {
  return advisorPost('/clients', token, data);
}

export function getClient(token: string, id: number): Promise<Client> {
  return advisorFetch(`/clients/${id}`, token);
}

export function deleteClient(token: string, id: number): Promise<{ message: string }> {
  return advisorDelete(`/clients/${id}`, token);
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

export interface AdvisorMeeting {
  id: number;
  advisor_id: number;
  client_id: number;
  client_name: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  meeting_type: "virtual" | "in_person" | "phone";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AdvisorMeetingsResponse {
  meetings: AdvisorMeeting[];
  total: number;
}

export async function getAdvisorMeetings(
  token: string
): Promise<AdvisorMeetingsResponse> {
  return advisorFetch("/meetings", token);
}

export async function getAdvisorTodayMeetings(
  token: string
): Promise<AdvisorMeetingsResponse> {
  return advisorFetch("/meetings/today", token);
}


// ============================================================
// GROUPS / HOUSEHOLDS
// ============================================================

export type GroupType =
  | 'INDIVIDUAL'
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
  is_primary?: boolean;
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
  id: string | number,
  includeHistory = false
): Promise<GroupMemberListResponse> {
  const query = includeHistory ? '?include_history=true' : '';

  return advisorFetch<GroupMemberListResponse>(
    `/groups/${id}/members${query}`,
    token
  );
}

export async function createGroup(
  token: string,
  payload: GroupCreatePayload
): Promise<Group> {
  return advisorFetch<Group>('/groups/', token, {
    method: 'POST',
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

export async function setPrimaryGroup(
  token: string,
  groupId: string | number,
  customerId: number
): Promise<GroupActionResponse> {
  return advisorFetch<GroupActionResponse>(
    `/groups/${groupId}/primary`,
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
): Promise<Meeting> {
  return advisorFetch<Meeting>("/meetings/", token, {
    method: "POST",
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
  payload: TaskCreatePayload
): Promise<Task> {
  return advisorFetch<Task>("/tasks/", token, {
    method: "POST",
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
): Promise<Message> {
  return advisorFetch("/messages/", token, {
    method: "POST",
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
  file_url?: string | null;
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
  file_url?: string | null;
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
    body: formData,
  });
}

export function createDocument(
  token: string,
  payload: DocumentCreatePayload,
): Promise<Document> {
  return advisorFetch("/documents/", token, {
    method: "POST",
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