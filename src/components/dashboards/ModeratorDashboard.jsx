import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress, Button } from 'antd'
import { 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  PlusOutlined,
  TeamOutlined
} from '@ant-design/icons'
import projectService from '../../services/projectService'
import notify from '../../utils/notification'
import { useNavigate } from 'react-router-dom'

const ModeratorDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    myProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    resolvedTasks: 0,
    teamMembers: 0
  })
  const [myProjects, setMyProjects] = useState([])
  const [teamPerformance, setTeamPerformance] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
    
      const dashboardResponse = await projectService.getDashboardStats()
      if (dashboardResponse.success) {
        setStats(dashboardResponse.statistics)
        setMyProjects(dashboardResponse.projects)
      }

   
      const teamResponse = await projectService.getTeamPerformance()
      if (teamResponse.success) {
        setTeamPerformance(teamResponse.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      const errorMessage = typeof error === 'string' ? error : 'Failed to load dashboard data'
      notify.error('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: 'Status',
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      render: (status) => (
        <Tag color={status === 'active' ? 'blue' : 'green'}>
          {status?.toUpperCase() || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress || 0} size="small" />
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks'
    },
    {
      title: 'Team Size',
      dataIndex: 'teamSize',
      key: 'teamSize',
      render: (teamSize) => (
        <span>
          <TeamOutlined /> {teamSize || 0}
        </span>
      )
    }
  ]

  const teamColumns = [
    {
      title: 'Team Member',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Tasks Assigned',
      dataIndex: 'tasksAssigned',
      key: 'tasksAssigned'
    },
    {
      title: 'Tasks Completed',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted'
    },
    {
      title: 'Efficiency',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency) => (
        <Progress 
          percent={efficiency} 
          size="small"
          status={efficiency >= 80 ? 'success' : 'normal'}
        />
      ),
      sorter: (a, b) => b.efficiency - a.efficiency
    }
  ]

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Welcome Project Manager
        </h1>
      
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Projects"
              value={stats.myProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={stats.completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={stats.teamMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Task Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open Tasks"
              value={stats.openTasks}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgressTasks}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={stats.resolvedTasks}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* My Projects Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="My Projects" bordered={false}>
            <Table 
              columns={projectColumns} 
              dataSource={myProjects} 
              loading={loading}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Team Performance */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Team Performance" bordered={false}>
            <Table 
              columns={teamColumns} 
              dataSource={teamPerformance} 
              loading={loading}
              rowKey="userId"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ModeratorDashboard
