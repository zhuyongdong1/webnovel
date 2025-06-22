<template>
  <div class="container-custom py-8">
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="10" />
    </div>
    
    <div v-else>
      <h1 class="text-3xl font-bold mb-8 flex items-center">
        <span class="w-2 h-8 bg-primary-600 mr-3"></span>
        {{ category ? category.name : '分类小说' }}
      </h1>
      
      <div v-if="category" class="mb-6 text-gray-600">
        {{ category.description || '暂无描述' }}
      </div>
      
      <div v-if="novels.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <router-link 
          v-for="novel in novels" 
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
            <div class="flex justify-between items-center mt-2 text-xs text-gray-400">
              <span>{{ novel.status === 0 ? '连载中' : '已完结' }}</span>
              <span>{{ novel.word_count }} 字</span>
            </div>
          </div>
        </router-link>
      </div>
      
      <div v-else class="text-center py-12 text-gray-500">
        该分类下暂无小说
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalNovels"
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
import { useRoute } from 'vue-router'
import { useCategoryStore } from '../store/category'
import config from '../config'

export default {
  name: 'CategoryNovels',
  setup() {
    const route = useRoute()
    const categoryStore = useCategoryStore()
    const loading = ref(true)
    
    const categoryId = computed(() => route.params.id)
    const category = computed(() => categoryStore.categoryDetail)
    const novels = computed(() => categoryStore.categoryNovels)
    const totalNovels = computed(() => categoryStore.totalNovels)
    const totalPages = computed(() => categoryStore.totalPages)
    const currentPage = computed(() => categoryStore.currentPage)
    
    const fetchData = async (id, page = 1) => {
      loading.value = true
      try {
        await categoryStore.fetchCategoryDetail(id)
        await categoryStore.fetchNovelsByCategory(id, page)
      } catch (error) {
        console.error('获取分类小说失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    const handlePageChange = (page) => {
      fetchData(categoryId.value, page)
    }
    
    onMounted(() => {
      fetchData(categoryId.value)
    })
    
    // 监听路由参数变化
    watch(() => route.params.id, (newId) => {
      if (newId && newId !== categoryId.value) {
        fetchData(newId)
      }
    })
    
    return {
      loading,
      category,
      novels,
      totalNovels,
      totalPages,
      currentPage,
      handlePageChange,
      config
    }
  }
}
</script>
