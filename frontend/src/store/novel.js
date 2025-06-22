import { defineStore } from 'pinia'
import api from '../api'

export const useNovelStore = defineStore('novel', {
  state: () => ({
    recommendedNovels: [],
    newNovels: [],
    hotNovels: [],
    novelDetail: null,
    novelChapters: [],
    currentChapter: null,
    prevChapter: null,
    nextChapter: null,
    readingProgress: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // 获取首页推荐小说
    async fetchRecommendedNovels() {
      this.loading = true
      try {
        const response = await api.novels.getRecommended()
        console.log('小说请求结果', response.data)
        this.recommendedNovels = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.message || '获取推荐小说失败'
        console.error('获取推荐小说失败:', error)
        this.recommendedNovels = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取新书榜
    async fetchNewNovels() {
      this.loading = true
      try {
        const response = await api.novels.getNewNovels()
        this.newNovels = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.message || '获取新书榜失败'
        console.error('获取新书榜失败:', error)
        this.newNovels = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取热门榜
    async fetchHotNovels() {
      this.loading = true
      try {
        const response = await api.novels.getHotNovels()
        this.hotNovels = response.data.data || []
      } catch (error) {
        this.error = error.response?.data?.message || '获取热门榜失败'
        console.error('获取热门榜失败:', error)
        this.hotNovels = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取小说详情
    async fetchNovelDetail(id) {
      this.loading = true
      this.novelDetail = null
      this.novelChapters = []
      
      try {
        // 并行获取小说详情和章节列表
        const [novelResponse, chaptersResponse] = await Promise.all([
          api.novels.getById(id),
          api.chapters.getByNovelId(id)
        ])
        
        this.novelDetail = novelResponse.data.data
        this.novelChapters = chaptersResponse.data.data.chapters || []
      } catch (error) {
        this.error = error.response?.data?.message || '获取小说详情失败'
        console.error('获取小说详情失败:', error)
        this.novelDetail = null
        this.novelChapters = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取章节内容
    async fetchChapterContent(id) {
      this.loading = true
      this.currentChapter = null
      this.prevChapter = null
      this.nextChapter = null
      
      try {
        const response = await api.chapters.getById(id)
        this.currentChapter = response.data.data.chapter
        this.prevChapter = response.data.data.prevChapter
        this.nextChapter = response.data.data.nextChapter
      } catch (error) {
        this.error = error.response?.data?.message || '获取章节内容失败'
        console.error('获取章节内容失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 获取阅读进度
    async fetchReadingProgress(novelId) {
      try {
        const response = await api.chapters.getReadingProgress(novelId)
        this.readingProgress = response.data.data
      } catch (error) {
        console.error('获取阅读进度失败:', error)
        this.readingProgress = null
      }
    },
    
    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
