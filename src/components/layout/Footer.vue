<template>
  <footer
    class="bg-gray-900 dark:bg-gray-950 border-t border-gray-800 dark:border-gray-900 mt-auto"
  >
    <!-- Google Ads Footer Section -->
    <div
      v-if="settingsStore.settings.google_ads_footer"
      class="border-b border-gray-800 dark:border-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div
          id="div-gpt-ad-footer"
          class="ad-container footer-ad flex justify-center items-center"
          v-html="settingsStore.settings.google_ads_footer"
        ></div>
      </div>
    </div>

    <div class="w-full py-6 px-4 sm:px-6 lg:px-8">
      <!-- Navigation Links -->
      <div class="mb-4">
        <nav class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <router-link
            to="/about-us"
            class="text-white/80 hover:text-white text-sm font-medium hover:underline decoration-2 underline-offset-4 transition-all duration-300 ease-in-out"
          >
            {{ t("nav.about_us") }}
          </router-link>
          <span class="text-white/30">•</span>
          <router-link
            to="/disclaimer"
            class="text-white/80 hover:text-white text-sm font-medium hover:underline decoration-2 underline-offset-4 transition-all duration-300 ease-in-out"
          >
            {{ t("nav.disclaimer") }}
          </router-link>
          <span class="text-white/30">•</span>
          <router-link
            to="/terms"
            class="text-white/80 hover:text-white text-sm font-medium hover:underline decoration-2 underline-offset-4 transition-all duration-300 ease-in-out"
          >
            {{ t("nav.terms") }}
          </router-link>
          <span class="text-white/30">•</span>
          <router-link
            to="/contact-us"
            class="text-white/80 hover:text-white text-sm font-medium hover:underline decoration-2 underline-offset-4 transition-all duration-300 ease-in-out"
          >
            {{ t("nav.contact") }}
          </router-link>
        </nav>
      </div>

      <!-- Copyright Section -->
      <div class="flex items-center justify-center">
        <div class="text-center">
          <p class="text-sm text-white/60 font-light tracking-wide">
            {{ footerText }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import publicApi from "@/api/public";

const { locale, t } = useI18n();
const settingsStore = useSettingsStore();

const footerData = ref({
  title_ar: "",
  title_en: "",
});

const footerText = computed(() => {
  // If custom footer text exists, use it
  if (locale.value === "ar" && footerData.value.title_ar) {
    return footerData.value.title_ar;
  }
  if (locale.value === "en" && footerData.value.title_en) {
    return footerData.value.title_en;
  }

  // Fallback to default format with translated site name
  const year = new Date().getFullYear();
  const siteName =
    settingsStore.siteName ||
    (locale.value === "ar" ? "اسم الموقع" : "Site Name");

  return t("common.copyright", { siteName });
});

const fetchFooterData = async () => {
  try {
    const response = await publicApi.getFooter();
    if (response.data && response.data.data) {
      footerData.value = {
        title_ar: response.data.data.title_ar || "",
        title_en: response.data.data.title_en || "",
      };
    }
  } catch (error) {
    // Footer doesn't exist (404) or other error - use fallback
    console.log("Footer not found, using fallback");
  }
};

onMounted(() => {
  fetchFooterData();
});
</script>
