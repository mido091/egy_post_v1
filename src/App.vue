<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import api from "@/api";

onMounted(async () => {
  try {
    const response = await api.get("/settings");
    const settings = response.data;

    // Load GPT (Google Publisher Tag) initialization script
    // This script should contain googletag setup and defineSlot() calls
    if (settings && settings.google_analytics) {
      const script = document.createElement("script");
      script.text = settings.google_analytics;
      script.id = "gpt-init-script";
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error("Failed to load GPT script:", error);
  }
});
</script>
