<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录/注册
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="phone" class="sr-only">手机号</label>
            <input
              id="phone"
              v-model="phone"
              name="phone"
              type="tel"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="请输入手机号"
            />
          </div>
          <div class="flex">
            <input
              v-model="code"
              name="code"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="请输入验证码"
            />
            <button
              type="button"
              @click="sendCode"
              :disabled="countdown > 0"
              class="ml-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {{ loading ? '处理中...' : '登录/注册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const phone = ref('')
    const code = ref('')
    const loading = ref(false)
    const countdown = ref(0)

    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    const sendCode = async () => {
      if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        alert('请输入正确的手机号')
        return
      }

      try {
        await axios.post('/api/auth/send-code', {
          phone: phone.value,
          type: 2 // 登录验证码
        })
        startCountdown()
        alert('验证码已发送')
      } catch (error) {
        alert(error.response?.data?.message || '发送验证码失败')
      }
    }

    const handleSubmit = async () => {
      if (!phone.value || !code.value) {
        alert('请填写完整信息')
        return
      }

      loading.value = true
      try {
        const response = await axios.post('/api/auth/login', {
          phone: phone.value,
          code: code.value
        })

        // 保存token和用户信息
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // 获取之前保存的跳转路径，如果没有则跳转到首页
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/'
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } catch (error) {
        alert(error.response?.data?.message || '登录失败')
      } finally {
        loading.value = false
      }
    }

    return {
      phone,
      code,
      loading,
      countdown,
      sendCode,
      handleSubmit
    }
  }
}
</script> 