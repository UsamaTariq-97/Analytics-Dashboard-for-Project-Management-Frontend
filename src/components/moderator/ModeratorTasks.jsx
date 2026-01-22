import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Space,
  Popconfirm,
  Tabs,
  Row,
  Col,
  Statistic,
  Badge,
  DatePicker
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import taskService from '../../services/taskService'
import userService from '../../services/userService'
import projectService from '../../services/projectService'
import notify from '../../utils/notification'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const ModeratorTasks = () => {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    await Promise.all([
      fetchTasks(),
      fetchUsers(),
      fetchProjects()
    ])
  }

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await taskService.getAllTasks()
      
      if (response.success) {
        
        setTasks(Array.isArray(response.data) ? response.data : [])
        
       
        if (response.statistics) {
          setStats({
            total: response.statistics.totalTasks,
            open: response.statistics.openTasks,
            inProgress: response.statistics.inProgressTasks,
            resolved: response.statistics.resolvedTasks
          })
        }
      } else if (Array.isArray(response)) {
       
        setTasks(response)
        
        const open = response.filter(t => t.status === 'open').length
        const inProgress = response.filter(t => t.status === 'in-progress').length
        const resolved = response.filter(t => t.status === 'resolved').length
        
        setStats({
          total: response.length,
          open,
          inProgress,
          resolved
        })
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
      notify.error('Error', 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsersList()
    
      if (response.success && response.data) {
        setUsers(response.data)
      } else if (Array.isArray(response)) {
        setUsers(response)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([]) 
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjectsList()
      
      if (response.success && response.data) {
        setProjects(response.data)
      } else if (Array.isArray(response)) {
        setProjects(response)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setProjects([]) 
    }
  }

  const handleCreate = () => {
    setEditingTask(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingTask(record)
    form.setFieldsValue({
      ...record,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      notify.success('Success', 'Task deleted successfully')
      fetchTasks()
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to delete task'
      notify.error('Error', errorMessage)
    }
  }

  const handleAssign = (record) => {
    setSelectedTask(record)
    assignForm.setFieldsValue({ userId: record.assignedTo?._id })
    setAssignModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      // Format the data for API
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
      }
      
      if (editingTask) {
        await taskService.updateTask(editingTask._id, taskData)
        notify.success('Success', 'Task updated successfully')
      } else {
        await taskService.createTask(taskData)
        notify.success('Success', 'Task created successfully')
      }

      setModalVisible(false)
      form.resetFields()
      fetchTasks()
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : (editingTask ? 'Failed to update task' : 'Failed to create task')
      notify.error('Error', errorMessage)
    }
  }

  const handleAssignSubmit = async (values) => {
    try {
      await taskService.assignTask(selectedTask._id, values.userId)
      notify.success('Success', 'Task assigned successfully')
      setAssignModalVisible(false)
      assignForm.resetFields()
      fetchTasks()
    } catch (error) {
      
      const errorMessage = typeof error === 'string' ? error : 'Failed to assign task'
      notify.error('Error', errorMessage)
    }
  }

  const handleVerify = async (taskId, verified) => {
    try {
      await taskService.verifyTask(taskId, verified)
      notify.success('Success', verified ? 'Task verified successfully' : 'Task rejected')
      fetchTasks()
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to verify task'
      notify.error('Error', errorMessage)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'open': 'blue',
      'in-progress': 'orange',
      'resolved': 'green',
      'verified': 'purple',
      'closed': 'default'
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'purple'
    }
    return colors[priority] || 'default'
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Project',
      dataIndex: ['project', 'projectName'],
      key: 'project',
      render: (text, record) => {
       
        const projectName = record.project?.projectName || record.project?.name || 'N/A'
        return projectName
      }
    },
    {
      title: 'Assigned To',
      dataIndex: ['assignedTo', 'fullName'],
      key: 'assignedTo',
      render: (text, record) => {
       
        const assignedName = record.assignedTo?.fullName || record.assignedTo?.name || null
        return assignedName || <Tag>Unassigned</Tag>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority?.toUpperCase()}
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
            icon={<UserAddOutlined />}
            onClick={() => handleAssign(record)}
          >
            Assign
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Task"
            description="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record._id)}
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

  const filterTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const tabItems = [
    {
      key: 'all',
      label: <Badge count={stats.total} offset={[10, 0]}>All Tasks</Badge>,
      children: (
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'open',
      label: <Badge count={stats.open} offset={[10, 0]}>Open</Badge>,
      children: (
        <Table
          columns={columns}
          dataSource={filterTasksByStatus('open')}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'in-progress',
      label: <Badge count={stats.inProgress} offset={[10, 0]}>In Progress</Badge>,
      children: (
        <Table
          columns={columns}
          dataSource={filterTasksByStatus('in-progress')}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'resolved',
      label: <Badge count={stats.resolved} offset={[10, 0]}>Resolved</Badge>,
      children: (
        <Table
          columns={columns}
          dataSource={filterTasksByStatus('resolved')}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )
    }
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Open Tasks"
              value={stats.open}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff7a45' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={stats.resolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Task Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Task
          </Button>
        }
      >
        <Tabs items={tabItems} />
      </Card>

      {/* Create/Edit Task Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingTask ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item
            name="project"
            label="Project"
            rules={[{ required: true, message: 'Please select project' }]}
          >
            <Select placeholder="Select project">
              {Array.isArray(projects) && projects.map(project => (
                <Option key={project._id} value={project._id}>
                  {project.projectName || project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="open">Open</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="resolved">Resolved</Option>
                  <Option value="closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Select due date"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false)
          assignForm.resetFields()
        }}
        onOk={() => assignForm.submit()}
        okText="Assign"
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignSubmit}
        >
          <Form.Item
            name="userId"
            label="Assign to User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user">
              {Array.isArray(users) && users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.fullName || user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ModeratorTasks
