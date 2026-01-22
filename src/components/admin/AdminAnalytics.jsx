import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Space, message } from 'antd'
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TeamOutlined, 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons'
import userService from '../../services/userService'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [analytics, setAnalytics] = useState({
    statistics: {
      totalUsers: 0,
      totalProjects: 0,
      totalTasks: 0,
      completionRate: 0
    },
    usersByRole: {},
    projectsByStatus: {},
    tasksByStatus: {},
    tasksByPriority: {}
  })

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = {}
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dayjs(dateRange[0]).format('YYYY-MM-DD')
        params.endDate = dayjs(dateRange[1]).format('YYYY-MM-DD')
      }
      
      const response = await userService.getSystemAnalytics(params)
      if (response.success) {
        setAnalytics({
          statistics: response.statistics || {},
          usersByRole: response.usersByRole || {},
          projectsByStatus: response.projectsByStatus || {},
          tasksByStatus: response.tasksByStatus || {},
          tasksByPriority: response.tasksByPriority || {}
        })
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch analytics'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

 
  const usersByRoleData = Object.keys(analytics.usersByRole)
    .map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: analytics.usersByRole[role].count,
      percentage: analytics.usersByRole[role].percentage
    }))
    .filter(item => item.value > 0)

 
  const projectsByStatusData = Object.keys(analytics.projectsByStatus)
    .map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: analytics.projectsByStatus[status].count,
      percentage: analytics.projectsByStatus[status].percentage
    }))
    .filter(item => item.value > 0)

  const tasksByStatusData = Object.keys(analytics.tasksByStatus)
    .map(status => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      count: analytics.tasksByStatus[status]
    }))
    .filter(item => item.count > 0)

  
  const tasksByPriorityData = Object.keys(analytics.tasksByPriority)
    .map(priority => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: analytics.tasksByPriority[priority]
    }))
    .filter(item => item.count > 0)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Analytics</h1>
        <Space>
          <RangePicker onChange={setDateRange} />
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={analytics.statistics.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Projects"
              value={analytics.statistics.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Tasks"
              value={analytics.statistics.totalTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Completion Rate"
              value={analytics.statistics.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Users by Role" loading={loading}>
            {usersByRoleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => percentage > 0 ? `${name}: ${percentage}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No data available
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Projects by Status" loading={loading}>
            {projectsByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => percentage > 0 ? `${name}: ${percentage}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Tasks by Status" loading={loading}>
            {tasksByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No data available
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Tasks by Priority" loading={loading}>
            {tasksByPriorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                No data available
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminAnalytics
