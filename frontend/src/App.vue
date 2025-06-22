<template>
  <div>
    <header class="bg-white shadow">
      <div class="container-custom">
        <nav class="flex items-center justify-between py-4">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-primary-600">暮影流年</router-link>
          </div>
          <div class="hidden md:flex space-x-6">
            <router-link to="/" class="text-gray-700 hover:text-primary-600">首页</router-link>
            <router-link to="/categories" class="text-gray-700 hover:text-primary-600">分类</router-link>
            <router-link to="/ranking" class="text-gray-700 hover:text-primary-600">排行榜</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <input
                type="text"
                placeholder="搜索小说..."
                class="input pr-10"
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
              />
              <button
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600"
                @click="handleSearch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-secondary-800 text-white py-8 mt-8">
      <div class="container-custom">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h3 class="text-lg font-bold mb-3">关于我们</h3>
            <p class="text-gray-300 leading-relaxed text-sm">暮影流年小说网致力于为读者提供优质的阅读体验，让您随时随地享受阅读的乐趣。我们提供丰富的小说资源，满足您的各种阅读需求。</p>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">快速导航</h3>
            <ul class="space-y-1">
              <li><router-link to="/" class="text-gray-300 hover:text-white transition-colors text-sm">首页</router-link></li>
              <li><router-link to="/categories" class="text-gray-300 hover:text-white transition-colors text-sm">分类</router-link></li>
              <li><router-link to="/ranking" class="text-gray-300 hover:text-white transition-colors text-sm">排行榜</router-link></li>
              <li><router-link to="/search" class="text-gray-300 hover:text-white transition-colors text-sm">搜索</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">帮助中心</h3>
            <ul class="space-y-1">
              <li><router-link to="/help/guide" class="text-gray-300 hover:text-white transition-colors text-sm">阅读指南</router-link></li>
              <li><router-link to="/help/faq" class="text-gray-300 hover:text-white transition-colors text-sm">常见问题</router-link></li>
              <li><router-link to="/help/feedback" class="text-gray-300 hover:text-white transition-colors text-sm">意见反馈</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">联系我们</h3>
            <ul class="space-y-1">
              <li class="flex items-center text-gray-300 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                1432261197@qq.com
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-4 border-t border-gray-700 text-center">
          <p class="text-gray-400 text-sm">© {{ new Date().getFullYear() }} 暮影流年小说网 版权所有</p>
          <p class="text-gray-500 text-xs mt-1">本站所有小说均由网友上传，仅供学习交流使用，版权归原作者所有。</p>
          <div class="mt-3 space-y-0.5">
            <p class="text-gray-500 text-xs">
              <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-gray-400 transition-colors">豫ICP备2025126633号</a>
            </p>
            <p class="text-gray-500 text-xs">
              <a href="http://www.beian.gov.cn/" target="_blank" class="hover:text-gray-400 transition-colors">公安备案号：4101050200XXX号</a>
            </p>
          </div>
          <div class="mt-4 text-gray-500 text-xs space-x-2">
            <router-link to="/statement" class="hover:text-gray-400 transition-colors">使用声明</router-link>
            <span>|</span>
            <router-link to="/copyright" class="hover:text-gray-400 transition-colors">版权声明</router-link>
            <span>|</span>
            <router-link to="/disclaimer" class="hover:text-gray-400 transition-colors">免责声明</router-link>
            <span>|</span>
            <span>联系邮箱：<a href="mailto:admin@ulbooks.cn" class="hover:text-gray-400 transition-colors">admin@ulbooks.cn</a></span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus'

export default {
  name: 'App',
  data() {
    return {
      searchKeyword: ''
    }
  },
  methods: {
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.push({ path: '/search', query: { keyword: this.searchKeyword } });
      }
    }
  },
  mounted() {
    ElMessageBox.alert(
      '网站正在测试中，如有问题请及时反馈。',
      '测试提示',
      {
        confirmButtonText: '我知道了',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        callback: () => {
          console.log('用户确认了测试提示')
        }
      }
    )
  }
}
</script>

<style>
/* 添加到已有的 style 标签中 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
