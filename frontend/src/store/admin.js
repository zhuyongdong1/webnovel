import { defineStore } from 'pinia'
import api from '../api'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('admin_token') || null,
    admin: null,
    novels: [],
    totalNovels: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    // 管理员登录
    async login(credentials) {
      this.loading = true
      try {
        const response = await api.admin.login(credentials)
        const { token, admin } = response.data.data
        this.token = token
        this.admin = admin
        localStorage.setItem('admin_token', token)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败'
        console.error('登录失败:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 获取管理员信息
    async fetchAdminProfile() {
      if (!this.token) return
      
      this.loading = true
      try {
        const response = await api.admin.getProfile()
        this.admin = response.data.data.admin
      } catch (error) {
        this.error = error.response?.data?.message || '获取管理员信息失败'
        console.error('获取管理员信息失败:', error)
        // 如果是401错误，清除token
        if (error.response && error.response.status === 401) {
          this.logout()
        }
      } finally {
        this.loading = false
      }
    },
    
    // 修改密码
    async changePassword(data) {
      this.loading = true
      try {
        await api.admin.changePassword(data)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '修改密码失败'
        console.error('修改密码失败:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 获取小说列表（管理员）
    async fetchNovels(page = 1, limit = 10) {
      this.loading = true
      try {
        const response = await api.novels.getAll(page, limit)
        this.novels = response.data.data.novels
        this.totalNovels = response.data.data.total
        this.totalPages = response.data.data.totalPages
        this.currentPage = response.data.data.currentPage
      } catch (error) {
        this.error = error.response?.data?.message || '获取小说列表失败'
        console.error('获取小说列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 创建小说
    async createNovel(formData) {
      this.loading = true
      try {
        const response = await api.novels.create(formData)
        return response.data.data.novel
      } catch (error) {
        this.error = error.response?.data?.message || '创建小说失败'
        console.error('创建小说失败:', error)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 更新小说
    async updateNovel(id, formData) {
      this.loading = true
      try {
        const response = await api.novels.update(id, formData)
        return response.data.data.novel
      } catch (error) {
        this.error = error.response?.data?.message || '更新小说失败'
        console.error('更新小说失败:', error)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 删除小说
    async deleteNovel(id) {
      this.loading = true
      try {
        await api.novels.delete(id)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '删除小说失败'
        console.error('删除小说失败:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 登出
    logout() {
      this.token = null
      this.admin = null
      localStorage.removeItem('admin_token')
    },
    
    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
