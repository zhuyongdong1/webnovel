<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">{{ isEdit ? '编辑章节' : '新增章节' }}</h3>
      <router-link :to="`/admin/chapters/${novelId}`" class="btn btn-secondary">
        返回章节列表
      </router-link>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div v-if="loading" class="py-4">
        <el-skeleton :rows="10" animated />
      </div>
      
      <form v-else @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">所属小说</label>
          <div class="text-lg font-medium">{{ novel?.title }}</div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-gray-700 mb-2">章节标题</label>
            <input
              v-model="form.title"
              type="text"
              class="input"
              placeholder="请输入章节标题"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2">章节序号</label>
            <input
              v-model.number="form.chapter_number"
              type="number"
              class="input"
              placeholder="请输入章节序号"
              min="1"
              required
            />
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">章节内容</label>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入章节内容"
            required
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-secondary mr-4"
            @click="$router.push(`/admin/chapters/${novelId}`)"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '创建章节') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../../api'

export default {
  name: 'ChapterForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const isEdit = computed(() => route.name === 'admin-chapter-edit')
    const chapterId = computed(() => route.params.id)
    const novelId = computed(() => route.params.novelId || '')
    
    const loading = ref(true)
    const submitting = ref(false)
    const novel = ref(null)
    
    const form = ref({
      title: '',
      content: '',
      chapter_number: 1,
      novel_id: ''
    })
    
    const fetchNovel = async (id) => {
      try {
        const response = await api.novels.getById(id)
        novel.value = response.data.data.novel
      } catch (error) {
        console.error('获取小说详情失败:', error)
        ElMessage.error('获取小说详情失败')
      }
    }
    
    const fetchChapterDetail = async (id) => {
      try {
        const response = await api.chapters.getById(id)
        const chapter = response.data.data.chapter
        
        form.value = {
          title: chapter.title,
          content: chapter.content,
          chapter_number: chapter.chapter_number,
          novel_id: chapter.novel_id
        }
        
        // 获取小说信息
        await fetchNovel(chapter.novel_id)
      } catch (error) {
        console.error('获取章节详情失败:', error)
        ElMessage.error('获取章节详情失败')
      }
    }
    
    const getNextChapterNumber = async (novelId) => {
      try {
        const response = await api.chapters.getByNovelId(novelId)
        const chapters = response.data.data.chapters
        
        if (chapters && chapters.length > 0) {
          // 找出最大章节序号并加1
          const maxChapterNumber = Math.max(...chapters.map(c => c.chapter_number))
          return maxChapterNumber + 1
        }
        
        return 1 // 如果没有章节，则从1开始
      } catch (error) {
        console.error('获取章节列表失败:', error)
        return 1
      }
    }
    
    const handleSubmit = async () => {
      submitting.value = true
      
      try {
        const data = {
          title: form.value.title,
          content: form.value.content,
          chapter_number: form.value.chapter_number,
          novel_id: isEdit.value ? form.value.novel_id : novelId.value
        }
        
        if (isEdit.value) {
          // 更新章节
          await api.chapters.update(chapterId.value, data)
          ElMessage.success('章节更新成功')
        } else {
          // 创建章节
          await api.chapters.create(data)
          ElMessage.success('章节创建成功')
        }
        
        // 返回章节列表
        router.push(`/admin/chapters/${isEdit.value ? form.value.novel_id : novelId.value}`)
      } catch (error) {
        console.error(isEdit.value ? '更新章节失败:' : '创建章节失败:', error)
        ElMessage.error(isEdit.value ? '更新章节失败' : '创建章节失败')
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(async () => {
      loading.value = true
      
      try {
        if (isEdit.value) {
          // 编辑模式
          await fetchChapterDetail(chapterId.value)
        } else {
          // 创建模式
          await fetchNovel(novelId.value)
          form.value.novel_id = novelId.value
          form.value.chapter_number = await getNextChapterNumber(novelId.value)
        }
      } finally {
        loading.value = false
      }
    })
    
    return {
      isEdit,
      novelId,
      loading,
      submitting,
      novel,
      form,
      handleSubmit
    }
  }
}
</script>
