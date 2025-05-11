<template>
  <div class="flex flex-col h-full bg-slate-950 text-white p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Messages</h2>
      <button @click="$emit('close')" class="text-sm text-red-400 hover:text-red-200">Close</button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 mb-4">
      <div v-if="loading" class="text-gray-400">Loading messages...</div>
      <div v-else-if="messages.length === 0" class="text-gray-400">No messages found.</div>
      <div v-else v-for="msg in messages" :key="msg.id" class="bg-slate-800 p-3 rounded-lg">
        <div class="text-sm text-gray-400">{{ msg.sender }}</div>
        <div class="text-base">{{ msg.content }}</div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input v-model="newMessage" type="text" placeholder="Type a message..."
             class="flex-1 p-2 rounded bg-slate-700 text-white outline-none" />
      <button type="submit" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">Send</button>
    </form>
  </div>
</template>

<script setup>
const myPhoneNumber = '4201234567'

import { ref, onMounted } from 'vue'
import axios from 'axios'

const messages = ref([])
const loading = ref(true)
const newMessage = ref('')

async function fetchMessages() {
  try {
    const response = await axios.get('http://localhost:3001/messages', {
      params: { to: myPhoneNumber }
    })
    messages.value = response.data
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  if (newMessage.value.trim() === '') return

    const message = {
    id: Date.now(),
    from: myPhoneNumber,
    to: myPhoneNumber,
    content: newMessage.value.trim()
    }
  try {
    await axios.post('http://localhost:3001/messages', message)
    newMessage.value = ''
    fetchMessages()
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

onMounted(fetchMessages)
</script>
