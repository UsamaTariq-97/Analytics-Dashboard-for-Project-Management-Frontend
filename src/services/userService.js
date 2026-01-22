import api from './api'

const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get users list for assignment dropdown
  getUsersList: async () => {
    try {
      const response = await api.get('/auth/users')
      return response
    } catch (error) {
      // Return empty response if API not ready (404)
      if (error.response?.status === 404) {
        return { success: true, data: [] }
      }
      throw error
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`)
      return response
    } catch (error) {
     
      if (error.response?.status === 404) {
        return []
      }
      throw error
    }
  },

  // Get single user
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get user analytics
  getUserAnalytics: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/analytics`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get user dashboard data
  getUserDashboard: async () => {
    try {
      const response = await api.get('/user/dashboard')
      return response
    } catch (error) {
      throw error
    }
  },

  // Suspend user (admin only)
  suspendUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/suspend`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Activate user (admin only)
  activateUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/activate`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get admin dashboard stats
  getAdminDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get system-wide analytics
  getSystemAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      const url = queryParams.toString() 
        ? `/admin/analytics?${queryParams.toString()}`
        : '/admin/analytics'
      
      const response = await api.get(url)
      return response
    } catch (error) {
      throw error
    }
  }
}

export default userService
