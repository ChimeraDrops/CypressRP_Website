<template>
  <div class="w-[300px] h-[600px] rounded-[2rem] bg-black shadow-2xl border-[10px] border-gray-800 relative flex flex-col overflow-hidden">
    <div class="h-6 bg-gray-900 rounded-b-xl mx-auto mt-1 w-24"></div>

    <div v-if="activeApp === null" class="flex-1 grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-slate-800 to-gray-900 text-white">
      <div v-for="app in apps" :key="app.name"
           @click="openApp(app.name)"
           class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
        <div class="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-xl">
          <span>{{ app.icon }}</span>
        </div>
        <span class="text-xs mt-1">{{ app.name }}</span>
      </div>
    </div>

    <MessagesApp v-if="activeApp === 'Messages'" @close="activeApp = null" />

    <div class="h-12 flex items-center justify-center">
      <div class="w-20 h-2.5 bg-gray-600 rounded-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessagesApp from './MessagesApp.vue'

const activeApp = ref(null)

const apps = [
  { name: 'Messages', icon: '💬' },
  { name: 'Contacts', icon: '📇' },
  { name: 'Email', icon: '📧' },
  { name: 'Camera', icon: '📷' },
  { name: 'Photos', icon: '🖼️' },
  { name: 'Settings', icon: '⚙️' }
]

function openApp(name) {
  activeApp.value = name
}
</script>
