import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Popconfirm, message } from 'antd'
import { 
  TeamOutlined, 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  StopOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import userService from '../../services/userService'


const AdminDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    resolvedTasks: 0
  })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await userService.getAdminDashboardStats()
      if (response.success) {
        setStats(response.statistics || {})
        setUsers(response.users || [])
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch dashboard data'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspension = async (userId, currentStatus) => {
    try {
      const response = currentStatus === 'suspended' 
        ? await userService.activateUser(userId)
        : await userService.suspendUser(userId)
      
      if (response.success) {
        message.success(response.message || `User ${currentStatus === 'suspended' ? 'activated' : 'suspended'} successfully`)
        fetchDashboardData()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to update user status'
      message.error(errorMessage)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await userService.deleteUser(userId)
      if (response.success) {
        message.success(response.message || 'User deleted successfully')
        fetchDashboardData()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to delete user'
      message.error(errorMessage)
    }
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'red'
      case 'moderator': return 'blue'
      case 'user': return 'green'
      default: return 'default'
    }
  }

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => record.fullName || record.name || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'suspended' ? 'red' : 'green'}>
          {record.status?.toUpperCase() || 'ACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={record.status === 'suspended' ? <CheckCircleOutlined /> : <StopOutlined />}
            onClick={() => handleToggleSuspension(record._id, record.status)}
            style={{ color: record.status === 'suspended' ? 'green' : 'orange' }}
          >
            {record.status === 'suspended' ? 'Activate' : 'Suspend'}
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Projects"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Active Projects"
              value={stats.activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Distribution */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Open Tasks"
              value={stats.openTasks}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="In Progress"
              value={stats.inProgressTasks}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Resolved"
              value={stats.resolvedTasks}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Management Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="All Users" bordered={false}>
            <Table 
              columns={userColumns} 
              dataSource={users} 
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total ${total} users`
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
