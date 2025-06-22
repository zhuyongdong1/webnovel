<template>
  <div class="container-custom py-8">
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="10" />
    </div>
    
    <div v-else>
      <h1 class="text-3xl font-bold mb-8 flex items-center">
        <span class="w-2 h-8 bg-primary-600 mr-3"></span>
        搜索结果: {{ keyword }}
      </h1>
      
      <div v-if="novels.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link 
          v-for="novel in novels" 
          :key="novel.id"
          :to="`/novel/${novel.id}`"
          class="flex items-start p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex-shrink-0 w-20 h-28 mr-4 overflow-hidden rounded">
            <img 
              :src="novel.cover_image ? `${config.staticBaseUrl}/covers/${novel.cover_image}` : '/placeholder-cover.jpg'" 
              :alt="novel.title"
              class="w-full h-full object-cover"
            >
          </div>
          <div class="flex-grow min-w-0">
            <h3 class="font-medium text-gray-900 truncate">{{ novel.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ novel.author }}</p>
            <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ novel.description }}</p>
            <div class="flex items-center mt-2 text-xs text-gray-400">
              <span>{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
              <span class="mx-2">·</span>
              <span>{{ novel.word_count }} 字</span>
            </div>
          </div>
        </router-link>
      </div>
      
      <div v-else class="text-center py-12 text-gray-500">
        未找到与 "{{ keyword }}" 相关的小说
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="10"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import config from '../config'

export default {
  name: 'SearchResults',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(true)
    const novels = ref([])
    const total = ref(0)
    const totalPages = ref(0)
    const currentPage = ref(1)
    
    const keyword = computed(() => route.query.keyword || '')
    
    const fetchSearchResults = async (keyword, page = 1) => {
      if (!keyword) {
        novels.value = []
        total.value = 0
        totalPages.value = 0
        return
      }
      
      loading.value = true
      try {
        const response = await api.novels.search(keyword, page)
        novels.value = response.data.data.novels
        total.value = response.data.data.total
        totalPages.value = response.data.data.totalPages
        currentPage.value = response.data.data.currentPage
      } catch (error) {
        console.error('搜索小说失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    const handlePageChange = (page) => {
      router.push({
        path: '/search',
        query: { 
          keyword: keyword.value,
          page
        }
      })
    }
    
    onMounted(() => {
      fetchSearchResults(keyword.value, parseInt(route.query.page) || 1)
    })
    
    // 监听路由参数变化
    watch(() => [route.query.keyword, route.query.page], ([newKeyword, newPage]) => {
      fetchSearchResults(newKeyword, parseInt(newPage) || 1)
    })
    
    return {
      loading,
      novels,
      total,
      totalPages,
      currentPage,
      keyword,
      handlePageChange,
      config
    }
  }
}
</script>
