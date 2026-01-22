import { notification } from 'antd'

const notify = {
  success: (title, description) => {
    notification.success({
      message: title,
      description,
      placement: 'topRight',
      duration: 3
    })
  },

  error: (title, description) => {
    notification.error({
      message: title,
      description,
      placement: 'topRight',
      duration: 4
    })
  },

  info: (title, description) => {
    notification.info({
      message: title,
      description,
      placement: 'topRight',
      duration: 3
    })
  },

  warning: (title, description) => {
    notification.warning({
      message: title,
      description,
      placement: 'topRight',
      duration: 3
    })
  }
}

export default notify
