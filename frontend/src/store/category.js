import { defineStore } from 'pinia'
import api from '../api'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    categoryDetail: null,
    categoryNovels: [],
    totalNovels: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null
  }),
  
  actions: {
    // 获取所有分类
    async fetchAllCategories() {
      this.loading = true
      try {
        console.log('开始获取分类列表')
        const response = await api.categories.getAll()
        console.log('分类列表响应:', response)
        if (response.data && response.data.success) {
        this.categories = response.data.data.categories
          console.log('分类列表更新成功:', this.categories)
        } else {
          console.error('分类列表响应格式错误:', response)
          this.error = '获取分类列表失败'
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
        this.error = error.response?.data?.message || '获取分类列表失败'
      } finally {
        this.loading = false
      }
    },
    
    // 获取分类详情
    async fetchCategoryDetail(id) {
      this.loading = true
      try {
        const response = await api.categories.getById(id)
        this.categoryDetail = response.data.data.category
      } catch (error) {
        this.error = error.response?.data?.message || '获取分类详情失败'
        console.error('获取分类详情失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 获取分类下的小说
    async fetchNovelsByCategory(categoryId, page = 1, limit = 10) {
      this.loading = true
      try {
        const response = await api.novels.getByCategory(categoryId, page, limit)
        this.categoryNovels = response.data.data.novels
        this.totalNovels = response.data.data.total
        this.totalPages = response.data.data.totalPages
        this.currentPage = response.data.data.currentPage
      } catch (error) {
        this.error = error.response?.data?.message || '获取分类小说失败'
        console.error('获取分类小说失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
