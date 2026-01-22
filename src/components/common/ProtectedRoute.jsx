import React from 'react'
import { Navigate } from 'react-router-dom'
import authService from '../../services/authService'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
  
    return <Navigate to={`/${user?.role}/dashboard`} replace />
  }

  return children
}

export default ProtectedRoute
