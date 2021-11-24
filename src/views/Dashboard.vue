<template>
  <v-container>
    <template v-if="loading">
      <v-skeleton-loader
        class="ma-4"
        type="article, actions"
      ></v-skeleton-loader>
    </template>
    <div v-if="none">
      <v-banner outlined rounded elevation="24">
        <v-avatar slot="icon" color="secondary" size="40">
          <v-icon>mdi-card-bulleted-off</v-icon>
        </v-avatar>
        <div class="text-h6">
          Welcome! It looks like you haven't created any Poodles yet.
        </div>
        Get started by pressing the floating yellow button in the bottom right
        corner or the button to the right.
        <template v-slot:actions>
          <v-btn text color="secondary" @click="$router.push('/create')">
            Create
          </v-btn>
        </template>
      </v-banner>
    </div>
    <template v-id="polls.length" v-for="(poll, index) in polls">
      <v-card class="ma-4" :key="index" elevation="8">
        <v-list-item three-line>
          <v-list-item-content>
            <v-list-item-title class="text-h4 mb-1">{{
              poll.title
            }}</v-list-item-title>
            <v-list-item
              ><v-icon class="pa-2">mdi-map-marker</v-icon
              >{{ poll.location }}</v-list-item
            >
            <v-list-item
              ><v-icon class="pa-2">mdi-timer-sand-complete</v-icon>Closes at
              {{ getClosesAt(poll.closes_at, poll.timezone) }}</v-list-item
            >
            <v-list-item
              ><v-icon class="pa-2">mdi-clipboard-text-clock</v-icon>From
              1/1/2021 5:50 PM CTD to 1/5/2021 5:50 PM CTD</v-list-item
            >
          </v-list-item-content>
        </v-list-item>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn outlined color="secondary"> Remind Poodlers </v-btn>
          <v-btn color="secondary"> Edit Poodle </v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <v-fab-transition>
      <v-btn
        fab
        @click="$router.push('/create')"
        x-large
        fixed
        right
        bottom
        elevation="24"
        color="accent"
        class="ma-4"
      >
        <v-icon large color="grey darken-4">mdi-table-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
import { db, auth } from "../firebase"
import { get, ref, query, orderByChild, equalTo } from "firebase/database"

export default {
  name: "Dashboard",
  data: () => ({
    polls: [],
    loading: false,
    none: false,
  }),
  created() {
    this.getPolls()
  },
  methods: {
    getPolls() {
      this.loading = true
      get(
        query(
          ref(db, "polls"),
          orderByChild("created_by"),
          equalTo(auth.currentUser.email)
        )
      ).then((snapshot) => {
        if (snapshot.exists()) {
          this.polls = snapshot.val()
          this.loading = false
          this.none = false
        } else {
          this.loading = false
          this.polls = []
          this.none = true
        }
      })
    },
    getClosesAt(str, tzn) {
      var date = new Date(str)
      var hours = date.getHours()
      var minutes = date.getMinutes()
      var ampm = hours >= 12 ? "PM" : "AM"
      hours = hours % 12
      hours = hours ? hours : 12
      minutes = minutes < 10 ? "0" + minutes : minutes
      var strTime = hours + ":" + minutes + " " + ampm
      var dateStr =
        (date.getMonth() + 1).toString() +
        "/" +
        date.getDate().toString() +
        "/" +
        date.getFullYear().toString()
      return strTime + " " + tzn + " on " + dateStr
    },
  },
  metaInfo: {
    title: "Dashboard",
  },
}
</script>