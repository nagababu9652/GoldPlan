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
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
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

async function advisorFetch(endpoint: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/advisors${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export function getAdvisorDashboard(token: string): Promise<AdvisorDashboard> {
  return advisorFetch('/dashboard', token).catch((error) => {
    if (error.message.includes('Could not validate credentials')) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('finplan_token');
      localStorage.removeItem('finplan_refresh_token');
      localStorage.removeItem('finplan_user');
      window.location.href = '/login';
    }
    throw error;
  });
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
  kyc_document_url?: string;
  notes?: string;
  group_id?: number;
  group_name?: string;
  is_active: boolean;
  assigned_date?: string;
  created_at: string;
  updated_at: string;
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
  clients: Client[];
  total: number;
  page: number;
  page_size: number;
}

export interface Group {
  id: number;
  advisor_id: number;
  name: string;
  group_type: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  head_client_id?: number;
  head_client_name?: string;
  is_active: boolean;
  total_investment: number;
  client_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  group_type?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  head_client_id?: number;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
}

async function advisorPost(endpoint: string, token: string, body: any) {
  const response = await fetch(`${API_BASE_URL}/advisors${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

async function advisorPut(endpoint: string, token: string, body: any) {
  const response = await fetch(`${API_BASE_URL}/advisors${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

async function advisorDelete(endpoint: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/advisors${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

// Client API functions
export function getClients(token: string, params?: { search?: string; group_id?: number; kyc_status?: string; risk_profile?: string; page?: number; page_size?: number }): Promise<ClientListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set('search', params.search);
  if (params?.group_id) queryParams.set('group_id', String(params.group_id));
  if (params?.kyc_status) queryParams.set('kyc_status', params.kyc_status);
  if (params?.risk_profile) queryParams.set('risk_profile', params.risk_profile);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.page_size) queryParams.set('page_size', String(params.page_size));
  const qs = queryParams.toString();
  return advisorFetch(`/clients${qs ? '?' + qs : ''}`, token);
}

export function createClient(token: string, data: ClientCreate): Promise<Client> {
  return advisorPost('/clients', token, data);
}

export function getClient(token: string, id: number): Promise<Client> {
  return advisorFetch(`/clients/${id}`, token);
}

export function updateClient(token: string, id: number, data: Partial<ClientCreate>): Promise<Client> {
  return advisorPut(`/clients/${id}`, token, data);
}

export function deleteClient(token: string, id: number): Promise<{ message: string }> {
  return advisorDelete(`/clients/${id}`, token);
}

// Group API functions
export function getGroups(token: string, params?: { group_type?: string; search?: string }): Promise<GroupListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.group_type) queryParams.set('group_type', params.group_type);
  if (params?.search) queryParams.set('search', params.search);
  const qs = queryParams.toString();
  return advisorFetch(`/groups${qs ? '?' + qs : ''}`, token);
}

export function createGroup(token: string, data: GroupCreate): Promise<Group> {
  return advisorPost('/groups', token, data);
}

export function getGroup(token: string, id: number): Promise<Group> {
  return advisorFetch(`/groups/${id}`, token);
}

export function updateGroup(token: string, id: number, data: Partial<GroupCreate>): Promise<Group> {
  return advisorPut(`/groups/${id}`, token, data);
}

export function deleteGroup(token: string, id: number): Promise<{ message: string }> {
  return advisorDelete(`/groups/${id}`, token);
}

export function assignClientToGroup(token: string, groupId: number, clientId: number): Promise<{ message: string }> {
  return advisorPost(`/groups/${groupId}/clients`, token, { client_id: clientId });
}

export function removeClientFromGroup(token: string, groupId: number, clientId: number): Promise<{ message: string }> {
  return advisorDelete(`/groups/${groupId}/clients/${clientId}`, token);
}

export function setGroupHead(token: string, groupId: number, clientId: number): Promise<{ message: string }> {
  return advisorPut(`/groups/${groupId}/head`, token, { client_id: clientId });
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