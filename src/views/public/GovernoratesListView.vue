<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
import { normalizeText, fuzzyMatch } from "@/utils/textNormalize";

const { t, locale } = useI18n();
const router = useRouter();

// Data
const governorates = ref({});
const loading = ref(true);
const searchQuery = ref("");
const showSuggestions = ref(false);
const searchInputRef = ref(null);
const mostVisitedGovs = ref([]);

// Static Most Visited Offices
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

const displayedOffices = computed(() => {
  return staticMostVisitedOffices.map((office) => ({
    id: office.id,
    name: locale.value === "ar" ? office.name_ar : office.name_en,
    governorate: locale.value === "ar" ? office.gov_ar : office.gov_en,
  }));
});

// Fetch governorates
const fetchGovernorates = async () => {
  try {
    loading.value = true;
    const response = await api.get("/posts");
    governorates.value = { ...response.data };
    mostVisitedGovs.value = getMostVisitedGovernorates(governorates.value);
  } catch (error) {
    console.error("Failed to fetch governorates:", error);
  } finally {
    loading.value = false;
  }
};

// Filtered governorates based on search
const filteredGovernorates = computed(() => {
  if (!searchQuery.value.trim()) {
    return Object.keys(governorates.value);
  }

  const query = normalizeText(searchQuery.value);

  return Object.keys(governorates.value).filter((govName) => {
    const translatedName = translateGovernorate(govName, locale.value);

    // Check fuzzy match on translated name (primary)
    const fuzzy = fuzzyMatch(translatedName, query);

    // Check exact/partial match on translated name
    const nameMatch = normalizeText(translatedName).includes(query);

    // Check exact/partial match on original Arabic name (fallback)
    const arabicMatch = normalizeText(govName).includes(query);

    return fuzzy || nameMatch || arabicMatch;
  });
});

// Suggestions for dropdown
const filteredSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return [];

  const query = normalizeText(searchQuery.value);
  const suggestions = [];

  Object.entries(governorates.value).forEach(([govName, offices]) => {
    const translatedName = translateGovernorate(govName, locale.value);

    // Check fuzzy match on translated name (primary)
    const fuzzy = fuzzyMatch(translatedName, query);

    // Check exact/partial match on translated name
    const nameMatch = normalizeText(translatedName).includes(query);

    // Check exact/partial match on original Arabic name (fallback)
    const arabicMatch = normalizeText(govName).includes(query);

    if (fuzzy || nameMatch || arabicMatch) {
      suggestions.push({
        name: govName,
        count: offices.length,
        code: govName,
      });
    }
  });

  return suggestions;
});

const selectSuggestion = (suggestion) => {
  searchQuery.value = translateGovernorate(suggestion.name, locale.value);
  showSuggestions.value = false;
  router.push({ name: "governorate", params: { code: suggestion.code } });
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

onMounted(() => {
  fetchGovernorates();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Description Section -->
    <section
      class="bg-white dark:bg-gray-800 py-12 border-b border-gray-200 dark:border-gray-700"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center"
      >
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t("governoratesPage.title") }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          {{ t("governoratesPage.description") }}
        </p>
      </div>
    </section>

    <!-- Search and Governorates List -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Search Input -->
        <div class="mb-8">
          <div class="relative max-w-xl" ref="searchInputRef">
            <div
              class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-3 rtl:pl-0 rtl:pr-3 pointer-events-none z-10"
            >
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('governoratesPage.searchPlaceholder')"
              class="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent relative z-10"
              @input="handleSearchInput"
              @focus="handleSearchFocus"
            />

            <!-- Dropdown Suggestions -->
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
                class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto ring-1 ring-black/5 dark:ring-white/5"
              >
                <div class="py-2">
                  <div
                    v-for="suggestion in filteredSuggestions"
                    :key="suggestion.code"
                    @click="selectSuggestion(suggestion)"
                    class="px-4 py-3 mx-2 my-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-150 flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="p-2 rounded-lg bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500 dark:group-hover:text-white transition-colors"
                      >
                        <MapPinIcon class="h-5 w-5" />
                      </div>
                      <span
                        class="text-gray-900 dark:text-white font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                      >
                        {{ translateGovernorate(suggestion.name, locale) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {{ suggestion.count }}
                        {{ t("dashboard.total_offices") }}
                      </span>
                      <ArrowRightIcon
                        v-if="locale === 'en'"
                        class="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors"
                      />
                      <ArrowLeftIcon
                        v-else
                        class="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          ></div>
        </div>

        <!-- Governorates Grid -->
        <div
          v-else-if="filteredGovernorates.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <router-link
            v-for="govName in filteredGovernorates"
            :key="govName"
            :to="{ name: 'governorate', params: { code: govName } }"
            class="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                  >
                    <MapPinIcon class="h-6 w-6" />
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ translateGovernorate(govName, locale) }}
                  </h3>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {{
                    t("governoratesPage.officeCount", {
                      count: governorates[govName]?.length || 0,
                    })
                  }}
                </p>
                <div
                  class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium"
                >
                  <span>{{ t("governoratesPage.viewDetails") }}</span>
                  <ArrowRightIcon
                    v-if="locale === 'en'"
                    class="h-4 w-4 group-hover:translate-x-1 transition-transform"
                  />
                  <ArrowLeftIcon
                    v-else
                    class="h-4 w-4 group-hover:-translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <!-- No Results -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400 text-lg">
            {{ t("governoratesPage.noResults") }}
          </p>
        </div>
      </div>
    </section>

    <!-- Most Visited Sections -->
    <section
      class="bg-white dark:bg-gray-800 py-16 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                class="group bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 dark:group-hover:bg-gray-500 dark:group-hover:text-primary-400 transition-colors"
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
                  class="text-gray-300 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
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
                class="group bg-gray-50 dark:bg-gray-700 p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="h-12 w-12 rounded-lg bg-primary-50 dark:bg-gray-600 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500 dark:group-hover:text-white transition-colors"
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
                  class="text-gray-300 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all"
                >
                  <ArrowRightIcon v-if="locale === 'en'" class="h-5 w-5" />
                  <ArrowLeftIcon v-else class="h-5 w-5" />
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
