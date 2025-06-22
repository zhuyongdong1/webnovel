<template>
  <div class="container-custom py-8">
    <h1 class="text-3xl font-bold mb-8 flex items-center">
      <span class="w-2 h-8 bg-primary-600 mr-3"></span>
      小说排行榜
    </h1>
    
    <el-tabs v-model="activeTab" class="mb-8">
      <el-tab-pane label="热门榜" name="hot"></el-tab-pane>
      <el-tab-pane label="新书榜" name="new"></el-tab-pane>
    </el-tabs>
    
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="10" />
    </div>
    
    <div v-else>
      <!-- 热门榜 -->
      <div v-if="activeTab === 'hot' && hotNovels.length > 0">
        <div class="grid grid-cols-1 gap-4">
          <router-link 
            v-for="(novel, index) in hotNovels" 
            :key="novel.id"
            :to="`/novel/${novel.id}`"
            class="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center mr-4 font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-shrink-0 w-20 h-28 mr-4 overflow-hidden rounded">
              <img 
                :src="novel.cover_image ? novel.cover_image : '/placeholder-cover.jpg'" 
                :alt="novel.title"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="flex-grow min-w-0">
              <h3 class="font-medium text-gray-900 truncate">{{ novel.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ novel.author }}</p>
              <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ novel.description }}</p>
              <div class="flex items-center mt-2 text-xs text-gray-400">
                <span>{{ novel.view_count }} 次阅读</span>
                <span class="mx-2">·</span>
                <span>{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
                <span class="mx-2">·</span>
                <span>{{ novel.word_count }} 字</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- 新书榜 -->
      <div v-else-if="activeTab === 'new' && newNovels.length > 0">
        <div class="grid grid-cols-1 gap-4">
          <router-link 
            v-for="(novel, index) in newNovels" 
            :key="novel.id"
            :to="`/novel/${novel.id}`"
            class="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center mr-4 font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-shrink-0 w-20 h-28 mr-4 overflow-hidden rounded">
              <img 
                :src="novel.cover_image ? novel.cover_image : '/placeholder-cover.jpg'" 
                :alt="novel.title"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="flex-grow min-w-0">
              <h3 class="font-medium text-gray-900 truncate">{{ novel.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ novel.author }}</p>
              <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ novel.description }}</p>
              <div class="flex items-center mt-2 text-xs text-gray-400">
                <span>{{ formatDate(novel.created_at) }} 更新</span>
                <span class="mx-2">·</span>
                <span>{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
                <span class="mx-2">·</span>
                <span>{{ novel.word_count }} 字</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      
      <div v-else class="text-center py-12 text-gray-500">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useNovelStore } from '../store/novel'
import { storeToRefs } from 'pinia'

export default {
  name: 'Ranking',
  setup() {
    const novelStore = useNovelStore()
    const { hotNovels, newNovels, loading } = storeToRefs(novelStore)
    
    const activeTab = ref('hot')
    
    const fetchData = async () => {
      loading.value = true
      try {
        if (activeTab.value === 'hot') {
          await novelStore.fetchHotNovels()
        } else {
          await novelStore.fetchNewNovels()
        }
      } catch (error) {
        console.error('获取排行榜数据失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    onMounted(() => {
      fetchData()
    })
    
    // 监听标签页变化
    watch(() => activeTab.value, (newTab) => {
      console.log('标签页切换至:', newTab)
      fetchData()
    })
    
    return {
      loading,
      activeTab,
      hotNovels,
      newNovels,
      formatDate
    }
  }
}
</script>
