<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="admin-sidebar">
      <div class="p-4 border-b border-secondary-700">
        <h1 class="text-xl font-bold text-white">小说阅读网</h1>
        <p class="text-sm text-gray-400">管理后台</p>
      </div>
      
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <router-link 
              to="/admin" 
              class="block px-4 py-2 rounded-md text-gray-300 hover:bg-secondary-700 hover:text-white"
              exact-active-class="bg-secondary-700 text-white"
            >
              仪表盘
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/novels" 
              class="block px-4 py-2 rounded-md text-gray-300 hover:bg-secondary-700 hover:text-white"
              active-class="bg-secondary-700 text-white"
            >
              小说管理
            </router-link>
          </li>
          <li>
            <router-link 
              to="/admin/categories" 
              class="block px-4 py-2 rounded-md text-gray-300 hover:bg-secondary-700 hover:text-white"
              active-class="bg-secondary-700 text-white"
            >
              分类管理
            </router-link>
          </li>
          <li class="pt-4 mt-4 border-t border-secondary-700">
            <a 
              href="#" 
              class="block px-4 py-2 rounded-md text-gray-300 hover:bg-secondary-700 hover:text-white"
              @click.prevent="handleLogout"
            >
              退出登录
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- 主内容区 -->
    <div class="admin-content">
      <header class="bg-white shadow-sm">
        <div class="px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
          <div v-if="admin" class="text-sm text-gray-600">
            欢迎, {{ admin.username }}
          </div>
        </div>
      </header>
      
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '../../store/admin'

export default {
  name: 'AdminLayout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const adminStore = useAdminStore()
    
    const admin = computed(() => adminStore.admin)
    
    const pageTitle = computed(() => {
      switch (route.name) {
        case 'admin-dashboard':
          return '仪表盘'
        case 'admin-novels':
          return '小说管理'
        case 'admin-novel-create':
          return '新增小说'
        case 'admin-novel-edit':
          return '编辑小说'
        case 'admin-chapters':
          return '章节管理'
        case 'admin-chapter-create':
          return '新增章节'
        case 'admin-chapter-edit':
          return '编辑章节'
        case 'admin-categories':
          return '分类管理'
        case 'admin-category-create':
          return '新增分类'
        case 'admin-category-edit':
          return '编辑分类'
        default:
          return '管理后台'
      }
    })
    
    const handleLogout = () => {
      adminStore.logout()
      router.push({ name: 'admin-login' })
    }
    
    // 检查登录状态
    onMounted(() => {
      if (!adminStore.isAuthenticated) {
        router.push({ name: 'admin-login' })
        return
      }
      
      // 获取管理员信息
      adminStore.fetchAdminProfile()
    })
    
    // 监听认证状态变化
    watch(() => adminStore.isAuthenticated, (isAuthenticated) => {
      if (!isAuthenticated && route.name !== 'admin-login') {
        router.push({ name: 'admin-login' })
      }
    })
    
    return {
      admin,
      pageTitle,
      handleLogout
    }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
}

.admin-sidebar {
  width: 250px;
  background-color: #1e293b;
  color: white;
  flex-shrink: 0;
}

.admin-content {
  flex-grow: 1;
  overflow: auto;
}
</style>
