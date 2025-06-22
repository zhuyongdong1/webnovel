<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-lg font-medium">章节管理</h3>
      <div class="flex space-x-4">
        <router-link :to="`/admin/chapters/create/${novelId}`" class="btn btn-primary">
          新增章节
        </router-link>
        <router-link to="/admin/novels" class="btn btn-secondary">
          返回小说列表
        </router-link>
      </div>
    </div>
    
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else>
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-xl font-bold mb-2">{{ novel?.title }}</h2>
        <div class="text-gray-600">作者: {{ novel?.author }}</div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <el-table :data="chapters" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="chapter_number" label="章节序号" width="100" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="word_count" label="字数" width="100" />
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <div class="flex space-x-2">
                <router-link :to="`/admin/chapters/edit/${scope.row.id}`" class="text-green-500 hover:text-green-700">
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
      
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium mb-4">批量导入章节</h3>
        <div class="mb-4">
          <p class="text-gray-600 mb-2">批量导入格式说明:</p>
          <ul class="list-disc pl-5 text-gray-600 text-sm">
            <li>每个章节需包含标题和内容</li>
            <li>章节序号将自动按顺序生成</li>
            <li>可一次导入多个章节</li>
          </ul>
        </div>
        
        <div class="mb-4">
          <el-input
            v-model="bulkImport.chapters"
            type="textarea"
            :rows="6"
            placeholder="请输入章节数据，格式如下:
第一章 章节标题
章节内容...

第二章 章节标题
章节内容..."
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="bulkImportLoading"
            @click="handleBulkImport"
          >
            {{ bulkImportLoading ? '导入中...' : '批量导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import api from '../../api'

export default {
  name: 'ChapterList',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const novelId = computed(() => route.params.novelId)
    
    const loading = ref(true)
    const tableLoading = ref(false)
    const bulkImportLoading = ref(false)
    const novel = ref(null)
    const chapters = ref([])
    
    const bulkImport = ref({
      chapters: ''
    })
    
    const fetchNovel = async () => {
      try {
        const response = await api.novels.getById(novelId.value)
        novel.value = response.data.data.novel
      } catch (error) {
        console.error('获取小说详情失败:', error)
        ElMessage.error('获取小说详情失败')
      }
    }
    
    const fetchChapters = async () => {
      tableLoading.value = true
      try {
        const response = await api.chapters.getByNovelId(novelId.value)
        chapters.value = response.data.data.chapters
      } catch (error) {
        console.error('获取章节列表失败:', error)
        ElMessage.error('获取章节列表失败')
      } finally {
        tableLoading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
    
    const handleDelete = (chapter) => {
      ElMessageBox.confirm(
        `确定要删除章节 "${chapter.title}" 吗？此操作不可恢复。`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        tableLoading.value = true
        try {
          await api.chapters.delete(chapter.id)
          ElMessage.success('删除成功')
          fetchChapters()
        } catch (error) {
          console.error('删除章节失败:', error)
          ElMessage.error('删除章节失败')
        } finally {
          tableLoading.value = false
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    const handleBulkImport = async () => {
      if (!bulkImport.value.chapters.trim()) {
        ElMessage.warning('请输入章节数据')
        return
      }
      
      bulkImportLoading.value = true
      
      try {
        // 解析章节数据
        const content = bulkImport.value.chapters
        const chapterRegex = /第.+?章.+?\n/g
        const chapterTitles = content.match(chapterRegex) || []
        
        if (chapterTitles.length === 0) {
          ElMessage.error('未找到有效的章节标题，请检查格式')
          return
        }
        
        const chaptersToImport = []
        
        for (let i = 0; i < chapterTitles.length; i++) {
          const currentTitle = chapterTitles[i].trim()
          const nextTitle = chapterTitles[i + 1]
          
          // 获取当前章节的内容
          const startIndex = content.indexOf(currentTitle) + currentTitle.length
          const endIndex = nextTitle ? content.indexOf(nextTitle) : content.length
          const chapterContent = content.substring(startIndex, endIndex).trim()
          
          chaptersToImport.push({
            title: currentTitle,
            content: chapterContent
          })
        }
        
        // 发送批量导入请求
        await api.chapters.bulkImport({
          novel_id: novelId.value,
          chapters: chaptersToImport
        })
        
        ElMessage.success('批量导入成功')
        bulkImport.value.chapters = ''
        fetchChapters()
      } catch (error) {
        console.error('批量导入章节失败:', error)
        ElMessage.error('批量导入章节失败')
      } finally {
        bulkImportLoading.value = false
      }
    }
    
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([fetchNovel(), fetchChapters()])
      } finally {
        loading.value = false
      }
    })
    
    return {
      novelId,
      loading,
      tableLoading,
      bulkImportLoading,
      novel,
      chapters,
      bulkImport,
      formatDate,
      handleDelete,
      handleBulkImport
    }
  }
}
</script>
