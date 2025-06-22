<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">{{ isEdit ? '编辑分类' : '新增分类' }}</h3>
      <router-link to="/admin/categories" class="btn btn-secondary">
        返回分类列表
      </router-link>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div v-if="loading" class="py-4">
        <el-skeleton :rows="5" animated />
      </div>
      
      <form v-else @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">分类名称</label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            placeholder="请输入分类名称"
            required
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">描述</label>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述"
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-secondary mr-4"
            @click="$router.push('/admin/categories')"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '创建分类') }}
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
  name: 'CategoryForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const isEdit = computed(() => !!route.params.id)
    const categoryId = computed(() => route.params.id)
    
    const loading = ref(true)
    const submitting = ref(false)
    
    const form = ref({
      name: '',
      description: ''
    })
    
    const fetchCategoryDetail = async (id) => {
      try {
        const response = await api.categories.getById(id)
        const category = response.data.data.category
        
        form.value = {
          name: category.name,
          description: category.description
        }
      } catch (error) {
        console.error('获取分类详情失败:', error)
        ElMessage.error('获取分类详情失败')
      }
    }
    
    const handleSubmit = async () => {
      submitting.value = true
      
      try {
        const data = {
          name: form.value.name,
          description: form.value.description
        }
        
        if (isEdit.value) {
          // 更新分类
          await api.categories.update(categoryId.value, data)
          ElMessage.success('分类更新成功')
        } else {
          // 创建分类
          await api.categories.create(data)
          ElMessage.success('分类创建成功')
        }
        
        // 返回分类列表
        router.push('/admin/categories')
      } catch (error) {
        console.error(isEdit.value ? '更新分类失败:' : '创建分类失败:', error)
        ElMessage.error(isEdit.value ? '更新分类失败' : '创建分类失败')
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(async () => {
      loading.value = true
      
      try {
        if (isEdit.value) {
          await fetchCategoryDetail(categoryId.value)
        }
      } finally {
        loading.value = false
      }
    })
    
    return {
      isEdit,
      loading,
      submitting,
      form,
      handleSubmit
    }
  }
}
</script>
