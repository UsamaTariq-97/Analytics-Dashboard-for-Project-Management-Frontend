import api from './api'

const authService = {
  // Register new user
  register: async (userData) => {
    console.log('user data',userData);
    try {
      const response = await api.post('/auth/register', userData)
      
      console.log('Register response:', response);
      
     
      if (response.token) {
        localStorage.setItem('token', response.token)
        
        
        const user = {
          id: response.id,
          name: response.fullName || response.name,
          email: response.email,
          role: response.role
        }
        
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response
    } catch (error) {
      throw error
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      
      console.log('Login response:', response);
      
     
      if (response.token) {
        localStorage.setItem('token', response.token)
        
       
        const user = {
          id: response.id,
          name: response.fullName || response.name,
          email: response.email,
          role: response.role
        }
        
        localStorage.setItem('user', JSON.stringify(user))
      }
      
      return response
    } catch (error) {
      throw error
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token')
  }
}

export default authService
