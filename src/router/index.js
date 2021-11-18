import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '../firebase'
import VueMeta from 'vue-meta'

Vue.use(VueRouter)
Vue.use(VueMeta)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    meta: {
      title: 'Poodle Poll'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    meta: {
      title: 'Poodle Poll',
      authRequired: true,
    },
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import(/* webpackChunkName: "create" */ '../views/Create.vue'),
    meta: {
      title: 'Poodle Poll',
      authRequired: true,
    },
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.authRequired)) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        next()
      }
      else {
        next({
          path: '/',
        })
      }
    })
  }
  else {
    next()
  }
})

export default router