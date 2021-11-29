<template>
  <v-container v-if="loading">
    <v-skeleton-loader class="ma-4" type="article, actions"></v-skeleton-loader>
  </v-container>
  <v-container v-else>
    <v-card class="ma-4" elevation="8">
      <v-card-title class="primary">
        {{ poll.title }}
      </v-card-title>
      <v-list-item-content>
        <v-list-item v-if="poll.description.replace(/\s/g, '').length">
          <v-list-item-icon>
            <v-icon class="pa-2">mdi-comment-text</v-icon>
          </v-list-item-icon>
          <div class="clamp-text">{{ poll.description }}</div></v-list-item
        >
      </v-list-item-content>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="$router.push('/dashboard')" color="secondary">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
  
<script>
import { db } from "../firebase";
import { get, ref } from "firebase/database";

export default {
  name: "Edit",
  data: () => ({
    poll: {},
    loading: false,
  }),
  created() {
    this.getPoll();
  },
  methods: {
    getPoll() {
      this.loading = true;
      get(ref(db, "polls/" + this.$route.params.id)).then((snapshot) => {
        if (snapshot.exists()) {
          this.poll = snapshot.val();
          this.loading = false;
        } else {
          this.$router.push("/dashboard");
        }
      });
      return true;
    },
  },
  metaInfo: {
    title: "Take Poll",
  },
};
</script>