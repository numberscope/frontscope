<template>
  <svg
    class="boxing box-corner"
    fill="none"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      :d="`M 0 ${height / 2} h ${width / 2} v ${-height / 2}`"
      stroke="currentColor"
      :stroke-width="strokeWidth"
    />
  </svg>
</template>

<script setup>
defineProps({
  height: {
    default: 32,
    type: Number,
  },
  strokeWidth: {
    default: 2,
    type: Number,
  },
  width: {
    default: 32,
    type: Number,
  },
});
</script>

<style scoped>
svg {
  vertical-align: middle;
}
</style>
