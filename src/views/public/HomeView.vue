<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from "@heroicons/vue/24/outline";
import api from "@/api";
import publicApi from "@/api/public";
import { normalizeText, fuzzyMatch } from "@/utils/textNormalize";
import { useSettingsStore } from "@/stores/settings";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();
const searchQuery = ref("");
const governorates = ref({});
const loading = ref(true);
const totalOffices = ref(0);

// About section
const aboutLoading = ref(false);
const aboutContent = ref("");

const fallbackContentAr = computed(
  () => `${settingsStore.settings.site_name} 
تطبيق ويب سريع وبسيط يسهل خدمات البريد المصري من خلال واجهة سهلة الاستخدام تستطيع من خلالها استخدام جميع خدمات هيئة البريد المصري الالكترونية، يهدف موقع الى حصر جميع مكاتب بريد فى محافظات مصر في جميع المناطق وتوفير جميع بيانات كل مكتب بريد.`
);

const fallbackContentEn = computed(
  () => `${settingsStore.settings.site_name_en}
A fast and simple web application that facilitates Egyptian Post services through an easy-to-use interface through which you can use all the electronic services of the Egyptian Post Authority.`
);

const displayAboutContent = computed(() => {
  if (aboutContent.value) {
    return aboutContent.value;
  }
  return locale.value === "ar"
    ? fallbackContentAr.value
    : fallbackContentEn.value;
});

const fetchAboutContent = async () => {
  aboutLoading.value = true;
  try {
    const response = await publicApi.getAbout();
    let data = response.data;

    if (data.success && data.data) {
      data = data.data;
    }

    if (Array.isArray(data)) {
      const aboutEntry = data.find((item) => item.key_name === "about_us");
      if (aboutEntry && aboutEntry.content) {
        aboutContent.value = aboutEntry.content;
      }
    } else if (data.content) {
      aboutContent.value = data.content;
    }
  } catch (error) {
    console.error("Failed to fetch about content:", error);
  } finally {
    aboutLoading.value = false;
  }
};

const fetchGovernorates = async () => {
  try {
    loading.value = true;

    const response = await api.get("/posts");
    const data = response.data;

    // IMPORTANT: fix reactivity issue
    governorates.value = { ...data };

    totalOffices.value = Object.values(governorates.value).reduce(
      (sum, list) => sum + list.length,
      0
    );

    console.log("Loaded Govs:", governorates.value);
  } catch (error) {
    console.error("Failed to fetch governorates:", error);
  } finally {
    loading.value = false;
  }
};

const filteredGovs = computed(() => {
  if (!searchQuery.value) return governorates.value;

  const query = normalizeText(searchQuery.value);
  const filtered = {};

  Object.entries(governorates.value).forEach(([govName, offices]) => {
    const govMatch = fuzzyMatch(govName, query);
    const nameMatch = normalizeText(govName).includes(query);

    if (govMatch || nameMatch) {
      filtered[govName] = offices;
    }
  });

  return filtered;
});

// Hero title text
const heroTitle = computed(() => {
  return locale.value === "ar"
    ? "ابحث عن المحافظات أو المكاتب..."
    : "Search for governorates or offices...";
});

onMounted(() => {
  fetchGovernorates();
  fetchAboutContent();
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-grow">
      <!-- Hero -->
      <section
        class="bg-[url('/src/assets/homePage.jpg')] bg-cover bg-center text-white py-20 px-4 text-center relative overflow-hidden z-10"
      >
        <transition
          appear
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-3 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <div
            class="inline-block px-8 py-6 rounded-2xl backdrop-blur-xs bg-white/5 dark:bg-black/10 shadow-lg relative z-30 w-fit mx-auto"
          >
            <!-- background pattern -->
            <div
              class="absolute inset-0 bg-pattern opacity-10 z-0 rounded-2xl"
            ></div>

            <h1
              class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 relative z-20 px-4"
            >
              {{ heroTitle }}
            </h1>

            <!-- Search -->
            <div class="max-w-2xl mx-auto relative z-20">
              <div class="relative wave-ripple-container">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('common.search_placeholder')"
                  class="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-400 shadow-md text-lg relative z-30 bg-white"
                />
                <button
                  class="absolute right-2 rtl:right-auto rtl:left-2 top-2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors z-30"
                >
                  <MagnifyingGlassIcon class="h-6 w-6" />
                </button>
              </div>
            </div>

            <!-- Stats -->
            <div
              class="mt-12 grid grid-cols-2 gap-8 max-w-lg mx-auto relative z-20"
            >
              <div
                class="bg-white/10 backdrop-blur-xs rounded-lg p-4 shadow-sm"
              >
                <div class="text-3xl font-bold">{{ totalOffices }}</div>
                <div class="text-primary-100">
                  {{ t("dashboard.total_offices") }}
                </div>
              </div>
              <div
                class="bg-white/10 backdrop-blur-xs rounded-lg p-4 shadow-sm"
              >
                <div class="text-3xl font-bold">
                  {{ Object.keys(governorates).length }}
                </div>
                <div class="text-primary-100">
                  {{ t("dashboard.total_govs") }}
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- About khibrz Section -->
      <section class="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2
              class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {{
                t("about.section_title", { siteName: settingsStore.siteName })
              }}
            </h2>
          </div>

          <!-- Content Card -->
          <div
            class="bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md p-8 mb-8"
          >
            <div
              v-if="aboutLoading"
              class="flex justify-center items-center py-12"
            >
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
              ></div>
            </div>

            <div v-else class="prose dark:prose-invert max-w-none">
              <div
                class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base"
                v-html="displayAboutContent"
              ></div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <router-link
              to="/about-us"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200 shadow-md"
            >
              {{ t("nav.about_us") }}
            </router-link>
            <router-link
              to="/disclaimer"
              class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200 shadow-md"
            >
              {{ t("nav.disclaimer") }}
            </router-link>
            <router-link
              to="/terms"
              class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200 shadow-md"
            >
              {{ t("nav.terms") }}
            </router-link>
            <router-link
              to="/contact-us"
              class="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200 shadow-md"
            >
              {{ t("nav.contact") }}
            </router-link>
          </div>
        </div>
      </section>

      <!-- Governorates List -->
      <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2
          class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
        >
          {{ t("common.governorates") }}
        </h2>

        <div v-if="loading" class="flex justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          ></div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <router-link
            v-for="(offices, govName, index) in filteredGovs"
            :key="govName"
            :to="{ name: 'governorate', params: { code: govName } }"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div
              class="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-gray-600 transition-colors"
            >
              <img
                :src="`/public/${index + 1}.jpg`"
                :alt="govName"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ govName }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ offices.length }} {{ t("dashboard.total_offices") }}
              </p>
            </div>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>
<style scoped>
.bg-pattern {
  background-image: radial-gradient(#ffffff 1px, transparent 1px);
  background-size: 20px 20px;
}

.wave-ripple-container::before,
.wave-ripple-container::after {
  content: "";
  position: absolute;
  inset: -8px;
  border-radius: 9999px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  z-index: 0;
  pointer-events: none;
}

.wave-ripple-container::before {
  animation: wave-ripple 3s ease-out infinite;
}

.wave-ripple-container::after {
  animation: wave-ripple 3s ease-out infinite 1.5s;
}

@media (prefers-color-scheme: dark) {
  .wave-ripple-container::before,
  .wave-ripple-container::after {
    border-color: rgba(96, 165, 250, 0.3);
  }
}

@keyframes wave-ripple {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
</style>
