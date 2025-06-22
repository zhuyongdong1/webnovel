<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">分类管理</h3>
      <router-link to="/admin/categories/create" class="btn btn-primary">
        新增分类
      </router-link>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-6">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else>
        <el-table :data="categories" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="小说数量" width="100">
            <template #default="scope">
              {{ scope.row.novel_count || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <div class="flex space-x-2">
                <router-link :to="`/admin/categories/edit/${scope.row.id}`" class="text-green-500 hover:text-green-700">
                  编辑
                </router-link>
                <a 
                  href="#" 
                  class="text-red-500 hover:text-red-700"
                  @click.prevent="handleDelete(scope.row)"
                >
                  删除
                </a>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import api from '../../api'

export default {
  name: 'CategoryList',
  setup() {
    const loading = ref(true)
    const tableLoading = ref(false)
    const categories = ref([])
    
    const fetchCategories = async () => {
      loading.value = true
      try {
        const response = await api.categories.getAll()
        categories.value = response.data.data.categories
        
        // 获取每个分类下的小说数量
        for (const category of categories.value) {
          try {
            const novelsRes = await api.novels.getByCategory(category.id, 1, 1)
            category.novel_count = novelsRes.data.data.total
          } catch (error) {
            console.error(`获取分类 ${category.id} 的小说数量失败:`, error)
            category.novel_count = 0
          }
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
        ElMessage.error('获取分类列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleDelete = (category) => {
      if (category.novel_count > 0) {
        ElMessage.warning(`该分类下有 ${category.novel_count} 本小说，无法删除`)
        return
      }
      
      ElMessageBox.confirm(
        `确定要删除分类 "${category.name}" 吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        tableLoading.value = true
        try {
          await api.categories.delete(category.id)
          ElMessage.success('删除成功')
          fetchCategories()
        } catch (error) {
          console.error('删除分类失败:', error)
          ElMessage.error('删除分类失败')
        } finally {
          tableLoading.value = false
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    onMounted(() => {
      fetchCategories()
    })
    
    return {
      loading,
      tableLoading,
      categories,
      handleDelete
    }
  }
}
</script>
