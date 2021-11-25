<template>
  <v-container v-if="loading">
    <v-row align="center" justify="center">
        <v-progress-circular
          class="align-center mt-4"
          size="70"
          width="7"
          indeterminate
          color="accent"
        ></v-progress-circular>
    </v-row>
  </v-container>
  <v-container v-else>
    <!-- TODO -->
    Editing poll: {{ poll }}
  </v-container>
</template>
  
<script>
import { db, auth } from "../firebase";
import { get, ref } from "firebase/database";

export default {
  name: "Edit",
  data: () => ({
    poll: {},
    loading: false,
  }),
  created() {
    this.determinePermission();
  },
  methods: {
    determinePermission() {
      (this.loading = true),
        get(ref(db, "polls/" + this.$route.params.id)).then((snapshot) => {
          if (snapshot.exists()) {
            this.poll = snapshot.val();
            if (this.poll.created_by == auth.currentUser.email) {
              this.loading = false;
            } else {
              this.$router.push("/dashboard");
            }
          } else {
            this.$router.push("/dashboard");
          }
        });
      return true;
    },
  },
  metaInfo: {
    title: "Edit",
  },
};
</script>