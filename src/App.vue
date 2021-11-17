<template>
  <v-app id='inspire'>
    <v-app-bar app class='primary'>
       <v-img
        class="mx-2"
        src="./assets/french-poodle.png"
        max-height="40"
        max-width="40"
        contain
      ></v-img>
      <v-toolbar-title>Poodle Poll</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if='isSignedIn'
        class='secondary'
        @click="logout"
      >Logout</v-btn>
    </v-app-bar>
    <v-main class='ma-4'><router-view /></v-main>
    <toast ref="toast"/>
  </v-app>
</template>

<script>
import toast from './components/Toast.vue'
import { signOut, getAuth } from 'firebase/auth'

export default {
  components:{
    toast
  },
  mounted() {
    this.$root.toast = this.$refs.toast
  },
  methods: {
    logout() {
      signOut().then(() => {
        this.$router.push('/')
      })
      .catch(error => {
        alert(error.message)
        this.$router.push('/')
      })
    },
  },
  data: () => ({
    isSignedIn: getAuth().currentUser,
  })
}
</script>