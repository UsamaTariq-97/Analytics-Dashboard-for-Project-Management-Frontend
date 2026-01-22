import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Select, 
  Input,
  Badge,
  Space,
  Row,
  Col,
  Statistic,
  Tabs
} from 'antd'
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FilterOutlined
} from '@ant-design/icons'
import taskService from '../../services/taskService'
import notify from '../../utils/notification'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const UserTasks = () => {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [resolveModalVisible, setResolveModalVisible] = useState(false)
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [resolveNotes, setResolveNotes] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    resolvedTasks: 0,
    activeTasks: 0,
    completedTasks: 0
  })

  useEffect(() => {
    fetchMyTasks()
  }, [])

  useEffect(() => {
    fetchMyTasks()
  }, [activeTab, filterStatus, filterPriority])

  const fetchMyTasks = async () => {
    setLoading(true)
    try {
     
      const filters = {
        status: filterStatus,
        priority: filterPriority,
        type: activeTab
      }
      
      const response = await taskService.getUserTasks(filters)
      if (response.success) {
        setTasks(response.data || [])
        
       
        if (response.statistics) {
          setStats(response.statistics)
        }
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch tasks'
      notify.error('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = (task) => {
    setSelectedTask(task)
    setNewStatus(task.status)
    setStatusNotes('')
    setUpdateModalVisible(true)
  }

  const handleResolveTask = (task) => {
    setSelectedTask(task)
    setResolveNotes('')
    setResolveModalVisible(true)
  }

  const handleViewDetails = (task) => {
    setSelectedTask(task)
    setTaskDetailModalVisible(true)
  }

  const submitStatusUpdate = async () => {
    if (!selectedTask || !newStatus) {
      notify.error('Error', 'Please select a status')
      return
    }
    
    if (!statusNotes || statusNotes.trim() === '') {
      notify.error('Error', 'Please add notes about this status change')
      return
    }
    
    try {
      const response = await taskService.updateUserTaskStatus(
        selectedTask._id, 
        newStatus, 
        statusNotes
      )
      if (response.success) {
        notify.success('Success', 'Task status updated successfully')
        setUpdateModalVisible(false)
        setStatusNotes('')
        fetchMyTasks()
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
        setResolveNotes('')
        fetchMyTasks()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to resolve task'
      notify.error('Error', errorMessage)
    }
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterPriority('all')
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
      width: '20%',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => handleViewDetails(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      )
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
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
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
        </Space>
      )
    }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        My Tasks
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

      {/* Filters and Tasks Table */}
      <Card>
        <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <FilterOutlined />
            <Select
              style={{ width: 150 }}
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">All Status</Option>
              <Option value="open">Open</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Filter by Priority"
              value={filterPriority}
              onChange={setFilterPriority}
            >
              <Option value="all">All Priority</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </Space>
        </Space>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab={`All Tasks (${stats.totalTasks})`} key="all">
            <Table 
              columns={taskColumns} 
              dataSource={tasks}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} tasks` }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Active (${stats.activeTasks})`} key="active">
            <Table 
              columns={taskColumns} 
              dataSource={tasks}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} tasks` }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Completed (${stats.completedTasks})`} key="completed">
            <Table 
              columns={taskColumns} 
              dataSource={tasks}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} tasks` }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Task Detail Modal */}
      <Modal
        title="Task Details"
        open={taskDetailModalVisible}
        onCancel={() => setTaskDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTaskDetailModalVisible(false)}>
            Close
          </Button>,
          selectedTask?.status !== 'resolved' && (
            <Button 
              key="update" 
              type="primary"
              onClick={() => {
                setTaskDetailModalVisible(false)
                handleUpdateStatus(selectedTask)
              }}
            >
              Update Status
            </Button>
          ),
          selectedTask?.status === 'in-progress' && (
            <Button 
              key="resolve" 
              style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
              onClick={() => {
                setTaskDetailModalVisible(false)
                handleResolveTask(selectedTask)
              }}
            >
              Resolve Task
            </Button>
          )
        ]}
        width={700}
      >
        {selectedTask && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Title:</strong>
              <div style={{ marginTop: '8px' }}>{selectedTask.title}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Description:</strong>
              <div style={{ marginTop: '8px' }}>{selectedTask.description || 'No description'}</div>
            </div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Project:</strong>
                <div style={{ marginTop: '8px' }}>{selectedTask.project?.projectName || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <strong>Status:</strong>
                <div style={{ marginTop: '8px' }}>
                  <Tag color={getStatusColor(selectedTask.status)}>
                    {selectedTask.status?.toUpperCase().replace('-', ' ')}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Priority:</strong>
                <div style={{ marginTop: '8px' }}>
                  <Badge 
                    color={getPriorityColor(selectedTask.priority)} 
                    text={selectedTask.priority?.toUpperCase()}
                  />
                </div>
              </Col>
              <Col span={12}>
                <strong>Due Date:</strong>
                <div style={{ marginTop: '8px' }}>
                  {selectedTask.dueDate ? dayjs(selectedTask.dueDate).format('MMM DD, YYYY') : 'N/A'}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <strong>Created:</strong>
                <div style={{ marginTop: '8px' }}>
                  {dayjs(selectedTask.createdAt).format('MMM DD, YYYY HH:mm')}
                </div>
              </Col>
              <Col span={12}>
                <strong>Last Updated:</strong>
                <div style={{ marginTop: '8px' }}>
                  {dayjs(selectedTask.updatedAt).format('MMM DD, YYYY HH:mm')}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Task Status"
        open={updateModalVisible}
        onOk={submitStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false)
          setStatusNotes('')
        }}
        okText="Update"
      >
        <div style={{ marginBottom: '16px' }}>
          <strong>Task:</strong> {selectedTask?.title}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>New Status: <span style={{ color: 'red' }}>*</span></label>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
            value={newStatus}
            onChange={setNewStatus}
          >
            <Option value="open">Open</Option>
            <Option value="in-progress">In Progress</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Status Update Notes: <span style={{ color: 'red' }}>*</span></label>
          <TextArea
            rows={4}
            placeholder="Please provide notes about this status change (required)..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            style={{ marginTop: '8px' }}
          />
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            Explain what you're doing or what progress you've made
          </div>
        </div>
      </Modal>

      {/* Resolve Task Modal */}
      <Modal
        title="Resolve Task"
        open={resolveModalVisible}
        onOk={submitResolveTask}
        onCancel={() => {
          setResolveModalVisible(false)
          setResolveNotes('')
        }}
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

export default UserTasks
