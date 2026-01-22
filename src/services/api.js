import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
   
    if (error.response) {
    
      const { status, data } = error.response
      
      switch (status) {
        case 401:
        
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/'
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          break
      }
      
      return Promise.reject(data?.message || 'Something went wrong')
    } else if (error.request) {
      
      return Promise.reject('Network error. Please check your connection.')
    } else {
     
      return Promise.reject(error.message)
    }
  }
)

export default api
