const API_BASE_URL = 'http://localhost:5001/api';

// Store token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// API call helper
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (userData: {
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    gender?: string;
    age?: string;
  }) => {
    const data = await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    await apiCall('/logout', {
      method: 'POST',
    });
    clearAuthToken();
  },

  getCurrentUser: async () => {
    return apiCall('/user', {
      method: 'GET',
    });
  },
};

// Gym Info APIs
export const gymInfoAPI = {
  saveGymInfo: async (focus: string, experience: string, bio?: string) => {
    return apiCall('/gym-info', {
      method: 'POST',
      body: JSON.stringify({ focus, experience, bio }),
    });
  },

  getGymInfo: async () => {
    return apiCall('/gym-info', {
      method: 'GET',
    });
  },
};

// User APIs
export const userAPI = {
  updateUser: async (userData: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    age?: string;
    bio?: string;
  }) => {
    return apiCall('/user', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteAccount: async () => {
    return apiCall('/user', {
      method: 'DELETE',
    });
  },
};

// Posts/Sessions APIs
export const postsAPI = {
  createPost: async (postData: {
    title: string;
    workout_type: string;
    date_time: string;
    location: string;
    party_size: string;
    experience_level: string;
    gender_preference?: string;
    notes?: string;
  }) => {
    return apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (postId: string, postData: {
    title?: string;
    workout_type?: string;
    date_time?: string;
    location?: string;
    party_size?: string;
    experience_level?: string;
    gender_preference?: string;
    notes?: string;
  }) => {
    return apiCall(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  getPosts: async (filters?: {
    workout_type?: string;
    location?: string;
    experience_level?: string;
    gender_preference?: string;
    party_size?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return apiCall(`/posts${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getMyPosts: async () => {
    return apiCall('/posts/my-posts', {
      method: 'GET',
    });
  },

  getPost: async (postId: string) => {
    return apiCall(`/posts/${postId}`, {
      method: 'GET',
    });
  },

  deletePost: async (postId: string) => {
    return apiCall(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },
};

// Profiles APIs
export const profilesAPI = {
  getProfiles: async (filters?: {
    gender?: string;
    experience_level?: string;
    focus?: string;
    age_min?: string;
    age_max?: string;
    same_gender_only?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const queryString = params.toString();
    return apiCall(`/profiles${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getProfile: async (profileId: string) => {
    return apiCall(`/profiles/${profileId}`, {
      method: 'GET',
    });
  },

  expressInterest: async (profileId: string) => {
    return apiCall('/profiles/interest', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId }),
    });
  },
};

// Requests APIs
export const requestsAPI = {
  getRequests: async () => {
    return apiCall('/requests', {
      method: 'GET',
    });
  },

  respondToRequest: async (requestId: string, response: 'accept' | 'reject') => {
    return apiCall(`/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  requestToJoin: async (postId: string) => {
    return apiCall(`/posts/${postId}/request`, {
      method: 'POST',
    });
  },
};
