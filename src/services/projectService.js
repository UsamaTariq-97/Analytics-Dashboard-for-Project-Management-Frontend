import api from './api'

const projectService = {
 
  getMyProjects: async () => {
    try {
      const response = await api.get('/projects')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get all projects (admin only)
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get projects list for dropdown
  getProjectsList: async () => {
    try {
      const response = await api.get('/projects/list')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get single project
  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
  
      const apiData = {
        projectName: projectData.name,
        projectDescription: projectData.description,
        projectStatus: projectData.status,
        projectStartDate: projectData.startDate,
        projectEndDate: projectData.endDate
      }
      const response = await api.post('/projects', apiData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
   
      const apiData = {}
      
      if (projectData.name) apiData.projectName = projectData.name
      if (projectData.description) apiData.projectDescription = projectData.description
      if (projectData.status) apiData.projectStatus = projectData.status
      if (projectData.startDate) apiData.projectStartDate = projectData.startDate
      if (projectData.endDate) apiData.projectEndDate = projectData.endDate
      
      const response = await api.put(`/projects/${projectId}`, apiData)
      return response
    } catch (error) {
      throw error
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get project analytics
  getProjectAnalytics: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/analytics`)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get moderator analytics
  getModeratorAnalytics: async () => {
    try {
      const response = await api.get('/projects/moderator/analytics')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get dashboard statistics and projects
  getDashboardStats: async () => {
    try {
      const response = await api.get('/projects/dashboard')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get team performance
  getTeamPerformance: async () => {
    try {
      const response = await api.get('/projects/team-performance')
      return response
    } catch (error) {
      throw error
    }
  },

  // Get analytics (all projects or specific project)
  getAnalytics: async (projectId = null) => {
    try {
      const url = projectId 
        ? `/projects/analytics?projectId=${projectId}`
        : '/projects/analytics'
      const response = await api.get(url)
      return response
    } catch (error) {
      throw error
    }
  },

  // Get all projects for admin with filters
  getAdminProjects: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      
      const url = queryParams.toString() 
        ? `/admin/projects?${queryParams.toString()}`
        : '/admin/projects'
      
      const response = await api.get(url)
      return response
    } catch (error) {
      throw error
    }
  }
}

export default projectService
