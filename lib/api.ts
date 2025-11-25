export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": (options.body instanceof FormData) ? "" : "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (headers["Content-Type"] === "") delete headers["Content-Type"];

  // Add requestID to POST/PUT/DELETE requests
  let body = options.body;
  const method = options.method || "GET";
  let fullUrl = `${API_BASE_URL}${path}`;

  if (["POST", "PUT"].includes(method.toUpperCase())) {
    // For POST/PUT, add to body
    if (body instanceof FormData) {
      body.append("requestID", "rid_2006");
    } else if (typeof body === "string") {
      try {
        const jsonBody = JSON.parse(body);
        jsonBody.requestID = "rid_2006";
        body = JSON.stringify(jsonBody);
      } catch {
        // If not valid JSON, leave as is
      }
    }
  } else if (method.toUpperCase() === "DELETE") {
    // For DELETE, add as query parameter
    const separator = path.includes('?') ? '&' : '?';
    fullUrl = `${API_BASE_URL}${path}${separator}requestID=rid_2006`;
  }

  console.log(`[API] ${method} ${fullUrl}`);

  const res = await fetch(fullUrl, {
    ...options,
    body,
    headers,
    credentials: "include",
  });

  console.log(`[API] Response status: ${res.status} ${res.statusText}`);

  const text = await res.text();
  console.log(`[API] Raw response for ${path}:`, text);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error(`[API] JSON parse error for ${path}:`, e);
    data = {};
  }
  console.log(`[API] Response data for ${path}:`, data);

  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

import { cachedRequest, invalidateCache } from "./api-cache"

export const api = {
  API_BASE_URL,
  login(email: string, password: string) {
    return request("/users/loginfunc", { method: "POST", body: JSON.stringify({ username: email, password }) });
  },
  getDashboardStats(skipCache = false) {
    return cachedRequest(
      "dashboard:stats",
      () => request("/dashboard/stats", { method: "GET" }),
      5 * 60 * 1000, // Cache for 5 minutes
      skipCache
    );
  },
  kycList(params: Record<string, string | number | undefined> = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    return request(`/kyc/admin/list${suffix}`, { method: "GET" });
  },
  kycApprove(id: string) {
    return request(`/kyc/admin/approve`, { method: "POST", body: JSON.stringify({ id }) });
  },
  kycReject(id: string, reason: string) {
    return request(`/kyc/admin/reject`, { method: "POST", body: JSON.stringify({ id, reason }) });
  },
  getSettings(group?: string, skipCache = false) {
    const query = group ? `?group=${group}` : "";
    const cacheKey = `setting:all${group ? `:${group}` : ''}`;
    return cachedRequest(
      cacheKey,
      () => request(`/settings/all${query}`, { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  getSettingsGrouped(skipCache = false) {
    return cachedRequest(
      "setting:grouped",
      () => request("/settings/grouped", { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async updateSetting(key: string, value: any) {
    const result = await request("/settings/update", { method: "POST", body: JSON.stringify({ key, value }) });
    // Invalidate settings cache
    invalidateCache(["setting:"]);
    return result;
  },
  async updateMultipleSettings(settings: Record<string, any>) {
    const result = await request("/settings/updateMultiple", { method: "POST", body: JSON.stringify({ settings }) });
    // Invalidate settings cache
    invalidateCache(["setting:"]);
    return result;
  },
  createSetting(data: { key: string; value: any; type: string; group?: string; label?: string; description?: string }) {
    return request("/settings/create", { method: "POST", body: JSON.stringify(data) });
  },
  deleteSetting(key: string) {
    return request(`/settings/${key}`, { method: "DELETE" });
  },

  // Equipment Categories
  getEquipmentCategories(skipCache = false) {
    return cachedRequest(
      "equipment:categories",
      () => request("/settings/equipmentCategories", { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async createEquipmentCategory(data: { name: string; description?: string; active?: boolean; item_type?: string }) {
    const result = await request("/settings/createEquipmentCategory", {
      method: "POST",
      body: JSON.stringify(data)
    });
    invalidateCache(["equipment:"]);
    return result;
  },
  async updateEquipmentCategory(data: { id: number; name: string; description?: string; active?: boolean }) {
    const result = await request("/settings/updateEquipmentCategory", {
      method: "POST",
      body: JSON.stringify(data)
    });
    invalidateCache(["equipment:"]);
    return result;
  },
  async toggleEquipmentCategory(id: number) {
    const result = await request("/settings/toggleEquipmentCategory", {
      method: "POST",
      body: JSON.stringify({ id })
    });
    invalidateCache(["equipment:"]);
    return result;
  },
  async deleteEquipmentCategory(id: number) {
    const result = await request(`/settings/deleteEquipmentCategory/${id}`, { method: "DELETE" });
    invalidateCache(["equipment:"]);
    return result;
  },

  // User Management
  getUsers(params: { page?: number; limit?: number; search?: string; role?: string } = {}, skipCache = false) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    const cacheKey = `users:list:${suffix}`;
    return cachedRequest(
      cacheKey,
      () => request(`/usermanagement/list${suffix}`, { method: "GET" }),
      2 * 60 * 1000, // Cache for 2 minutes
      skipCache
    );
  },
  getUserDetails(userId: string, skipCache = false) {
    return cachedRequest(
      `users:details:${userId}`,
      () => request(`/usermanagement/details/${userId}`, { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async updateUserRoles(userId: string, roles: string[]) {
    const result = await request("/usermanagement/updateRoles", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, roles })
    });
    invalidateCache(["users:"]);
    return result;
  },
  async toggleUserStatus(userId: string, status?: boolean) {
    const result = await request("/usermanagement/toggleStatus", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, status })
    });
    invalidateCache(["users:"]);
    return result;
  },
  async deleteUser(userId: string) {
    const result = await request(`/usermanagement/delete/${userId}`, { method: "DELETE" });
    invalidateCache(["users:"]);
    return result;
  },

  // Subscription Management
  getSubscriptionPlans(skipCache = false) {
    return cachedRequest(
      "subscriptions:list",
      () => request("/subscriptionmanagement/list", { method: "GET" }),
      5 * 60 * 1000, // Cache for 5 minutes
      skipCache
    );
  },
  getSubscriptionDetails(planId: string, skipCache = false) {
    return cachedRequest(
      `subscriptions:details:${planId}`,
      () => request(`/subscriptionmanagement/details/${planId}`, { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async createSubscriptionPlan(data: any) {
    const result = await request("/subscriptionmanagement/create", {
      method: "POST",
      body: JSON.stringify(data)
    });
    invalidateCache(["subscriptions:"]);
    return result;
  },
  async updateSubscriptionPlan(data: any) {
    const result = await request("/subscriptionmanagement/update", {
      method: "POST",
      body: JSON.stringify(data)
    });
    invalidateCache(["subscriptions:"]);
    return result;
  },
  async deleteSubscriptionPlan(planId: string) {
    const result = await request(`/subscriptionmanagement/delete/${planId}`, { method: "DELETE" });
    invalidateCache(["subscriptions:"]);
    return result;
  },

  // KYC Management
  getKycRequests(params: { page?: number; limit?: number; status?: string; search?: string } = {}, skipCache = false) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    const cacheKey = `kyc:list:${suffix}`;
    return cachedRequest(
      cacheKey,
      () => request(`/kycmanagement/list${suffix}`, { method: "GET" }),
      2 * 60 * 1000, // Cache for 2 minutes
      skipCache
    );
  },
  getKycDetails(kycId: string, skipCache = false) {
    return cachedRequest(
      `kyc:details:${kycId}`,
      () => request(`/kycmanagement/details/${kycId}`, { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async approveKyc(kycId: string) {
    const result = await request("/kycmanagement/approve", {
      method: "POST",
      body: JSON.stringify({ kyc_id: kycId })
    });
    invalidateCache(["kyc:"]);
    return result;
  },
  async rejectKyc(kycId: string, rejectionReason: string) {
    const result = await request("/kycmanagement/reject", {
      method: "POST",
      body: JSON.stringify({ kyc_id: kycId, rejection_reason: rejectionReason })
    });
    invalidateCache(["kyc:"]);
    return result;
  },
  async deleteKyc(kycId: string) {
    const result = await request(`/kycmanagement/delete/${kycId}`, { method: "DELETE" });
    invalidateCache(["kyc:"]);
    return result;
  },
  getKycStats(skipCache = false) {
    return cachedRequest(
      "kyc:stats",
      () => request("/kycmanagement/stats", { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },

  // Listing Management
  getListings(params: { page?: number; limit?: number; status?: string; search?: string } = {}, skipCache = false) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    const cacheKey = `listings:list:${suffix}`;
    return cachedRequest(
      cacheKey,
      () => request(`/listingmanagement/list${suffix}`, { method: "GET" }),
      2 * 60 * 1000, // Cache for 2 minutes
      skipCache
    );
  },
  getListingDetails(listingId: string, skipCache = false) {
    return cachedRequest(
      `listings:details:${listingId}`,
      () => request(`/listingmanagement/details/${listingId}`, { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },
  async approveListing(listingId: string) {
    const result = await request("/listingmanagement/approve", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId })
    });
    invalidateCache(["listings:"]);
    return result;
  },
  async rejectListing(listingId: string, rejectionReason: string) {
    const result = await request("/listingmanagement/reject", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId, rejection_reason: rejectionReason })
    });
    invalidateCache(["listings:"]);
    return result;
  },
  async updateListingStatus(listingId: string, status: string) {
    const result = await request("/listingmanagement/updateStatus", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId, status })
    });
    invalidateCache(["listings:"]);
    return result;
  },
  async deleteListing(listingId: string) {
    const result = await request(`/listingmanagement/delete/${listingId}`, { method: "DELETE" });
    invalidateCache(["listings:"]);
    return result;
  },
  getListingStats(skipCache = false) {
    return cachedRequest(
      "listings:stats",
      () => request("/listingmanagement/stats", { method: "GET" }),
      5 * 60 * 1000,
      skipCache
    );
  },

  // Recent Activity
  getRecentActivities(params: { filter?: string; page?: number; limit?: number } = {}, skipCache = false) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    const cacheKey = `dashboard:recent_activity:${suffix}`;
    return cachedRequest(
      cacheKey,
      () => request(`/dashboard/recentActivity${suffix}`, { method: "GET" }),
      1 * 60 * 1000, // Cache for 1 minute
      skipCache
    );
  },
  // User Subscriptions
  getUserSubscriptions(params: { page?: number; limit?: number; status?: string; search?: string; expiring_within_days?: number } = {}, skipCache = false) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.set(k, String(v)); });
    const suffix = qs.toString() ? `?${qs}` : "";
    const cacheKey = `user_subscriptions:list:${suffix}`;
    return cachedRequest(
      cacheKey,
      () => request(`/subscriptionmanagement/user_subscriptions${suffix}`, { method: "GET" }),
      2 * 60 * 1000, // Cache for 2 minutes
      skipCache
    );
  },
  async sendSubscriptionReminder(subscriptionId: string) {
    return request(`/subscriptionmanagement/send_reminder/${subscriptionId}`, {
      method: "POST",
      body: new FormData()
    });
  },
  async deleteUserSubscription(subscriptionId: string) {
    return request(`/subscriptionmanagement/delete_user_subscription/${subscriptionId}`, {
      method: "POST",
      body: new FormData()
    });
  },
};


