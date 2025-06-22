<template>
  <div v-if="error" class="error-boundary">
    <h2>出错了</h2>
    <p>{{ error.message }}</p>
    <button @click="handleReset" class="btn-primary">重试</button>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      error: null
    }
  },
  errorCaptured(err) {
    this.error = err
    return false
  },
  methods: {
    handleReset() {
      this.error = null
      this.$router.go(0)
    }
  }
}
</script>

<style scoped>
.error-boundary {
  text-align: center;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-boundary h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-boundary p {
  color: #4b5563;
  margin-bottom: 1.5rem;
}
</style> 