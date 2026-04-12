const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
 

async function request(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
 
 
  const headers = {};
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
 
  
  if (process.env.NODE_ENV === "development") {
    console.log(`→ ${method} ${url}`);
  }
 
  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",          
      headers,
      body: body instanceof FormData
        ? body                         
        : body
          ? JSON.stringify(body)        
          : undefined,                  
    });
  } catch (networkError) {
    
    throw new Error("Network error");
  }
 

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }
 
  
  let json;
  try {
    json = await response.json();
  } catch {

    if (response.ok) return null;
    throw new Error(`Request failed with status ${response.status}`);
  }
 
  if (!response.ok) {
    const message =
      json?.message ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.errors     = json?.errors ?? [];   
    throw error;
  }
 
  return json.data;
}
 
const api = {
  get:    (endpoint)              => request("GET",    endpoint),
  post:   (endpoint, body)        => request("POST",   endpoint, body),
  put:    (endpoint, body)        => request("PUT",    endpoint, body),
  patch:  (endpoint, body)        => request("PATCH",  endpoint, body),
  delete: (endpoint)              => request("DELETE", endpoint),
 
  upload: (endpoint, formData)    => request("PATCH",  endpoint, formData),
  uploadPost: (endpoint, formData) => request("POST",  endpoint, formData),
};
 
export default api;