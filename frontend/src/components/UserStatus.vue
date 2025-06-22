<template>
  <div class="user-status">
    <template v-if="isLoggedIn">
      <div class="flex items-center space-x-4">
        <img 
          :src="user.avatar || '/default-avatar.png'" 
          :alt="user.nickname"
          class="w-8 h-8 rounded-full"
        />
        <div class="text-sm">
          <div class="font-medium">{{ user.nickname }}</div>
          <div class="text-gray-500 text-xs">已登录</div>
        </div>
        <button 
          @click="handleLogout"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          退出
        </button>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center space-x-4">
        <button 
          @click="router.push('/login')"
          class="text-sm text-indigo-600 hover:text-indigo-800"
        >
          登录/注册
        </button>
        <span class="text-sm text-gray-500">解锁更多功能</span>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'UserStatus',
  setup() {
    const router = useRouter()
    const isLoggedIn = ref(false)
    const user = ref({})

    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      isLoggedIn.value = !!token
      if (userData) {
        user.value = JSON.parse(userData)
      }
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      isLoggedIn.value = false
      user.value = {}
      router.push('/')
    }

    onMounted(() => {
      checkLoginStatus()
    })

    return {
      isLoggedIn,
      user,
      router,
      handleLogout
    }
  }
}
</script> 