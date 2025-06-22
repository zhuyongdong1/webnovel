<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600">小说阅读网</h1>
        <p class="text-gray-600 mt-2">管理员登录</p>
      </div>
      
      <div v-if="error" class="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-6">
          <label for="username" class="block text-gray-700 mb-2">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="mb-8">
          <label for="password" class="block text-gray-700 mb-2">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../store/admin'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const adminStore = useAdminStore()
    
    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')
    
    const handleLogin = async () => {
      if (!username.value || !password.value) {
        error.value = '请输入用户名和密码'
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        const success = await adminStore.login({
          username: username.value,
          password: password.value
        })
        
        if (success) {
          router.push({ name: 'admin-dashboard' })
        } else {
          error.value = adminStore.error || '登录失败，请检查用户名和密码'
        }
      } catch (err) {
        error.value = '登录失败，请稍后再试'
        console.error('登录错误:', err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      username,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script>
