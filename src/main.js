import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  // Paste here
}

// Initialize Firebase
initializeApp(firebaseConfig)

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
