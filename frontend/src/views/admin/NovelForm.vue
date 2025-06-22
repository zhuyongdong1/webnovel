<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">{{ isEdit ? '编辑小说' : '新增小说' }}</h3>
      <router-link to="/admin/novels" class="btn btn-secondary">
        返回列表
      </router-link>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div v-if="loading" class="py-4">
        <el-skeleton :rows="10" animated />
      </div>
      
      <form v-else @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-gray-700 mb-2">标题</label>
            <input
              v-model="form.title"
              type="text"
              class="input"
              placeholder="请输入小说标题"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2">作者</label>
            <input
              v-model="form.author"
              type="text"
              class="input"
              placeholder="请输入作者名称"
              required
            />
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">封面图片</label>
          <div class="flex items-start">
            <div v-if="form.cover_image || previewUrl" class="mr-4">
              <img 
                :src="previewUrl || form.cover_image" 
                alt="封面预览"
                class="w-32 h-44 object-cover rounded border"
              >
            </div>
            <div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
              <button
                type="button"
                class="btn btn-secondary"
                @click="$refs.fileInput.click()"
              >
                选择图片
              </button>
              <p class="text-sm text-gray-500 mt-2">
                支持 jpg、jpeg、png、gif 格式，建议尺寸 300x420 像素
              </p>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">分类</label>
          <el-select
            v-model="form.categories"
            multiple
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">状态</label>
          <el-radio-group v-model="form.status">
            <el-radio :label="0">连载中</el-radio>
            <el-radio :label="1">已完结</el-radio>
          </el-radio-group>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">简介</label>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入小说简介"
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-secondary mr-4"
            @click="$router.push('/admin/novels')"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '创建小说') }}
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
import { useAdminStore } from '../../store/admin'
import api from '../../api'

export default {
  name: 'NovelForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const adminStore = useAdminStore()
    const fileInput = ref(null)
    
    const isEdit = computed(() => !!route.params.id)
    const novelId = computed(() => route.params.id)
    
    const loading = ref(true)
    const submitting = ref(false)
    const categories = ref([])
    const previewUrl = ref('')
    const selectedFile = ref(null)
    
    const form = ref({
      title: '',
      author: '',
      cover_image: '',
      description: '',
      status: 0,
      categories: []
    })
    
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAll()
        categories.value = response.data.data.categories
      } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
      }
    }
    
    const fetchNovelDetail = async (id) => {
      try {
        const response = await api.novels.getById(id)
        const novel = response.data.data.novel
        
        form.value = {
          title: novel.title,
          author: novel.author,
          cover_image: novel.cover_image,
          description: novel.description,
          status: novel.status,
          categories: novel.categories.map(c => c.id)
        }
      } catch (error) {
        console.error('获取小说详情失败:', error)
        ElMessage.error('获取小说详情失败')
      }
    }
    
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // 验证文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        ElMessage.error('请选择有效的图片文件')
        return
      }
      
      // 验证文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB')
        return
      }
      
      selectedFile.value = file
      
      // 创建预览URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = URL.createObjectURL(file)
    }
    
    const handleSubmit = async () => {
      submitting.value = true
      
      try {
        // 创建FormData对象
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('author', form.value.author)
        formData.append('description', form.value.description)
        formData.append('status', form.value.status)
        
        // 添加分类
        form.value.categories.forEach(categoryId => {
          formData.append('categories', categoryId)
        })
        
        // 添加封面图片
        if (selectedFile.value) {
          formData.append('cover', selectedFile.value)
        }
        
        let result
        if (isEdit.value) {
          // 更新小说
          result = await adminStore.updateNovel(novelId.value, formData)
        } else {
          // 创建小说
          result = await adminStore.createNovel(formData)
        }
        
        if (result) {
          ElMessage.success(isEdit.value ? '小说更新成功' : '小说创建成功')
          router.push('/admin/novels')
        } else {
          throw new Error(adminStore.error || (isEdit.value ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(async () => {
      loading.value = true
      await fetchCategories()
      
      if (isEdit.value) {
        await fetchNovelDetail(novelId.value)
      }
      
      loading.value = false
    })
    
    return {
      isEdit,
      loading,
      submitting,
      categories,
      form,
      previewUrl,
      fileInput,
      handleFileChange,
      handleSubmit
    }
  }
}
</script>
