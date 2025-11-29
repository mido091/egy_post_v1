<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <h1
        class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
      >
        {{ $t("posts.title") }}
      </h1>
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative w-full md:w-64">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('common.search')"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <BaseButton @click="openModal()">
          <template #default>
            <span class="mr-2">+</span> {{ $t("posts.add_post") }}
          </template>
        </BaseButton>
      </div>
    </div>

    <BaseCard>
      <BaseTable :headers="headers" :items="filteredPosts" :loading="loading">
        <template #actions="{ item }">
          <div class="flex justify-end space-x-2 rtl:space-x-reverse">
            <BaseButton
              size="sm"
              variant="secondary"
              @click="openModal(item)"
              >{{ $t("common.edit") }}</BaseButton
            >
            <BaseButton
              size="sm"
              variant="danger"
              @click="confirmDelete(item)"
              >{{ $t("common.delete") }}</BaseButton
            >
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Add/Edit Office Modal -->
    <BaseModal
      :isOpen="isModalOpen"
      :title="editingPost ? $t('posts.edit_post') : $t('posts.add_post')"
      @close="closeModal"
      @confirm="savePost"
      size="large"
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-5">
          <!-- Governorate Dropdown - FIX #3 -->
          <div>
            <label
              class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2"
            >
              {{ $t("posts.governorate") }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.gov_code"
              class="block w-full h-12 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-base transition-colors"
            >
              <option value="" disabled>
                {{ $t("posts.select_governorate") }}
              </option>
              <option
                v-for="gov in governorates"
                :key="gov.code"
                :value="gov.code"
              >
                {{ gov.name }}
              </option>
            </select>
          </div>

          <BaseInput v-model="form.name" :label="$t('posts.name')" required />
          <BaseInput
            v-model="form.address"
            :label="$t('posts.address')"
            required
          />
          <BaseInput v-model="form.postal_code" label="Postal Code" />
          <BaseInput v-model="form.phone1" label="Phone 1" />
          <BaseInput v-model="form.phone2" label="Phone 2" />

          <!-- X/Y Coordinates -->
          <div class="grid grid-cols-2 gap-4">
            <BaseInput
              v-model="form.x"
              label="X Coordinate"
              type="number"
              step="any"
            />
            <BaseInput
              v-model="form.y"
              label="Y Coordinate"
              type="number"
              step="any"
            />
          </div>
        </div>

        <!-- Map Preview -->
        <div
          class="h-[400px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative"
        >
          <LeafletMap
            v-if="form.x && form.y"
            :x="parseFloat(form.x)"
            :y="parseFloat(form.y)"
            :readonly="false"
            @location-selected="updateLocation"
          />
          <div
            v-else
            class="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            Click on map to set location
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :isOpen="isDeleteModalOpen"
      :title="$t('common.delete')"
      @close="closeDeleteModal"
      @confirm="handleDelete"
    >
      <p class="text-gray-600 dark:text-gray-300">
        {{
          $t("posts.delete_confirm", {
            name:
              $i18n.locale === "en"
                ? postToDelete?.name_en || postToDelete?.name
                : postToDelete?.name_ar || postToDelete?.name,
          })
        }}
      </p>
      <template #footer>
        <BaseButton variant="danger" @click="handleDelete">{{
          $t("common.delete")
        }}</BaseButton>
        <BaseButton variant="secondary" @click="closeDeleteModal">{{
          $t("common.cancel")
        }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import adminApi from "@/api/admin";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseTable from "@/components/ui/BaseTable.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import LeafletMap from "@/components/map/LeafletMap.vue";
import { useUiStore } from "@/stores/ui";

const { t } = useI18n();
const uiStore = useUiStore();
const posts = ref([]);
const loading = ref(false);
const searchQuery = ref("");

const filteredPosts = computed(() => {
  if (!searchQuery.value) return posts.value;
  const query = searchQuery.value.toLowerCase();
  return posts.value.filter((post) => {
    const name = post.name ? post.name.toLowerCase() : "";
    const nameEn = post.name_en ? post.name_en.toLowerCase() : "";
    const postalCode = post.postal_code ? post.postal_code.toString() : "";
    return (
      name.includes(query) ||
      nameEn.includes(query) ||
      postalCode.includes(query)
    );
  });
});

// FIX #3: Governorate dropdown with codes and names
const governorates = [
  { code: "01", name: "القاهرة" },
  { code: "02", name: "الجيزة" },
  { code: "03", name: "الإسكندرية" },
  { code: "04", name: "الدقهلية" },
  { code: "05", name: "البحر الأحمر" },
  { code: "06", name: "البحيرة" },
  { code: "07", name: "الفيوم" },
  { code: "08", name: "الغربية" },
  { code: "09", name: "الإسماعيلية" },
  { code: "11", name: "المنوفية" },
  { code: "12", name: "المنيا" },
  { code: "13", name: "القليوبية" },
  { code: "14", name: "الوادي الجديد" },
  { code: "15", name: "السويس" },
  { code: "16", name: "أسوان" },
  { code: "17", name: "أسيوط" },
  { code: "18", name: "بني سويف" },
  { code: "19", name: "بورسعيد" },
  { code: "21", name: "دمياط" },
  { code: "22", name: "الشرقية" },
  { code: "23", name: "جنوب سيناء" },
  { code: "24", name: "كفر الشيخ" },
  { code: "25", name: "مطروح" },
  { code: "26", name: "الأقصر" },
  { code: "27", name: "قنا" },
  { code: "28", name: "شمال سيناء" },
  { code: "29", name: "سوهاج" },
];

const { locale } = useI18n();

const headers = computed(() => [
  {
    key: locale.value === "en" ? "name_en" : "name",
    label: t("posts.name"),
  },
  { key: "gov_code", label: t("posts.governorate") },
  {
    key: locale.value === "en" ? "address_en" : "address",
    label: t("posts.address"),
  },
  { key: "postal_code", label: "Postal Code" },
]);

// Modal State
const isModalOpen = ref(false);
const editingPost = ref(null);

// FIX #1 & #2: Removed id and map_link fields
const form = ref({
  gov_code: "",
  name: "",
  address: "",
  postal_code: "",
  phone1: "",
  phone2: "",
  x: "",
  y: "",
});

// Delete State
const isDeleteModalOpen = ref(false);
const postToDelete = ref(null);

// FIX #4: Extract data array from response
const fetchPosts = async () => {
  loading.value = true;
  try {
    const res = await adminApi.getPosts();
    // Handle both formats: direct array or grouped object
    if (Array.isArray(res.data)) {
      posts.value = res.data;
    } else if (res.data.data) {
      // If response is { success: true, data: [...] }
      posts.value = Array.isArray(res.data.data)
        ? res.data.data
        : Object.values(res.data.data).flat();
    } else {
      // If response is grouped object { "Cairo": [...], "Alex": [...] }
      posts.value = Object.values(res.data).flat();
    }
  } catch (error) {
    uiStore.showToast(t("common.error"), "error");
  } finally {
    loading.value = false;
  }
};

const openModal = (post = null) => {
  editingPost.value = post;
  if (post) {
    form.value = {
      gov_code: post.gov_code || "",
      name: post.name || "",
      address: post.address || "",
      postal_code: post.postal_code || "",
      phone1: post.phone1 || "",
      phone2: post.phone2 || "",
      x: post.x || "",
      y: post.y || "",
    };
  } else {
    form.value = {
      gov_code: "",
      name: "",
      address: "",
      postal_code: "",
      phone1: "",
      phone2: "",
      x: "",
      y: "",
    };
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingPost.value = null;
};

const updateLocation = ({ lat, lng }) => {
  form.value.y = lat;
  form.value.x = lng;
};

// FIX #1: Send exact backend format with null for empty fields
const savePost = async () => {
  if (!form.value.gov_code || !form.value.name || !form.value.address) {
    uiStore.showToast(t("common.required"), "error");
    return;
  }

  uiStore.setLoading(true);
  try {
    // FIX #1: Exact backend format - send null for empty fields
    const payload = {
      gov_code: form.value.gov_code || null,
      name: form.value.name || null,
      address: form.value.address || null,
      postal_code: form.value.postal_code || null,
      phone1: form.value.phone1 || null,
      phone2: form.value.phone2 || null,
      x: form.value.x ? parseFloat(form.value.x) : null,
      y: form.value.y ? parseFloat(form.value.y) : null,
    };

    if (editingPost.value) {
      await adminApi.updatePost(
        editingPost.value._id || editingPost.value.id,
        payload
      );
      uiStore.showToast(t("posts.office_updated"), "success");
    } else {
      await adminApi.createPost(payload);
      uiStore.showToast(t("posts.office_created"), "success");
    }
    closeModal();
    fetchPosts();
  } catch (error) {
    uiStore.showToast(
      error.response?.data?.message || t("common.error"),
      "error"
    );
  } finally {
    uiStore.setLoading(false);
  }
};

const confirmDelete = (post) => {
  postToDelete.value = post;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  postToDelete.value = null;
};

const handleDelete = async () => {
  if (!postToDelete.value) return;

  uiStore.setLoading(true);
  try {
    await adminApi.deletePost(postToDelete.value._id || postToDelete.value.id);
    uiStore.showToast(t("posts.office_deleted"), "success");
    closeDeleteModal();
    fetchPosts();
  } catch (error) {
    uiStore.showToast(t("common.error"), "error");
  } finally {
    uiStore.setLoading(false);
  }
};

onMounted(() => {
  fetchPosts();
});
</script>
