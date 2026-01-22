import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './components/auth/login'
import Register from './components/auth/register'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminDashboard from './components/dashboards/AdminDashboard'
import ModeratorDashboard from './components/dashboards/ModeratorDashboard'
import UserDashboard from './components/dashboards/UserDashboard'
import ModeratorProjects from './components/moderator/ModeratorProjects'
import ModeratorTasks from './components/moderator/ModeratorTasks'
import ModeratorAnalytics from './components/moderator/ModeratorAnalytics'
import UserTasks from './components/user/UserTasks'
import AdminUsers from './components/admin/AdminUsers'
import AdminProjects from './components/admin/AdminProjects'
import AdminAnalytics from './components/admin/AdminAnalytics'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Moderator Routes */}
        <Route path="/moderator" element={
          <ProtectedRoute allowedRoles={['moderator']}>
            <DashboardLayout role="moderator" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ModeratorDashboard />} />
          <Route path="projects" element={<ModeratorProjects />} />
          <Route path="tasks" element={<ModeratorTasks />} />
          <Route path="analytics" element={<ModeratorAnalytics />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user']}>
            <DashboardLayout role="user" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="tasks" element={<UserTasks />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
