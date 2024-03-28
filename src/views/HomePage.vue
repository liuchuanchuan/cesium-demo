<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routes } from '@/router'
</script>

<template>
  <div class="p-8">
    Cesium demo link:
    <menu>
      <li v-for="item in routes" :key="item.path">
        <router-link :to="item.path">
          {{ item.name }}
        </router-link>
      </li>
    </menu>
  </div>
</template>