import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/novel/:id',
    name: 'novel-detail',
    component: () => import('../views/NovelDetail.vue')
  },
  {
    path: '/read/:id',
    name: 'read',
    component: () => import('../views/ReadChapter.vue')
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/Categories.vue')
  },
  {
    path: '/category/:id',
    name: 'category',
    component: () => import('../views/CategoryNovels.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchResults.vue')
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: () => import('../views/Ranking.vue')
  },
  {
    path: '/statement',
    name: 'statement',
    component: () => import('../views/Statement.vue')
  },
  {
    path: '/copyright',
    name: 'copyright',
    component: () => import('../views/Copyright.vue')
  },
  {
    path: '/disclaimer',
    name: 'disclaimer',
    component: () => import('../views/Disclaimer.vue')
  },
  {
    path: '/help/guide',
    name: 'reading-guide',
    component: () => import('../views/ReadingGuide.vue')
  },
  {
    path: '/help/faq',
    name: 'faq',
    component: () => import('../views/FAQ.vue')
  },
  {
    path: '/help/feedback',
    name: 'feedback',
    component: () => import('../views/Feedback.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'login',
        name: 'admin-login',
        component: () => import('../views/admin/Login.vue')
      },
      {
        path: 'novels',
        name: 'admin-novels',
        component: () => import('../views/admin/NovelList.vue')
      },
      {
        path: 'novels/create',
        name: 'admin-novel-create',
        component: () => import('../views/admin/NovelForm.vue')
      },
      {
        path: 'novels/edit/:id',
        name: 'admin-novel-edit',
        component: () => import('../views/admin/NovelForm.vue')
      },
      {
        path: 'chapters/:novelId',
        name: 'admin-chapters',
        component: () => import('../views/admin/ChapterList.vue')
      },
      {
        path: 'chapters/create/:novelId',
        name: 'admin-chapter-create',
        component: () => import('../views/admin/ChapterForm.vue')
      },
      {
        path: 'chapters/edit/:id',
        name: 'admin-chapter-edit',
        component: () => import('../views/admin/ChapterForm.vue')
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('../views/admin/CategoryList.vue')
      },
      {
        path: 'categories/create',
        name: 'admin-category-create',
        component: () => import('../views/admin/CategoryForm.vue')
      },
      {
        path: 'categories/edit/:id',
        name: 'admin-category-edit',
        component: () => import('../views/admin/CategoryForm.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 需要登录才能访问的路由
const authRequiredRoutes = [
  '/user/profile',  // 用户个人中心
  '/user/favorites', // 收藏列表
  '/user/history',  // 阅读历史
  '/user/comments', // 我的评论
  '/novel/read'     // 阅读小说（限制章节数）
]

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // 如果是需要登录的路由
  if (authRequiredRoutes.some(path => to.path.startsWith(path))) {
    if (!token) {
      // 保存用户想要访问的页面
      localStorage.setItem('redirectAfterLogin', to.fullPath)
      next('/login')
      return
    }
  }
  
  next()
})

export default router
