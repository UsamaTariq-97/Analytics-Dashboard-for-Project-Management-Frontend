import api from './api'

const taskService = {
  // Get all tasks for a project
  getProjectTasks: async (projectId) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get tasks assigned to current user
  getMyTasks: async () => {
    try {
      const response = await api.get('/tasks/my-tasks')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get user tasks with filters (new user API)
  getUserTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority)
      }
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type)
      }
      
      const url = `/user/tasks${params.toString() ? `?${params.toString()}` : ''}`
      const response = await api.get(url)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get all tasks (moderator/admin)
  getAllTasks: async () => {
    try {
      const response = await api.get('/tasks')
      return response
    } catch (error) {
   
      if (error.response?.status === 404) {
        return {
          success: true,
          statistics: {
            totalTasks: 0,
            openTasks: 0,
            inProgressTasks: 0,
            resolvedTasks: 0
          },
          data: []
        }
      }
      throw error
    }
  },

  // Get single task
  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status })
      return response
    } catch (error) {
      throw error
    }
  },

  // Update task status with notes (user API)
  updateUserTaskStatus: async (taskId, status, notes) => {
    try {
      const response = await api.put(`/user/tasks/${taskId}/status`, { status, notes })
      return response
    } catch (error) {
      throw error
    }
  },

  // Assign task to user
  assignTask: async (taskId, userId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/assign`, { userId })
      return response
    } catch (error) {
      throw error
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Resolve task (user)
  resolveTask: async (taskId, notes) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/resolve`, { notes })
      return response
    } catch (error) {
      throw error
    }
  },

  // Verify task resolution (moderator)
  verifyTask: async (taskId, verified) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/verify`, { verified })
      return response
    } catch (error) {
      throw error
    }
  }
}

export default taskService
