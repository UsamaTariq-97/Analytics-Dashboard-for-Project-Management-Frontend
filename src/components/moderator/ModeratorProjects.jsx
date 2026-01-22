import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  Space,
  Popconfirm,
  Progress,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import projectService from '../../services/projectService'
import notify from '../../utils/notification'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const ModeratorProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form] = Form.useForm()

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectService.getMyProjects()
      
      // Handle API response structure
      if (response.success) {
        setProjects(response.data)
        
        // Use statistics from API
        setStats({
          total: response.statistics.totalProjects,
          active: response.statistics.activeProjects,
          completed: response.statistics.completedProjects
        })
      }
    } catch (error) {
      notify.error('Error', 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProject(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingProject(record)
    form.setFieldsValue({
      name: record.projectName,
      description: record.projectDescription,
      status: record.projectStatus,
      startDate: record.projectStartDate ? dayjs(record.projectStartDate) : null,
      endDate: record.projectEndDate ? dayjs(record.projectEndDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (projectId) => {
    try {
      await projectService.deleteProject(projectId)
      notify.success('Success', 'Project deleted successfully')
      fetchProjects()
    } catch (error) {
      notify.error('Error', 'Failed to delete project')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const projectData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
      }

      if (editingProject) {
        await projectService.updateProject(editingProject._id, projectData)
        notify.success('Success', 'Project updated successfully')
      } else {
        await projectService.createProject(projectData)
        notify.success('Success', 'Project created successfully')
      }

      setModalVisible(false)
      form.resetFields()
      fetchProjects()
    } catch (error) {
      notify.error('Error', editingProject ? 'Failed to update project' : 'Failed to create project')
    }
  }

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Description',
      dataIndex: 'projectDescription',
      key: 'projectDescription',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' : 
          status === 'completed' ? 'blue' : 
          status === 'pending' ? 'orange' :
          'default'
        }>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress || 0} 
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (count) => count || 0
    },
    {
      title: 'Team Size',
      dataIndex: 'teamSize',
      key: 'teamSize',
      render: (size) => (
        <Space>
          <TeamOutlined />
          {size || 0}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Project"
            description="Are you sure you want to delete this project?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={stats.total}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Projects"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="My Projects"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Project
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} projects`
          }}
        />
      </Card>

      <Modal
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingProject ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Enter project description" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="on-hold">On Hold</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ModeratorProjects
