<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/outline";
import { getMostVisitedGovernorates } from "@/utils/randomSelection";
import { translateGovernorate } from "@/utils/governorates";
import api from "@/api";
import publicApi from "@/api/public";
import { normalizeText, fuzzyMatch } from "@/utils/textNormalize";
import { useSettingsStore } from "@/stores/settings";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();
const router = useRouter();
const searchQuery = ref("");
const governorates = ref({});
const loading = ref(true);
const totalOffices = ref(0);
const showSuggestions = ref(false);
const searchInputRef = ref(null);
const mostVisitedGovs = ref([]);

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

    mostVisitedGovs.value = getMostVisitedGovernorates(governorates.value);
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

const filteredSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return [];

  const query = normalizeText(searchQuery.value);
  const suggestions = [];

  Object.entries(governorates.value).forEach(([govName, offices]) => {
    // 1. Check Governorate Name
    // For governorates, we use the translation utility which handles locale
    const translatedGovName = translateGovernorate(govName, locale.value);
    const govMatch =
      fuzzyMatch(translatedGovName, query) ||
      normalizeText(translatedGovName).includes(query);

    if (govMatch) {
      const firstOffice = offices[0];
      suggestions.push({
        name: govName,
        name_ar: firstOffice?.gov_name_ar || govName,
        name_en: firstOffice?.gov_name_en || govName,
        count: offices.length,
        code: govName,
        type: "governorate",
      });
    }

    // 2. Check Offices inside this Governorate
    offices.forEach((office) => {
      const name =
        locale.value === "en"
          ? office.name_en || office.name
          : office.name_ar || office.name;

      // Note: We don't have address in the suggestion object currently, but we filter by it?
      // The original code didn't filter by address for suggestions, only name and postal code.
      // Wait, let me check the original code again.
      // Original: const officeMatch = fuzzyMatch(officeName, query) || normalizeText(officeName).includes(query);
      // It only checked officeName.

      const postalCode = office.postal_code
        ? office.postal_code.toString()
        : "";

      const officeMatch =
        fuzzyMatch(name, query) || normalizeText(name).includes(query);
      const codeMatch = postalCode.includes(query);

      if (officeMatch || codeMatch) {
        suggestions.push({
          name: office.name, // Keep original name for ID/reference
          name_ar: office.name_ar || office.name,
          name_en: office.name_en || office.name,
          count: postalCode, // Show postal code for offices
          code: office._id || office.id,
          type: "office",
          gov_name: govName,
          gov_name_ar: office.gov_name_ar || govName,
          gov_name_en: office.gov_name_en || govName,
        });
      }
    });
  });

  return suggestions.slice(0, 8); // Limit to 8 suggestions
});

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.name;
  showSuggestions.value = false;

  if (suggestion.type === "office") {
    router.push({ name: "office-details", params: { id: suggestion.code } });
  } else {
    router.push({ name: "governorate", params: { code: suggestion.code } });
  }
};

const handleSearchFocus = () => {
  if (searchQuery.value && filteredSuggestions.value.length > 0) {
    showSuggestions.value = true;
  }
};

const handleSearchInput = () => {
  if (searchQuery.value && filteredSuggestions.value.length > 0) {
    showSuggestions.value = true;
  } else {
    showSuggestions.value = false;
  }
};

const handleClickOutside = (event) => {
  if (searchInputRef.value && !searchInputRef.value.contains(event.target)) {
    showSuggestions.value = false;
  }
};

// Hero title text
const heroTitle = computed(() => {
  return locale.value === "ar"
    ? "ابحث عن المحافظات أو المكاتب..."
    : "Search for governorates or offices...";
});

// Static Most Visited Offices - Bilingual data (no API, no translation needed)
const staticMostVisitedOffices = [
  {
    id: 1,
    name_ar: "الأفضل",
    name_en: "Al-Afdal Office",
    gov_ar: "القاهرة",
    gov_en: "Cairo",
  },
  {
    id: 2,
    name_ar: "الحي الثاني - هليوبوليس",
    name_en: "Second District - Heliopolis",
    gov_ar: "القاهرة",
    gov_en: "Cairo",
  },
  {
    id: 3,
    name_ar: "بانوراما أكتوبر",
    name_en: "Panorama October",
    gov_ar: "القاهرة",
    gov_en: "Cairo",
  },
  {
    id: 4,
    name_ar: "القطامية",
    name_en: "Katameya",
    gov_ar: "القاهرة",
    gov_en: "Cairo",
  },
  {
    id: 5,
    name_ar: "أبو رواش",
    name_en: "Abu Rawash",
    gov_ar: "الجيزة",
    gov_en: "Giza",
  },
  {
    id: 6,
    name_ar: "وحدة مرور حدائق الأهرام",
    name_en: "Hadayek Al-Ahram Traffic Office",
    gov_ar: "الجيزة",
    gov_en: "Giza",
  },
];

// Computed property to get office name based on current locale
const displayedOffices = computed(() => {
  return staticMostVisitedOffices.map((office) => ({
    id: office.id,
    name: locale.value === "ar" ? office.name_ar : office.name_en,
    governorate: locale.value === "ar" ? office.gov_ar : office.gov_en,
  }));
});

onMounted(() => {
  fetchGovernorates();
  fetchAboutContent();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-grow">
      <!-- Hero -->
      <section
        class="bg-[url('/src/assets/homePage.png')] bg-cover bg-center text-white py-20 px-4 text-center relative overflow-hidden z-10"
      >
        <transition
          appear
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-3 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
        >
          <div
            class="inline-block px-8 py-6 rounded-2xl bg-white/5 dark:bg-black/10 shadow-lg relative z-30 w-fit mx-auto"
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
            <div class="max-w-2xl mx-auto relative z-50" ref="searchInputRef">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('common.search_placeholder')"
                  :class="[
                    'w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-400 shadow-md relative z-10 bg-white text-base md:text-lg',
                    locale === 'en'
                      ? 'placeholder:text-sm md:placeholder:text-lg'
                      : '',
                  ]"
                  @input="handleSearchInput"
                  @focus="handleSearchFocus"
                />
                <button
                  class="absolute right-2 rtl:right-auto rtl:left-2 top-2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors z-20"
                >
                  <MagnifyingGlassIcon class="h-6 w-6" />
                </button>

                <!-- Autocomplete Dropdown -->
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 translate-y-2 scale-95"
                  enter-to-class="opacity-100 translate-y-0 scale-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0 scale-100"
                  leave-to-class="opacity-0 translate-y-2 scale-95"
                >
                  <div
                    v-if="showSuggestions && filteredSuggestions.length > 0"
                    class="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden z-50 max-h-96 overflow-y-auto ring-1 ring-black/5 dark:ring-white/5"
                  >
                    <div class="py-2">
                      <div
                        v-for="suggestion in filteredSuggestions"
                        :key="suggestion.code"
                        @click="selectSuggestion(suggestion)"
                        class="px-4 py-3 mx-2 my-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ease-out flex items-center justify-between group"
                      >
                        <div class="flex items-center gap-4">
                          <div
                            class="p-2.5 rounded-full bg-primary-50 dark:bg-gray-700/80 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500 dark:group-hover:text-white transition-all duration-300 shadow-sm"
                          >
                            <BuildingOfficeIcon class="h-5 w-5" />
                          </div>
                          <div class="flex flex-col items-start">
                            <span
                              class="text-gray-900 dark:text-white font-semibold text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200"
                            >
                              {{
                                suggestion.type === "governorate"
                                  ? translateGovernorate(
                                      suggestion.name,
                                      locale
                                    )
                                  : locale === "ar"
                                  ? suggestion.name_ar || suggestion.name
                                  : suggestion.name_en || suggestion.name
                              }}
                            </span>
                            <span
                              class="text-xs text-gray-500 dark:text-gray-400 font-medium"
                            >
                              {{
                                suggestion.type === "office"
                                  ? translateGovernorate(
                                      suggestion.gov_name,
                                      locale
                                    )
                                  : t("common.governorate")
                              }}
                            </span>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <span
                            class="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:bg-primary-50 group-hover:text-primary-700 dark:group-hover:bg-gray-600 dark:group-hover:text-primary-300 transition-colors duration-200"
                          >
                            {{ suggestion.count }}
                            {{
                              suggestion.type === "office"
                                ? ""
                                : t("dashboard.total_offices")
                            }}
                          </span>
                          <svg
                            class="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Stats -->
            <div
              class="mt-12 grid grid-cols-2 gap-8 max-w-lg mx-auto relative z-20"
            >
              <div class="bg-white/10 rounded-lg p-4 shadow-sm">
                <div class="text-3xl font-bold">{{ totalOffices }}</div>
                <div class="text-primary-100">
                  {{ t("dashboard.total_offices") }}
                </div>
              </div>
              <div class="bg-white/10 rounded-lg p-4 shadow-sm">
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
              class="h-32 bg-white dark:bg-white flex items-center justify-center group-hover:bg-white dark:group-hover:bg-white transition-colors"
            >
              <img
                :src="`/${index + 1}.jpg`"
                :alt="govName"
                class="w-full h-full object-contain p-4"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ translateGovernorate(govName, locale) }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ offices.length }} {{ t("dashboard.total_offices") }}
              </p>
            </div>
          </router-link>
        </div>
      </section>
      <!-- Most Visited Section -->
      <section
        class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        v-if="!loading && mostVisitedGovs.length > 0"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Most Visited Governorates -->
          <div>
            <h2
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <span
                class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              >
                <MapPinIcon class="h-6 w-6" />
              </span>
              {{ t("home.mostVisitedGovernorates") }}
            </h2>
            <div class="grid gap-4">
              <router-link
                v-for="govName in mostVisitedGovs"
                :key="govName"
                :to="{ name: 'governorate', params: { code: govName } }"
                class="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 dark:group-hover:bg-gray-600 dark:group-hover:text-primary-400 transition-colors"
                  >
                    <MapPinIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">
                      {{ translateGovernorate(govName, locale) }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ governorates[govName]?.length || 0 }}
                      {{ t("dashboard.total_offices") }}
                    </p>
                  </div>
                </div>
                <div
                  class="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
                >
                  <ArrowRightIcon v-if="locale === 'en'" class="h-5 w-5" />
                  <ArrowLeftIcon v-else class="h-5 w-5" />
                </div>
              </router-link>
            </div>
          </div>

          <!-- Most Visited Offices -->
          <div>
            <h2
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"
            >
              <span
                class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              >
                <BuildingOfficeIcon class="h-6 w-6" />
              </span>
              {{ t("home.mostVisitedOffices") }}
            </h2>
            <div class="grid gap-4">
              <router-link
                v-for="office in displayedOffices"
                :key="`${office.id}-${locale}`"
                :to="{
                  name: 'office-details',
                  params: { id: office.id },
                }"
                class="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="h-12 w-12 rounded-lg bg-primary-50 dark:bg-gray-700 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500 dark:group-hover:text-white transition-colors"
                  >
                    <BuildingOfficeIcon class="h-6 w-6" />
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">
                      {{ office.name }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ office.governorate }}
                    </p>
                  </div>
                </div>
                <div
                  class="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
                >
                  <ArrowRightIcon v-if="locale === 'en'" class="h-5 w-5" />
                  <ArrowLeftIcon v-else class="h-5 w-5" />
                </div>
              </router-link>
            </div>
          </div>
        </div>
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
