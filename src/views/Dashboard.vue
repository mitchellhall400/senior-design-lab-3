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
        <v-card-title class="primary">
          {{ poll.title }}
        </v-card-title>
        <v-list-item v-if="poll.description.replace(/\s/g, '').length"
          ><v-icon class="pa-2">mdi-comment-text</v-icon>
          <div class="clamp-text">{{ poll.description }}</div></v-list-item
        >
        <v-list-item v-if="poll.location.replace(/\s/g, '').length"
          ><v-icon class="pa-2">mdi-map-marker</v-icon
          >{{ poll.location }}</v-list-item
        >
        <v-list-item
          ><v-icon class="pa-2">mdi-calendar-collapse-horizontal</v-icon>Polling
          from {{ poll.window_date_start }} to
          {{ poll.window_date_end }}</v-list-item
        >
        <v-list-item v-if="poll.close_date.replace(/\s/g, '').length"
          ><v-icon class="pa-2">mdi-calendar-end</v-icon> Poll closes on
          {{ poll.close_date }} at
          {{ getTmz24Time(poll.close_time, poll.timezone) }}
        </v-list-item>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="poll.published"
            icon
            color="secondary"
            @click="openPoll(index)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="poll.published"
            icon
            color="secondary"
            @click="copyText(index)"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
          <v-dialog v-model="dialog[index]" width="500">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="secondary" v-bind="attrs" v-on="on">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="error">
                Deletion warning!
              </v-card-title>
              <v-card-text class="pt-4">
                You are about to delete your "{{ poll.title }}" Poodle.
                <br><br>
                Once you have deleted a Poodle it cannot be recovered. Are you sure you want to delete this Poodle?
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" outlined @click="dialog[index] = false">
                  Cancel
                </v-btn>
                <v-btn color="error" @click="deletePoll(index)">
                  Confirm Deletion
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn
            v-if="poll.published"
            @click="
              sendEmails(index, poll.poodlers, poll.title, poll.description)
            "
            outlined
            color="secondary"
            >Remind All</v-btn
          >
          <v-btn
            v-if="!poll.published"
            @click="publishPoll(index)"
            outlined
            color="secondary"
            >Publish Poll</v-btn
          >
          <v-btn @click="$router.push('/edit/' + index)" color="secondary">
            Edit
          </v-btn>
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
import Vue from "vue"
import { db, auth } from "../firebase"
import {
  remove,
  update,
  get,
  ref,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"

export default {
  name: "Dashboard",
  data: () => ({
    polls: [],
    loading: false,
    none: false,
    dialog: {},
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
    getTmz24Time(str, tzn) {
      var hours = parseInt(str.split(":")[0])
      var minutes = parseInt(str.split(":")[1])
      var ampm = hours >= 12 ? "PM" : "AM"
      hours = hours % 12
      hours = hours ? hours : 12
      minutes = minutes < 10 ? "0" + minutes : minutes
      return hours + ":" + minutes + " " + ampm + " " + tzn
    },
    copyText(txt) {
      navigator.clipboard.writeText(window.location.origin + "/poll/" + txt)
      this.$root.toast.show({
        message: "Poodle copied to clipboard!",
      })
    },
    publishPoll(index) {
      update(ref(db, "polls/" + index), {
        published: true,
      })
      this.polls[index].published = true
      this.$root.toast.show({
        message: "Poodle published!",
      })
    },
    openPoll(txt) {
      window.open(window.location.origin + "/poll/" + txt, "_blank")
    },
    deletePoll(poll) {
      this.dialog[poll] = false
      remove(ref(db, "polls/" + poll))
      Vue.delete(this.polls, poll)
      this.$root.toast.show({
        message: "Poodle succesfully deleted.",
      })
      if (!Object.keys(this.polls).length) {
        this.$router.go()
      }
    },
    sendEmails(id, emails, title, desc) {
      window.open(
        `mailto:?bcc=` +
          emails.replaceAll(",", ";") +
          `&subject=Poodle Poll Reminder: ` +
          title +
          `
&body=Hey Poodler!%0D%0A%0D%0AYou have been invited to participate in the 
following Poodle Poll.%0D%0A%0D%0A` +
          title +
          `%0D%0A
Description: ` +
          desc +
          `%0D%0A%0D%0ATake the poll here: ` +
          window.location.origin +
          "/poll/" +
          id +
          `
%0D%0A%0D%0AHappy Poodling!%0D%0AThe Poodle Poll Team`
      )
    },
  },
  metaInfo: {
    title: "Dashboard",
  },
}
</script>

<style scoped>
.clamp-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  white-space: normal;
}
</style>