<template>
  <div class="container-custom py-8">
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="10" />
    </div>
    
    <div v-else-if="novel" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- 小说信息 -->
      <div class="md:col-span-1">
        <div class="card p-6">
          <div class="flex flex-col items-center">
            <img 
              :src="novel.cover_image ? `${config.staticBaseUrl}/covers/${novel.cover_image}` : '/placeholder-cover.jpg'" 
              :alt="novel.title"
              class="w-48 h-64 object-cover rounded-lg shadow-md mb-4"
            >
            <h1 class="text-2xl font-bold text-center mb-2">{{ novel.title }}</h1>
            <p class="text-gray-600 mb-4">{{ novel.author }}</p>
            
            <div class="flex space-x-4 mb-4">
              <span class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                {{ novel.status === 0 ? '连载中' : '已完结' }}
              </span>
              <span class="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                {{ novel.word_count }} 字
              </span>
            </div>
            
            <div class="flex space-x-2 mb-6">
              <router-link 
                v-for="category in novel.categories" 
                :key="category.id"
                :to="`/category/${category.id}`"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                {{ category.name }}
              </router-link>
            </div>
            
            <div class="w-full">
              <router-link 
                :to="readingLink"
                class="btn btn-primary w-full flex justify-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ hasReadingProgress ? '继续阅读' : '开始阅读' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 小说简介和章节列表 -->
      <div class="md:col-span-2">
        <div class="card p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">内容简介</h2>
          <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ novel.description }}</p>
        </div>
        
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">章节列表</h2>
            <div class="text-sm text-gray-500">共 {{ chapters.length }} 章</div>
          </div>
          
          <div v-if="chapters.length === 0" class="py-4 text-center text-gray-500">
            暂无章节
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <router-link 
              v-for="chapter in chapters" 
              :key="chapter.id"
              :to="`/read/${chapter.id}`"
              class="p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex justify-between items-center"
            >
              <span class="truncate">{{ chapter.title }}</span>
              <span class="text-xs text-gray-500 flex-shrink-0 ml-2">{{ formatDate(chapter.created_at) }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">{{ error }}</div>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNovelStore } from '../store/novel'
import config from '../config'

export default {
  name: 'NovelDetail',
  setup() {
    const route = useRoute()
    const novelStore = useNovelStore()
    const loading = ref(true)
    const error = ref(null)
    
    const novelId = computed(() => route.params.id)
    
    const novel = computed(() => novelStore.novelDetail)
    const chapters = computed(() => novelStore.novelChapters)
    const readingProgress = computed(() => novelStore.readingProgress)
    
    const hasReadingProgress = computed(() => {
      return readingProgress.value && readingProgress.value.hasRecord
    })
    
    const readingLink = computed(() => {
      if (hasReadingProgress.value) {
        return `/read/${readingProgress.value.record.chapter_id}`
      } else if (chapters.value && chapters.value.length > 0) {
        return `/read/${chapters.value[0].id}`
      }
      return '#'
    })
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    onMounted(async () => {
      loading.value = true
      error.value = null
      
      try {
        await novelStore.fetchNovelDetail(novelId.value)
        await novelStore.fetchReadingProgress(novelId.value)
      } catch (err) {
        error.value = '获取小说详情失败'
        console.error(err)
      } finally {
        loading.value = false
      }
    })
    
    return {
      loading,
      error,
      novel,
      chapters,
      readingProgress,
      hasReadingProgress,
      readingLink,
      formatDate,
      config
    }
  }
}
</script>
