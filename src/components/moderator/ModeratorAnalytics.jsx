import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select,
  DatePicker,
  Space
} from 'antd'
import { 
  ProjectOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import projectService from '../../services/projectService'
import notify from '../../utils/notification'

const { Option } = Select


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const ModeratorAnalytics = () => {
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState('all')
  const [projects, setProjects] = useState([])
  const [analyticsData, setAnalyticsData] = useState({
    statistics: {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      teamMembers: 0
    },
    taskStatusDistribution: [],
    taskDistribution: []
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjectsList()
      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data)
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch projects'
      notify.error('Error', errorMessage)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const projectId = selectedProject === 'all' ? null : selectedProject
      const response = await projectService.getAnalytics(projectId)
      
      if (response.success) {
       
        const taskDistArray = [
          { name: 'Open', value: response.taskDistribution.open },
          { name: 'In Progress', value: response.taskDistribution.inProgress },
          { name: 'Resolved', value: response.taskDistribution.resolved }
        ]

      
        const statusDistArray = [
          { name: 'Open', value: response.taskStatusDistribution.open.count },
          { name: 'In Progress', value: response.taskStatusDistribution.inProgress.count },
          { name: 'Resolved', value: response.taskStatusDistribution.resolved.count }
        ]

        setAnalyticsData({
          statistics: response.statistics,
          taskStatusDistribution: statusDistArray,
          taskDistribution: taskDistArray
        })
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch analytics'
      notify.error('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large">
          <Select
            style={{ width: 250 }}
            placeholder="Select Project"
            value={selectedProject}
            onChange={setSelectedProject}
          >
            <Option value="all">All Projects</Option>
            {projects.map(project => (
              <Option key={project._id} value={project._id}>
                {project.projectName}
              </Option>
            ))}
          </Select>
        
        </Space>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={analyticsData.statistics.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={analyticsData.statistics.activeProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={analyticsData.statistics.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={analyticsData.statistics.teamMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution" loading={loading}>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analyticsData.taskStatusDistribution}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  label={({ name, value, percent }) => 
                    value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : null
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Task Distribution" loading={loading}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analyticsData.taskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                  {analyticsData.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ModeratorAnalytics
