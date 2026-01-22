import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
import { useNavigate, Outlet } from 'react-router-dom'
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import authService from '../../services/authService'
import notify from '../../utils/notification'

const { Header, Sider, Content } = Layout

const DashboardLayout = ({ role }) => {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    notify.success('Logged Out', 'You have been successfully logged out.')
    navigate('/')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout
      }
    ]
  }

  
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate(`/${role}/dashboard`)
      }
    ]

    if (role === 'admin') {
      return [
        ...baseItems,
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'User Management',
          onClick: () => navigate('/admin/users')
        },
        {
          key: 'projects',
          icon: <ProjectOutlined />,
          label: 'All Projects',
          onClick: () => navigate('/admin/projects')
        },
        {
          key: 'analytics',
          icon: <BarChartOutlined />,
          label: 'System Analytics',
          onClick: () => navigate('/admin/analytics')
        }
      ]
    }

    if (role === 'moderator') {
      return [
        ...baseItems,
        {
          key: 'projects',
          icon: <ProjectOutlined />,
          label: 'My Projects',
          onClick: () => navigate('/moderator/projects')
        },
        {
          key: 'tasks',
          icon: <FileTextOutlined />,
          label: 'Task Management',
          onClick: () => navigate('/moderator/tasks')
        },
        {
          key: 'analytics',
          icon: <BarChartOutlined />,
          label: 'Project Analytics',
          onClick: () => navigate('/moderator/analytics')
        }
      ]
    }

  
    return [
      ...baseItems,
      {
        key: 'tasks',
        icon: <FileTextOutlined />,
        label: 'My Tasks',
        onClick: () => navigate('/user/tasks')
      }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'PM' : 'Project Manager'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={getMenuItems()}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 500 }}>{user?.fullName || user?.name || 'User'}</span>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>
                {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280,
          background: '#f0f2f5'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
