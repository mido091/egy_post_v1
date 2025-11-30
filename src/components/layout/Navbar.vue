<template>
  <nav
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <router-link to="/" class="flex-shrink-0 flex items-center gap-2">
            <img
              class="h-8 w-auto rounded-full"
              :src="
                settingsStore.currentLogo ||
                'https://upload.wikimedia.org/wikipedia/commons/2/2c/Egypt_Post_logo.svg'
              "
              :alt="settingsStore.siteName"
            />
            <span
              class="ml-2 text-base sm:text-xl font-bold text-gray-900 dark:text-white"
              >{{ settingsStore.siteName }}</span
            >
          </router-link>
          <div
            class="hidden gap-3 sm:ml-6 sm:flex sm:space-x-8 rtl:space-x-reverse"
          >
            <router-link
              to="/"
              active-class="border-primary-500 text-gray-900 dark:text-white"
              class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              {{ $t("common.home") }}
            </router-link>
            <router-link
              to="/governorates"
              active-class="border-primary-500 text-gray-900 dark:text-white"
              class="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
            >
              {{ $t("nav.governorates") }}
            </router-link>
          </div>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden sm:flex items-center gap-4">
          <!-- Theme Toggle -->
          <button
            @click="
              themeStore.setTheme(
                themeStore.theme === 'dark' ? 'light' : 'dark'
              )
            "
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none"
          >
            <SunIcon v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none font-bold"
          >
            {{ settingsStore.locale === "ar" ? "EN" : "عربي" }}
          </button>

          <!-- Auth Buttons -->
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/dashboard"
              class="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {{ $t("common.dashboard") }}
            </router-link>
            <button
              @click="handleLogout"
              class="text-sm font-medium text-red-600 hover:text-red-700"
            >
              {{ $t("common.logout") }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {{ $t("common.login") }}
            </router-link>
          </template>
        </div>

        <!-- Mobile Hamburger Menu -->
        <div class="flex sm:hidden items-center">
          <button
            @click="toggleMobileMenu"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="sm:hidden absolute top-16 left-0 right-0 bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 shadow-lg z-50 rounded-b-lg mx-4"
      >
        <div class="px-4 py-3 space-y-2">
          <!-- Home -->
          <router-link
            to="/"
            @click="closeMobileMenu"
            class="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
          >
            {{ $t("common.home") }}
          </router-link>

          <!-- Governorates -->
          <router-link
            to="/governorates"
            @click="closeMobileMenu"
            class="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
          >
            {{ $t("nav.governorates") }}
          </router-link>

          <!-- Login/Dashboard -->
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/dashboard"
              @click="closeMobileMenu"
              class="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
            >
              {{ $t("common.dashboard") }}
            </router-link>
            <button
              @click="handleMobileLogout"
              class="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-white/10 transition-colors font-medium"
            >
              {{ $t("common.logout") }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              @click="closeMobileMenu"
              class="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
            >
              {{ $t("common.login") }}
            </router-link>
          </template>

          <!-- Language Switch -->
          <button
            @click="handleMobileLanguageToggle"
            class="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium flex items-center justify-between"
          >
            <span>{{ $t("common.language") || "Language" }}</span>
            <span class="font-bold">{{
              settingsStore.locale === "ar" ? "EN" : "عربي"
            }}</span>
          </button>

          <!-- Theme Toggle -->
          <button
            @click="handleMobileThemeToggle"
            class="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-medium flex items-center justify-between"
          >
            <span>{{
              themeStore.theme === "dark" ? "Light Mode" : "Dark Mode"
            }}</span>
            <SunIcon v-if="themeStore.theme === 'dark'" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </transition>

    <!-- Google Ads Header Section -->
    <div
      v-if="settingsStore.settings.google_ads_header"
      class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div
          id="div-gpt-ad-header"
          class="ad-container header-ad flex justify-center items-center"
          v-html="settingsStore.settings.google_ads_header"
        ></div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";

const settingsStore = useSettingsStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();

const mobileMenuOpen = ref(false);

const toggleLanguage = () => {
  const newLang = settingsStore.locale === "ar" ? "en" : "ar";
  settingsStore.setLocale(newLang);
};

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleMobileLanguageToggle = () => {
  toggleLanguage();
  closeMobileMenu();
};

const handleMobileThemeToggle = () => {
  themeStore.setTheme(themeStore.theme === "dark" ? "light" : "dark");
  closeMobileMenu();
};

const handleMobileLogout = () => {
  handleLogout();
  closeMobileMenu();
};
</script>
