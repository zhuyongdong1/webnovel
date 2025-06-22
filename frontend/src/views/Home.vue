<template>
  <div class="container-custom py-8">
    <!-- 轮播推荐 -->
    <div class="mb-12">
      <div v-if="loading" class="flex justify-center py-12">
        <el-skeleton style="width: 100%" animated :rows="5" />
      </div>
      
      <div v-else-if="recommendedNovels.length > 0" class="relative">
        <el-carousel :interval="4000" type="card" height="300px">
          <el-carousel-item v-for="novel in recommendedNovels" :key="novel.id">
            <router-link :to="`/novel/${novel.id}`" class="block h-full">
              <div class="relative h-full rounded-lg overflow-hidden shadow-lg group">
                <img 
                  :src="novel.cover_image ? `${config.staticBaseUrl}/covers/${novel.cover_image}` : '/placeholder-cover.jpg'" 
                  :alt="novel.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <h3 class="text-xl md:text-2xl font-bold text-white mb-2">{{ novel.title }}</h3>
                  <p class="text-white/80 text-sm md:text-base line-clamp-2">{{ novel.description }}</p>
                  <div class="flex items-center mt-3">
                    <span class="text-white/70 text-sm">{{ novel.author }}</span>
                    <span class="mx-2 text-white/50">|</span>
                    <span class="text-white/70 text-sm">{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
                  </div>
                </div>
              </div>
            </router-link>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-6 flex items-center">
        <span class="w-1 h-6 bg-primary-600 mr-3"></span>
        小说分类
      </h2>
      
      <div v-if="categoriesLoading" class="flex justify-center py-4">
        <el-skeleton style="width: 100%" animated :rows="1" />
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <router-link 
          v-for="category in categories" 
          :key="category.id"
          :to="`/category/${category.id}`"
          class="card p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div class="text-lg font-medium text-gray-800">{{ category.name }}</div>
        </router-link>
      </div>
    </div>

    <!-- 新书榜 -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold flex items-center">
          <span class="w-1 h-6 bg-primary-600 mr-3"></span>
          新书榜
        </h2>
        <router-link to="/ranking" class="text-primary-600 hover:text-primary-700">
          查看更多 &rarr;
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-4">
        <el-skeleton style="width: 100%" animated :rows="3" />
      </div>
      
      <div v-else-if="newNovels.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <router-link 
          v-for="novel in newNovels.slice(0, 5)" 
          :key="novel.id"
          :to="`/novel/${novel.id}`"
          class="card group"
        >
          <div class="relative pt-[140%] overflow-hidden">
            <img 
              :src="novel.cover_image ? `${config.staticBaseUrl}/covers/${novel.cover_image}` : '/placeholder-cover.jpg'" 
              :alt="novel.title"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
          </div>
          <div class="p-3">
            <h3 class="font-medium text-gray-900 truncate">{{ novel.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ novel.author }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 热门榜 -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold flex items-center">
          <span class="w-1 h-6 bg-primary-600 mr-3"></span>
          热门榜
        </h2>
        <router-link to="/ranking" class="text-primary-600 hover:text-primary-700">
          查看更多 &rarr;
        </router-link>
      </div>
      
      <div v-if="loading" class="flex justify-center py-4">
        <el-skeleton style="width: 100%" animated :rows="3" />
      </div>
      
      <div v-else-if="hotNovels.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <router-link 
          v-for="(novel, index) in hotNovels.slice(0, 6)" 
          :key="novel.id"
          :to="`/novel/${novel.id}`"
          class="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex-shrink-0 w-16 h-20 mr-4 overflow-hidden rounded">
            <img 
              :src="novel.cover_image ? `${config.staticBaseUrl}/covers/${novel.cover_image}` : '/placeholder-cover.jpg'" 
              :alt="novel.title"
              class="w-full h-full object-cover"
            >
          </div>
          <div class="flex-grow min-w-0">
            <div class="flex items-center">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center mr-2">
                {{ index + 1 }}
              </span>
              <h3 class="font-medium text-gray-900 truncate">{{ novel.title }}</h3>
            </div>
            <p class="text-sm text-gray-500 mt-1">{{ novel.author }}</p>
            <p class="text-sm text-gray-400 mt-1">
              <span>{{ novel.view_count }} 次阅读</span>
              <span class="mx-2">·</span>
              <span>{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useNovelStore } from '../store/novel'
import { useCategoryStore } from '../store/category'
import config from '../config'

export default {
  name: 'HomePage',
  setup() {
    const novelStore = useNovelStore()
    const categoryStore = useCategoryStore()
    
    const loading = ref(true)
    const categoriesLoading = ref(true)
    
    const recommendedNovels = computed(() => novelStore.recommendedNovels)
    const hotNovels = computed(() => novelStore.hotNovels)
    const newNovels = computed(() => novelStore.newNovels)
    const categories = computed(() => categoryStore.categories)
    
    const fetchData = async () => {
      loading.value = true
      categoriesLoading.value = true
      
      try {
        // 并行获取所有数据
        await Promise.all([
          novelStore.fetchRecommendedNovels(),
          novelStore.fetchHotNovels(),
          novelStore.fetchNewNovels(),
          categoryStore.fetchAllCategories()
        ])
      } catch (error) {
        console.error('获取首页数据失败:', error)
      } finally {
        loading.value = false
        categoriesLoading.value = false
      }
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      categoriesLoading,
      recommendedNovels,
      hotNovels,
      newNovels,
      categories,
      config
    }
  }
}
</script>
