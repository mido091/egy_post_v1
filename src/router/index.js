import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/DefaultLayout.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/views/public/HomeView.vue"),
        },
        {
          path: "gov/:code",
          name: "governorate",
          component: () => import("@/views/public/GovernorateView.vue"),
        },
        {
          path: "office/:id",
          name: "office-details",
          component: () => import("@/views/public/OfficeDetailsView.vue"),
        },
        {
          path: "governorates",
          name: "governorates-list",
          component: () => import("@/views/public/GovernoratesListView.vue"),
        },
        {
          path: "about-us",
          name: "about-us",
          component: () => import("@/views/public/AboutUs.vue"),
        },
        {
          path: "disclaimer",
          name: "disclaimer",
          component: () => import("@/views/public/Disclaimer.vue"),
        },
        {
          path: "terms",
          name: "terms",
          component: () => import("@/views/public/Terms.vue"),
        },
        {
          path: "contact-us",
          name: "contact-us",
          component: () => import("@/views/public/ContactUs.vue"),
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/auth/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/dashboard",
      component: () => import("@/layouts/AdminLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard-home",
          component: () => import("@/views/dashboard/DashboardHome.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/views/dashboard/UsersView.vue"),
          meta: { roles: ["owner"] },
        },
        {
          path: "posts",
          name: "posts",
          component: () => import("@/views/dashboard/PostsView.vue"),
          meta: { roles: ["owner", "admin"] },
        },
        {
          path: "social",
          name: "social",
          component: () => import("@/views/dashboard/SocialView.vue"),
          meta: { roles: ["owner"] },
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/dashboard/SettingsView.vue"),
          meta: { roles: ["owner"] },
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("@/views/dashboard/Analytics.vue"),
          meta: { roles: ["owner"] },
        },
        {
          path: "profile",
          name: "owner-profile",
          component: () => import("@/views/dashboard/OwnerProfile.vue"),
          meta: { roles: ["owner"] },
        },
      ],
    },
    // 404 Route
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/public/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Ensure store is initialized
  if (!authStore.token) {
    authStore.init();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.meta.guest && isAuthenticated) {
    next("/dashboard");
  } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // If user is authenticated but doesn't have the role, redirect to dashboard home
    // If they are already at dashboard home (which shouldn't happen if configured correctly), stay there
    if (to.path !== "/dashboard") {
      next("/dashboard");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
