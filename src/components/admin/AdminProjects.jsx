import React, { useState, useEffect } from 'react'
import { Table, Tag, Input, Select, Card, Progress, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import projectService from '../../services/projectService'

const { Search } = Input
const { Option } = Select

const AdminProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchProjects()
  }, [searchText, statusFilter])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectService.getAdminProjects({
        status: statusFilter,
        search: searchText
      })
      if (response.success) {
        setProjects(response.data || [])
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch projects'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'blue'
      case 'completed': return 'green'
      case 'on-hold': return 'orange'
      case 'cancelled': return 'red'
      default: return 'default'
    }
  }

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => record.projectName || record.name || 'N/A'
    },
    {
      title: 'Description',
      dataIndex: 'projectDescription',
      key: 'projectDescription',
      ellipsis: true,
      render: (text, record) => record.projectDescription || record.description || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      render: (text, record) => {
        const status = record.projectStatus || record.status
        return (
          <Tag color={getStatusColor(status)}>
            {status?.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager) => manager?.fullName || manager?.name || 'Unassigned'
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks'
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress || 0} size="small" />
    },
    {
      title: 'Team Size',
      dataIndex: 'teamSize',
      key: 'teamSize'
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">All Projects</h1>
        
        <div className="flex gap-4 mb-4">
          <Search
            placeholder="Search projects"
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            style={{ width: 150 }}
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="completed">Completed</Option>
            <Option value="on-hold">On Hold</Option>
            <Option value="pending">Pending</Option>
          </Select>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} projects`
          }}
        />
      </Card>
    </div>
  )
}

export default AdminProjects
