<template>
  <div class="container-custom py-8">
    <div v-if="loading" class="flex justify-center py-12">
      <el-skeleton style="width: 100%" animated :rows="15" />
    </div>
    
    <div v-else-if="chapter" class="max-w-4xl mx-auto">
      <!-- 章节导航 -->
      <div class="flex justify-between items-center mb-6">
        <router-link 
          v-if="prevChapter" 
          :to="`/read/${prevChapter.id}`"
          class="btn btn-secondary"
        >
          上一章
        </router-link>
        <div v-else class="btn btn-secondary opacity-50 cursor-not-allowed">上一章</div>
        
        <router-link 
          :to="`/novel/${chapter.novel_id}`"
          class="btn btn-secondary"
        >
          目录
        </router-link>
        
        <router-link 
          v-if="nextChapter" 
          :to="`/read/${nextChapter.id}`"
          class="btn btn-secondary"
        >
          下一章
        </router-link>
        <div v-else class="btn btn-secondary opacity-50 cursor-not-allowed">下一章</div>
      </div>
      
      <!-- 章节标题 -->
      <div class="card p-6 mb-6">
        <h1 class="text-2xl font-bold text-center mb-2">{{ chapter.title }}</h1>
        <div class="text-center text-gray-500 mb-4">
          <span>{{ chapter.novel.title }}</span>
          <span class="mx-2">·</span>
          <span>{{ chapter.novel.author }}</span>
        </div>
        
        <div class="flex justify-center space-x-4 text-sm text-gray-500">
          <span>字数: {{ chapter.word_count }}</span>
          <span>更新时间: {{ formatDate(chapter.updated_at) }}</span>
        </div>
      </div>
      
      <!-- 阅读设置面板 -->
      <div class="card p-6 mb-6">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-8">
          <!-- 字体大小设置 -->
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">字体大小:</span>
            <div class="flex space-x-2">
              <button 
                v-for="option in fontSizeOptions" 
                :key="option.value"
                @click="fontSize = option.value"
                :class="{'btn-primary': fontSize === option.value, 'btn-secondary': fontSize !== option.value}"
                class="btn btn-sm"
              >{{ option.label }}</button>
            </div>
          </div>
          
          <!-- 背景颜色设置 -->
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">背景颜色:</span>
            <div class="flex space-x-2">
              <button 
                v-for="option in backgroundColorOptions" 
                :key="option.value"
                @click="backgroundColor = option.value"
                :style="{ backgroundColor: option.value, color: option.textColor || '#333' }"
                :class="{'ring-2 ring-primary-500': backgroundColor === option.value, 'ring-1 ring-gray-300': backgroundColor !== option.value}"
                class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer transition-all duration-200"
              >
                <svg v-if="backgroundColor === option.value" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 章节内容 -->
      <div 
        class="card p-6 mb-6 no-copy"
        :style="{ backgroundColor: backgroundColor }"
      >
        <div 
          class="chapter-content"
          :style="{ 
            fontSize: fontSize, 
            color: backgroundColorOptions.find(opt => opt.value === backgroundColor)?.textColor || '#333' 
          }"
          v-html="formattedContent"
        ></div>
      </div>
      
      <!-- 底部章节导航 -->
      <div class="flex justify-between items-center mt-8">
        <router-link 
          v-if="prevChapter" 
          :to="`/read/${prevChapter.id}`"
          class="btn btn-secondary"
        >
          上一章
        </router-link>
        <div v-else class="btn btn-secondary opacity-50 cursor-not-allowed">上一章</div>
        
        <router-link 
          :to="`/novel/${chapter.novel_id}`"
          class="btn btn-secondary"
        >
          目录
        </router-link>
        
        <router-link 
          v-if="nextChapter" 
          :to="`/read/${nextChapter.id}`"
          class="btn btn-secondary"
        >
          下一章
        </router-link>
        <div v-else class="btn btn-secondary opacity-50 cursor-not-allowed">下一章</div>
      </div>
    </div>
    
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">{{ error }}</div>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNovelStore } from '../store/novel'
import { storeToRefs } from 'pinia'

export default {
  name: 'ReadChapter',
  setup() {
    const route = useRoute()
    const novelStore = useNovelStore()
    const loading = ref(true)
    const error = ref(null)
    
    // 阅读设置状态
    const fontSize = ref(localStorage.getItem('readingFontSize') || '1.125rem') // 默认 18px
    const backgroundColor = ref(localStorage.getItem('readingBackgroundColor') || '#f9f9f9') // 默认浅灰色
    
    // 可选的字体大小和背景颜色选项
    const fontSizeOptions = [
      { label: '小号', value: '1rem' }, // 16px
      { label: '中号', value: '1.125rem' }, // 18px
      { label: '大号', value: '1.25rem' }, // 20px
      { label: '特大号', value: '1.5rem' } // 24px
    ]
    
    const backgroundColorOptions = [
      { label: '浅灰', value: '#f9f9f9' },
      { label: '白色', value: '#ffffff' },
      { label: '米黄', value: '#fef5e7' },
      { label: '护眼绿', value: '#e7fef0' },
      { label: '深灰', value: '#333333', textColor: '#ffffff' } // 深色背景字为白色
    ]
    
    // 保存设置到本地存储
    const saveSettings = () => {
      localStorage.setItem('readingFontSize', fontSize.value)
      localStorage.setItem('readingBackgroundColor', backgroundColor.value)
    }
    
    const chapterId = computed(() => route.params.id)
    
    const chapter = computed(() => novelStore.currentChapter)
    const prevChapter = computed(() => novelStore.prevChapter)
    const nextChapter = computed(() => novelStore.nextChapter)
    
    const formattedContent = computed(() => {
      if (!chapter.value || !chapter.value.content) return ''
      
      // 将内容按段落分割，并用<p>标签包裹
      return chapter.value.content
        .split('\n')
        .filter(para => para.trim() !== '')
        .map(para => `<p>${para}</p>`)
        .join('')
    })
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    const fetchChapter = async (id) => {
      loading.value = true
      error.value = null
      
      try {
        await novelStore.fetchChapterContent(id)
        // 滚动到顶部
        window.scrollTo(0, 0)
      } catch (err) {
        error.value = '获取章节内容失败'
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchChapter(chapterId.value)
    })
    
    // 监听路由参数变化，重新获取章节内容
    watch(() => route.params.id, (newId) => {
      if (newId) {
        fetchChapter(newId)
      }
    }, { immediate: true })
    
    // 监听字体大小和背景颜色变化，并保存设置
    watch([fontSize, backgroundColor], saveSettings)
    
    return {
      loading,
      error,
      chapter,
      prevChapter,
      nextChapter,
      formattedContent,
      formatDate,
      fontSize,
      backgroundColor,
      fontSizeOptions,
      backgroundColorOptions
    }
  }
}
</script>

<style scoped>
.chapter-content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
}

.chapter-content p {
  margin-bottom: 1.5em;
  text-indent: 2em;
}

.no-copy {
  user-select: none; /* 标准属性 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
