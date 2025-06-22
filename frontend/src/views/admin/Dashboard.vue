<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">仪表盘</h3>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">小说总数</p>
            <p class="text-2xl font-semibold">{{ stats.novelCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">章节总数</p>
            <p class="text-2xl font-semibold">{{ stats.chapterCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">分类总数</p>
            <p class="text-2xl font-semibold">{{ stats.categoryCount }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-medium mb-4">最新小说</h3>
        <div v-if="loading" class="py-4">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="latestNovels.length > 0">
          <div v-for="novel in latestNovels" :key="novel.id" class="py-3 border-b last:border-0">
            <div class="flex justify-between">
              <router-link :to="`/novel/${novel.id}`" class="text-primary-600 hover:underline">
                {{ novel.title }}
              </router-link>
              <span class="text-sm text-gray-500">{{ formatDate(novel.created_at) }}</span>
            </div>
            <div class="text-sm text-gray-500 mt-1">{{ novel.author }}</div>
          </div>
        </div>
        <div v-else class="py-4 text-center text-gray-500">
          暂无数据
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-lg font-medium mb-4">热门小说</h3>
        <div v-if="loading" class="py-4">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="hotNovels.length > 0">
          <div v-for="novel in hotNovels" :key="novel.id" class="py-3 border-b last:border-0">
            <div class="flex justify-between">
              <router-link :to="`/novel/${novel.id}`" class="text-primary-600 hover:underline">
                {{ novel.title }}
              </router-link>
              <span class="text-sm text-gray-500">{{ novel.view_count }} 次阅读</span>
            </div>
            <div class="text-sm text-gray-500 mt-1">{{ novel.author }}</div>
          </div>
        </div>
        <div v-else class="py-4 text-center text-gray-500">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../../api'

export default {
  name: 'Dashboard',
  setup() {
    const loading = ref(true)
    const stats = ref({
      novelCount: 0,
      chapterCount: 0,
      categoryCount: 0
    })
    const latestNovels = ref([])
    const hotNovels = ref([])
    
    const fetchDashboardData = async () => {
      loading.value = true
      try {
        // 获取统计数据
        const [novelsRes, newNovelsRes, hotNovelsRes, categoriesRes] = await Promise.all([
          api.novels.getAll(1, 1), // 只需要总数
          api.novels.getNewNovels(5),
          api.novels.getHotNovels(5),
          api.categories.getAll()
        ])
        
        stats.value.novelCount = novelsRes.data.data.total || 0
        stats.value.categoryCount = categoriesRes.data.data.categories.length || 0
        
        // 计算章节总数
        let chapterCount = 0
        for (const novel of novelsRes.data.data.novels) {
          const chaptersRes = await api.chapters.getByNovelId(novel.id)
          chapterCount += chaptersRes.data.data.chapters.length || 0
        }
        stats.value.chapterCount = chapterCount
        
        latestNovels.value = newNovelsRes.data.data.novels || []
        hotNovels.value = hotNovelsRes.data.data.novels || []
      } catch (error) {
        console.error('获取仪表盘数据失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    onMounted(() => {
      fetchDashboardData()
    })
    
    return {
      loading,
      stats,
      latestNovels,
      hotNovels,
      formatDate
    }
  }
}
</script>
