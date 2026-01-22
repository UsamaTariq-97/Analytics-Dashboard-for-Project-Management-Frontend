import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Button, Badge, Modal, Select, Input } from 'antd'
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import taskService from '../../services/taskService'
import userService from '../../services/userService'
import notify from '../../utils/notification'
import dayjs from 'dayjs'

const { TextArea } = Input

const UserDashboard = () => {
  const [loading, setLoading] = useState(false)
  const [myTasks, setMyTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [resolveModalVisible, setResolveModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [resolveNotes, setResolveNotes] = useState('')
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    resolvedTasks: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await userService.getUserDashboard()
      if (response.success) {
       
        if (response.statistics) {
          setStats(response.statistics)
        }
        
      
        setMyTasks(response.myTasks || [])
        setCompletedTasks(response.completedTasks || [])
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch dashboard data'
      notify.error('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = (task) => {
    setSelectedTask(task)
    setNewStatus(task.status)
    setUpdateModalVisible(true)
  }

  const handleResolveTask = (task) => {
    setSelectedTask(task)
    setResolveNotes('')
    setResolveModalVisible(true)
  }

  const submitStatusUpdate = async () => {
    if (!selectedTask || !newStatus) return
    
    try {
      const response = await taskService.updateTaskStatus(selectedTask._id, newStatus)
      if (response.success) {
        notify.success('Success', 'Task status updated successfully')
        setUpdateModalVisible(false)
        fetchDashboardData()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to update task status'
      notify.error('Error', errorMessage)
    }
  }

  const submitResolveTask = async () => {
    if (!selectedTask) return
    
    try {
      const response = await taskService.resolveTask(selectedTask._id, resolveNotes)
      if (response.success) {
        notify.success('Success', 'Task resolved successfully')
        setResolveModalVisible(false)
        fetchDashboardData()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to resolve task'
      notify.error('Error', errorMessage)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'red'
      case 'in-progress': return 'blue'
      case 'completed': return 'green'
      case 'resolved': return 'purple'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  const taskColumns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      width: '25%'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ellipsis: true
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      render: (project) => project?.projectName || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase().replace('-', ' ') || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Badge 
          color={getPriorityColor(priority)} 
          text={priority?.toUpperCase() || 'N/A'}
        />
      )
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleUpdateStatus(record)}
            disabled={record.status === 'resolved'}
          >
            Update
          </Button>
          {record.status === 'in-progress' && (
            <Button 
              type="default" 
              size="small"
              style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
              onClick={() => handleResolveTask(record)}
            >
              Resolve
            </Button>
          )}
        </div>
      )
    }
  ]

  const completedColumns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      width: '30%'
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      render: (project) => project?.projectName || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase().replace('-', ' ') || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedDate',
      key: 'completedDate',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
    }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        My Dashboard
      </h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open Tasks"
              value={stats.openTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={stats.resolvedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* My Tasks Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="My Tasks" bordered={false}>
            <Table 
              columns={taskColumns} 
              dataSource={myTasks}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recently Completed */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Completed Tasks" bordered={false}>
            <Table 
              columns={completedColumns} 
              dataSource={completedTasks}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Update Status Modal */}
      <Modal
        title="Update Task Status"
        open={updateModalVisible}
        onOk={submitStatusUpdate}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Update"
      >
        <div style={{ marginBottom: '16px' }}>
          <strong>Task:</strong> {selectedTask?.title}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>New Status:</label>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
            value={newStatus}
            onChange={setNewStatus}
          >
            <Select.Option value="open">Open</Select.Option>
            <Select.Option value="in-progress">In Progress</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
          </Select>
        </div>
      </Modal>

      {/* Resolve Task Modal */}
      <Modal
        title="Resolve Task"
        open={resolveModalVisible}
        onOk={submitResolveTask}
        onCancel={() => setResolveModalVisible(false)}
        okText="Resolve Task"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        <div style={{ marginBottom: '16px' }}>
          <strong>Task:</strong> {selectedTask?.title}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Resolution Notes (Optional):</label>
          <TextArea
            rows={4}
            placeholder="Add any notes about how you resolved this task..."
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default UserDashboard
