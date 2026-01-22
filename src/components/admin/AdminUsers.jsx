import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select, Modal, Form } from 'antd'
import { DeleteOutlined, SearchOutlined, StopOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons'
import userService from '../../services/userService'

const { Search } = Input
const { Option } = Select

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchText, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getAllUsers()
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to fetch users'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]


    if (searchText) {
      filtered = filtered.filter(user => 
        user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

   
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

  
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleDelete = async (userId) => {
    try {
      const response = await userService.deleteUser(userId)
      if (response.success) {
        message.success(response.message || 'User deleted successfully')
        fetchUsers()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to delete user'
      message.error(errorMessage)
    }
  }

  const handleToggleSuspension = async (userId, currentStatus) => {
    try {
      const response = currentStatus === 'suspended'
        ? await userService.activateUser(userId)
        : await userService.suspendUser(userId)
      
      if (response.success) {
        message.success(response.message || `User ${currentStatus === 'suspended' ? 'activated' : 'suspended'} successfully`)
        fetchUsers()
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to update user status'
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

  const columns = [
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
            description="Are you sure you want to delete this user? This action cannot be undone."
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        
        <div className="flex gap-4 mb-4">
          <Search
            placeholder="Search by name or email"
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Select
            style={{ width: 150 }}
            placeholder="Filter by Role"
            value={roleFilter}
            onChange={setRoleFilter}
          >
            <Option value="all">All Roles</Option>
            <Option value="admin">Admin</Option>
            <Option value="moderator">Moderator</Option>
            <Option value="user">User</Option>
          </Select>

          <Select
            style={{ width: 150 }}
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} users`
        }}
      />
    </div>
  )
}

export default AdminUsers
