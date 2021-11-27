<template>
  <v-container v-if="loading">
    <v-skeleton-loader class="ma-4" type="article, actions"></v-skeleton-loader>
  </v-container>
  <v-container v-else>
    <v-card class="ma-4" elevation="8">
      <v-list-item three-line>
        {{ poll }}
      </v-list-item>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="$router.push('/dashboard')" outlined color="secondary">
          Cancel
        </v-btn>
        <v-btn @click="$router.push('/dashboard')" color="secondary">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
  
<script>
import { db, auth } from "../firebase"
import { get, ref } from "firebase/database"

export default {
  name: "Edit",
  data: () => ({
    poll: {},
    loading: false,
  }),
  created() {
    this.determinePermission()
  },
  methods: {
    determinePermission() {
      this.loading = true
      get(ref(db, "polls/" + this.$route.params.id)).then((snapshot) => {
        if (snapshot.exists()) {
          this.poll = snapshot.val()
          if (this.poll.created_by == auth.currentUser.email) {
            this.loading = false
          } else {
            this.$router.push("/dashboard")
          }
        } else {
          this.$router.push("/dashboard")
        }
      })
      return true
    },
  },
  metaInfo: {
    title: "Edit",
  },
}
</script>