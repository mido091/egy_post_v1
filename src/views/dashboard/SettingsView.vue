<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
      {{ $t("settings.title") }}
    </h1>

    <!-- General Settings Form -->
    <div class="space-y-6 animate-fade-in">
      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- General Info Card -->
        <BaseCard :title="$t('settings.general')">
          <div
            class="flex flex-row gap-4 justify-between items-center flex-wrap"
          >
            <BaseInput
              v-model="settingsForm.site_name"
              :label="$t('settings.site_name')"
              required
            />
            <BaseInput
              v-model="settingsForm.site_name_en"
              :label="$t('settings.site_name_en')"
              required
            />
            <BaseButton @click="saveSettings">
              {{ $t("common.save") }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Integrations Card (Google) -->
        <BaseCard :title="'Google Integrations'">
          <div class="space-y-6">
            <div>
              <label
                class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
              >
                {{ $t("settings.google_ads_header") }}
              </label>
              <textarea
                v-model="settingsForm.google_ads_header"
                rows="4"
                class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors font-mono text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
              >
                {{ $t("settings.google_ads_footer") }}
              </label>
              <textarea
                v-model="settingsForm.google_ads_footer"
                rows="4"
                class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors font-mono text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
              >
                GPT Script (Google Publisher Tag)
              </label>
              <textarea
                v-model="settingsForm.google_analytics"
                rows="6"
                class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors font-mono text-sm"
                placeholder="<script async src='https://securepubads.g.doublecdn.net/tag/js/gpt.js'></script>
<script>
  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    // Define your ad slots here
  });
</script>"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add your Google Publisher Tag initialization script here. This
                will be loaded in the &lt;head&gt; section.
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Save Button -->
        <div class="flex justify-end">
          <BaseButton type="submit" :loading="uiStore.loading">
            {{ $t("common.save") }}
          </BaseButton>
        </div>
      </form>

      <!-- Appearance & Language Card -->
      <BaseCard :title="$t('settings.general') + ' - ' + $t('nav.settings')">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Language -->
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3"
            >
              {{ $t("settings.default_language") }}
            </label>
            <select
              v-model="settingsForm.default_language"
              @change="updateLanguage"
              class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors py-2 px-3"
            >
              <option value="ar">{{ $t("settings.languages.ar") }}</option>
              <option value="en">{{ $t("settings.languages.en") }}</option>
            </select>
          </div>

          <!-- Dark Mode -->
          <div
            class="flex items-center justify-between md:justify-start md:space-x-8 rtl:space-x-reverse"
          >
            <label class="text-sm font-bold text-gray-700 dark:text-gray-200">
              {{ $t("settings.dark_mode") }}
            </label>
            <button
              @click="toggleDarkMode"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              :class="
                settingsForm.dark_mode
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              "
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="
                  settingsForm.dark_mode
                    ? 'translate-x-5 rtl:-translate-x-5'
                    : 'translate-x-0'
                "
              />
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- Footer Settings (Owner Only) -->
      <BaseCard v-if="isOwner" :title="'Footer Settings'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
            >
              Footer Text (English)
            </label>
            <input
              v-model="footerForm.footer_en"
              type="text"
              class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors py-2 px-3"
              placeholder="© 2025 - Site Name"
            />
          </div>
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
            >
              Footer Text (Arabic)
            </label>
            <input
              v-model="footerForm.footer_ar"
              type="text"
              class="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors py-2 px-3 text-right"
              dir="rtl"
              placeholder="© 2025 - اسم الموقع"
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <BaseButton @click="saveFooter" :loading="savingFooter" type="button">
            Save Footer
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Logo Settings -->
      <BaseCard :title="$t('settings.logo')">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Light Logo -->
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3"
            >
              {{ $t("settings.upload_light") }}
            </label>
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                class="h-24 w-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 p-2"
              >
                <img
                  v-if="settingsForm.logo"
                  :src="settingsForm.logo"
                  alt="Light Logo"
                  class="max-h-full max-w-full object-contain"
                />
                <span v-else class="text-gray-400 text-xs text-center"
                  >No Logo</span
                >
              </div>
              <input
                type="file"
                @change="(e) => handleLogoUpload(e, 'light')"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
              />
            </div>
          </div>

          <!-- Dark Logo -->
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3"
            >
              {{ $t("settings.upload_dark") }}
            </label>
            <div class="flex items-center space-x-4 rtl:space-x-reverse">
              <div
                class="h-24 w-24 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-700 p-2"
              >
                <img
                  v-if="settingsForm.logo_dark"
                  :src="settingsForm.logo_dark"
                  alt="Dark Logo"
                  class="max-h-full max-w-full object-contain"
                />
                <span v-else class="text-gray-500 text-xs text-center"
                  >No Logo</span
                >
              </div>
              <input
                type="file"
                @change="(e) => handleLogoUpload(e, 'dark')"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
              />
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import adminApi from "@/api/admin";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import { useUiStore } from "@/stores/ui";
import { useThemeStore } from "@/stores/theme";
import { useSettingsStore } from "@/stores/settings";

const { t, locale } = useI18n();
const uiStore = useUiStore();
const themeStore = useThemeStore();
const settingsStore = useSettingsStore();

// Import auth store for owner check
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();

// Check if user is owner
const isOwner = ref(false);
watch(
  () => authStore.user,
  (newUser) => {
    isOwner.value =
      newUser && newUser.role && newUser.role.toLowerCase() === "owner";
  },
  { immediate: true }
);

// General Settings State
const settingsForm = ref({
  site_name: "",
  site_name_en: "",
  default_language: "ar",
  dark_mode: false,
  google_ads_header: "",
  google_ads_footer: "",
  google_analytics: "",
  logo: "",
  logo_dark: "",
});

// Footer Settings State
const footerForm = ref({
  footer_ar: "",
  footer_en: "",
});

const footerExists = ref(false);
const savingFooter = ref(false);

// Watch for language changes to update UI immediately
watch(
  () => settingsForm.value.default_language,
  (newLang) => {
    if (newLang && newLang !== locale.value) {
      locale.value = newLang;
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    }
  }
);

// Fetch Data
const fetchData = async () => {
  uiStore.setLoading(true);
  try {
    // Settings
    const settingsRes = await adminApi.getSettings();
    if (settingsRes.data && settingsRes.data.data) {
      settingsForm.value = { ...settingsForm.value, ...settingsRes.data.data };
    } else if (settingsRes.data) {
      settingsForm.value = { ...settingsForm.value, ...settingsRes.data };
    }

    // Ensure boolean for dark_mode
    settingsForm.value.dark_mode = !!settingsForm.value.dark_mode;

    // Sync local state with fetched settings
    if (settingsForm.value.default_language) {
      locale.value = settingsForm.value.default_language;
      document.documentElement.dir =
        settingsForm.value.default_language === "ar" ? "rtl" : "ltr";
    }

    // Fetch footer data if user is owner
    if (isOwner.value) {
      try {
        const footerResponse = await adminApi.getFooter();
        // Response format: { title_ar: "...", title_en: "..." }
        if (footerResponse.data) {
          footerForm.value.footer_ar = footerResponse.data.title_ar || "";
          footerForm.value.footer_en = footerResponse.data.title_en || "";
        }
      } catch (footerError) {
        console.log("Footer fetch error:", footerError);
      }
    }
  } catch (error) {
    console.error("Failed to load data", error);
    uiStore.showToast(t("common.error"), "error");
  } finally {
    uiStore.setLoading(false);
  }
};

// Actions
const saveSettings = async () => {
  uiStore.setLoading(true);
  try {
    await adminApi.updateSettings(settingsForm.value);
    await settingsStore.refreshSettings(); // Trigger global update

    uiStore.showToast(t("common.success"), "success");
    // No need to call fetchData() again if refreshSettings updates the store,
    // but we might want to keep local form in sync.
    // Actually, let's re-fetch to be safe and consistent.
    await fetchData();
  } catch (error) {
    console.error(error);
    uiStore.showToast(t("common.error"), "error");
  } finally {
    uiStore.setLoading(false);
  }
};

const updateLanguage = async () => {
  try {
    await adminApi.updateLanguage(settingsForm.value.default_language);
    await settingsStore.refreshSettings(); // Trigger global update
    uiStore.showToast(t("common.success"), "success");
  } catch (error) {
    uiStore.showToast(t("common.error"), "error");
  }
};

const toggleDarkMode = async () => {
  const newMode = !settingsForm.value.dark_mode;
  settingsForm.value.dark_mode = newMode;

  try {
    await adminApi.toggleDarkMode(newMode);
    await settingsStore.refreshSettings(); // Trigger global update
    uiStore.showToast(t("common.success"), "success");
  } catch (error) {
    settingsForm.value.dark_mode = !newMode;
    uiStore.showToast(t("common.error"), "error");
  }
};

const handleLogoUpload = async (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("logo", file);

  uiStore.setLoading(true);
  try {
    let res;
    if (type === "light") {
      res = await adminApi.uploadLogo(formData);
    } else {
      res = await adminApi.uploadLogoDark(formData);
    }

    uiStore.showToast(t("common.success"), "success");

    const data = res.data;
    if (type === "light" && data.logo) {
      settingsForm.value.logo = data.logo;
    } else if (type === "dark" && data.logo_dark) {
      settingsForm.value.logo_dark = data.logo_dark;
    }

    await settingsStore.refreshSettings(); // Trigger global update
  } catch (error) {
    console.error(error);
    uiStore.showToast(t("common.error"), "error");
  } finally {
    uiStore.setLoading(false);
  }
};

const saveFooter = async () => {
  if (!isOwner.value) {
    uiStore.showToast("Only owners can modify footer settings", "error");
    return;
  }

  savingFooter.value = true;
  try {
    // Always update existing footer (ID 1)
    await adminApi.updateFooter({
      title_ar: footerForm.value.footer_ar,
      title_en: footerForm.value.footer_en,
    });

    uiStore.showToast(t("common.success"), "success");
  } catch (error) {
    console.error("Failed to save footer:", error);
    uiStore.showToast(t("common.error"), "error");
  } finally {
    savingFooter.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
