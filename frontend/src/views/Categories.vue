<template>
  <div class="container-custom py-8">
    <!-- 页面标题 -->
    <div class="mb-12">
      <h1 class="text-3xl font-bold mb-4 flex items-center">
      <span class="w-2 h-8 bg-primary-600 mr-3"></span>
      小说分类
    </h1>
      <p class="text-gray-600">探索各种类型的小说，找到您喜欢的作品</p>
    </div>
    
    <!-- 分类列表 -->
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="5" />
    </div>
    
    <div v-else-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="category in categories" 
        :key="category.id"
        :to="`/category/${category.id}`"
        class="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <!-- 分类卡片背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <!-- 分类内容 -->
        <div class="relative p-6">
          <!-- 分类图标 -->
          <div class="w-16 h-16 mb-4 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <!-- 分类信息 -->
          <div>
            <h2 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
              {{ category.name }}
            </h2>
            <p class="text-gray-600 line-clamp-2">{{ category.description || '暂无描述' }}</p>
          </div>
          
          <!-- 分类统计 -->
          <div class="mt-4 flex items-center text-sm text-gray-500">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {{ category.novel_count || 0 }} 本小说
            </span>
          </div>
          
          <!-- 悬停时的箭头 -->
          <div class="absolute right-6 bottom-6 text-primary-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </router-link>
    </div>
    
    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">暂无分类数据</div>
      <p class="text-sm text-gray-400">请稍后再来查看</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '../store/category'
import { storeToRefs } from 'pinia'

export default {
  name: 'Categories',
  setup() {
    const categoryStore = useCategoryStore()
    // 使用 storeToRefs 来保持 store 状态的响应性
    const { categories, loading } = storeToRefs(categoryStore)
    
    onMounted(async () => {
      // loading.value = true // loading state is handled by storeToRefs
      try {
        await categoryStore.fetchAllCategories()
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
      // finally { // loading state is handled by storeToRefs
      //   loading.value = false
      // }
    })
    
    return {
      loading,
      categories
    }
  }
}
</script>
