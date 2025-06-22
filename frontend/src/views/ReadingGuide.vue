<template>
  <div class="container-custom py-8">
    <h1 class="text-2xl font-bold mb-6">阅读指南</h1>
    <div class="prose prose-base lg:prose-lg mx-auto">
      <p>欢迎来到暮影流年小说网！</p>

      <ul>
        <li>所有小说均可免费在线阅读，无需注册</li>
        <li>点击首页推荐/分类/搜索可快速找到感兴趣的作品</li>
        <li>小说详情页支持查看章节目录，点击章节即可开始阅读</li>
        <li>阅读过程中可使用目录切换章节，进度自动记录</li>
      </ul>

      <p>如有其他疑问，请前往“<router-link to="/help/faq">常见问题</router-link>”或“<router-link to="/help/feedback">意见反馈</router-link>”页面。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReadingGuide',
}
</script>

<style scoped>
/* 页面特定样式 */
</style> 