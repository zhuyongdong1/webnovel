<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">小说管理</h3>
      <router-link to="/admin/novels/create" class="btn btn-primary">
        新增小说
      </router-link>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-6">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else>
        <el-table :data="novels" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="封面" width="100">
            <template #default="scope">
              <img 
                :src="scope.row.cover_image ? scope.row.cover_image : '/placeholder-cover.jpg'" 
                :alt="scope.row.title"
                class="w-16 h-20 object-cover rounded"
              >
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="author" label="作者" width="150" />
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'">
                {{ scope.row.status === 0 ? '连载中' : '已完结' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分类" width="150">
            <template #default="scope">
              <div class="flex flex-wrap gap-1">
                <el-tag 
                  v-for="category in scope.row.categories" 
                  :key="category.id"
                  size="small"
                  type="info"
                >
                  {{ category.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <div class="flex space-x-2">
                <router-link :to="`/admin/chapters/${scope.row.id}`" class="text-blue-500 hover:text-blue-700">
                  章节管理
                </router-link>
                <router-link :to="`/admin/novels/edit/${scope.row.id}`" class="text-green-500 hover:text-green-700">
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
        
        <div class="p-4 flex justify-center" v-if="totalPages > 1">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAdminStore } from '../../store/admin'

export default {
  name: 'NovelList',
  setup() {
    const adminStore = useAdminStore()
    
    const loading = ref(true)
    const tableLoading = ref(false)
    const novels = ref([])
    const totalNovels = ref(0)
    const totalPages = ref(0)
    const currentPage = ref(1)
    
    const fetchNovels = async (page = 1) => {
      if (page === 1) {
        loading.value = true
      } else {
        tableLoading.value = true
      }
      
      try {
        await adminStore.fetchNovels(page)
        novels.value = adminStore.novels
        totalNovels.value = adminStore.totalNovels
        totalPages.value = adminStore.totalPages
        currentPage.value = adminStore.currentPage
      } catch (error) {
        console.error('获取小说列表失败:', error)
      } finally {
        loading.value = false
        tableLoading.value = false
      }
    }
    
    const handlePageChange = (page) => {
      fetchNovels(page)
    }
    
    const handleDelete = (novel) => {
      ElMessageBox.confirm(
        `确定要删除小说 "${novel.title}" 吗？此操作将同时删除该小说的所有章节，且不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        tableLoading.value = true
        try {
          const success = await adminStore.deleteNovel(novel.id)
          if (success) {
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
            // 重新加载当前页数据
            fetchNovels(currentPage.value)
          } else {
            throw new Error(adminStore.error || '删除失败')
          }
        } catch (error) {
          ElMessage({
            type: 'error',
            message: error.message || '删除失败'
          })
        } finally {
          tableLoading.value = false
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    onMounted(() => {
      fetchNovels()
    })
    
    return {
      loading,
      tableLoading,
      novels,
      totalNovels,
      totalPages,
      currentPage,
      handlePageChange,
      handleDelete
    }
  }
}
</script>
