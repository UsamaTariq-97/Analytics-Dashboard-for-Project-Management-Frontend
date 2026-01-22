import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import notify from '../../utils/notification'

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator (Project Manager)' },
   
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    setErrors({}) 
    
    try {
      const { confirmPassword, ...registrationData } = formData
      const response = await authService.register(registrationData)
      
      console.log('Registration successful:', response)
      notify.success('Registration Successful', )
      const user = authService.getCurrentUser()
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (user.role === 'moderator') {
          navigate('/moderator/dashboard')
        } else {
          navigate('/user/dashboard')
        }
      } else {
        setTimeout(() => {
          navigate('/')
        }, 1000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = typeof error === 'string' ? error : 'Registration failed. Please try again.';
      notify.error('Registration Failed', errorMessage);
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen py-12 px-4'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl'>
     
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Register Account</h1>
          <p className='mt-2 text-sm text-gray-600'>Project management system</p>
        </div>

      
        <form onSubmit={handleSubmit} className='space-y-5'>
         
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>
              Full Name
            </label>
            <input
              type='text'
              id='fullName'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter your full name'
            />
            {errors.fullName && (
              <p className='mt-1 text-sm text-red-600'>{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter your email'
            />
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
            )}
          </div>

     
          <div>
            <label htmlFor='role' className='block text-sm font-medium text-gray-700 mb-1'>
              Select Role
            </label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full px-4 py-2.5 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white'
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}  {role.description}
                </option>
              ))}
            </select>
          </div>

      
          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Create a password'
            />
            {errors.password && (
              <p className='mt-1 text-sm text-red-600'>{errors.password}</p>
            )}
          </div>

       
          <div>
            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-1'>
              Confirm Password
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Confirm your password'
            />
            {errors.confirmPassword && (
              <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>
            )}
          </div>

        
          {errors.submit && (
            <div className='p-3 text-sm text-red-700 bg-red-100 rounded-lg'>
              {errors.submit}
            </div>
          )}

         
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

      
        <div className='text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link to='/' className='font-medium text-indigo-600 hover:text-indigo-500'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register