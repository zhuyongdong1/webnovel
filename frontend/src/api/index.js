import axios from 'axios'
import { ElMessage } from 'element-plus'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.retry = 3 // 重试次数
    config.retryDelay = 1000 // 重试间隔
    return config
  },
  error => {
    ElMessage.error('请求发送失败')
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
      // 未授权，清除token并重定向到登录页
      localStorage.removeItem('admin_token')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.code === 'ECONNABORTED') {
        // 超时重试
        const config = error.config
        if (!config || !config.retry) {
          return Promise.reject(error)
        }
        config.retry -= 1
        const delayRetry = new Promise(resolve => {
          setTimeout(resolve, config.retryDelay || 1000)
        })
        await delayRetry
        return apiClient(config)
      }
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default {
  // 管理员相关
  admin: {
    login(credentials) {
      return apiClient.post('/admin/login', credentials)
    },
    getProfile() {
      return apiClient.get('/admin/profile')
    },
    changePassword(data) {
      return apiClient.put('/admin/change-password', data)
    }
  },
  
  // 小说相关
  novels: {
    getAll(page = 1, limit = 10) {
      return apiClient.get(`/novels?page=${page}&limit=${limit}`)
    },
    getById(id) {
      return apiClient.get(`/novels/${id}`)
    },
    create(formData) {
      return apiClient.post('/novels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    update(id, formData) {
      return apiClient.put(`/novels/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    delete(id) {
      return apiClient.delete(`/novels/${id}`)
    },
    getRecommended(limit = 6) {
      return apiClient.get(`/novels/recommended/list?limit=${limit}`)
    },
    getNewNovels(limit = 10) {
      return apiClient.get(`/novels/ranking/new?limit=${limit}`)
    },
    getHotNovels(limit = 10) {
      return apiClient.get(`/novels/ranking/hot?limit=${limit}`)
    },
    getByCategory(categoryId, page = 1, limit = 10) {
      return apiClient.get(`/novels/category/${categoryId}?page=${page}&limit=${limit}`)
    },
    search(keyword, page = 1, limit = 10) {
      return apiClient.get(`/novels/search/query?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`)
    }
  },
  
  // 章节相关
  chapters: {
    getById(id) {
      return apiClient.get(`/chapters/${id}`)
    },
    getByNovelId(novelId) {
      return apiClient.get(`/chapters/novel/${novelId}`)
    },
    create(data) {
      return apiClient.post('/chapters', data)
    },
    update(id, data) {
      return apiClient.put(`/chapters/${id}`, data)
    },
    delete(id) {
      return apiClient.delete(`/chapters/${id}`)
    },
    bulkImport(data) {
      return apiClient.post('/chapters/bulk-import', data)
    },
    getReadingProgress(novelId) {
      return apiClient.get(`/chapters/progress/${novelId}`)
    }
  },
  
  // 分类相关
  categories: {
    getAll() {
      return apiClient.get('/categories')
    },
    getById(id) {
      return apiClient.get(`/categories/${id}`)
    },
    create(data) {
      return apiClient.post('/categories', data)
    },
    update(id, data) {
      return apiClient.put(`/categories/${id}`, data)
    },
    delete(id) {
      return apiClient.delete(`/categories/${id}`)
    }
  },
  
  // 公共API
  public: {
    getHomeData() {
      return apiClient.get('/public/home')
    }
  }
}
