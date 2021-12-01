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
        <v-list-item v-if="poll.close_date.replace(/\s/g, '').length">
          <v-list-item-icon class="mr-3">
            <v-icon>mdi-calendar-end</v-icon>
          </v-list-item-icon>
          Poll closes on {{ poll.close_date }} at
          {{ getTmz24Time(poll.close_time, poll.timezone) }}
        </v-list-item>
        <v-list-item v-if="poll.location.replace(/\s/g, '').length">
          <v-list-item-icon class="mr-3">
            <v-icon>mdi-map-marker</v-icon>
          </v-list-item-icon>
          {{ poll.location }}
        </v-list-item>
        <v-list-item v-if="poll.description.replace(/\s/g, '').length">
          <v-list-item-icon class="mr-3">
            <v-icon>mdi-comment-text</v-icon>
          </v-list-item-icon>
          {{ poll.description }}
        </v-list-item>
      </v-list-item-content>
      <v-form class="ml-4 mr-4">
        <v-text-field
          filled
          v-model="identifier"
          label="Identifier"
          hint="Name, email, team, etc."
          required
          :rules="[rules.required]"
          prepend-icon="mdi-form-textbox"
        ></v-text-field>
      </v-form>
      <v-divider></v-divider>
      <v-container d-flex>
        <v-btn icon class="ml-2" @click="prev">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn icon @click="focus = poll.window_date_start">
          <v-icon v-if="focus == poll.window_date_start">mdi-home</v-icon>
          <v-icon v-else>mdi-home-outline</v-icon>
        </v-btn>
        <v-btn icon class="mr-2" @click="next">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <h3 class="pt-1">{{ calendarTitle }}</h3>
      </v-container>
      <v-divider></v-divider>
      <v-container d-flex>
        <v-container v-if="poll.timezone" class="ml-4 pa-0 pt-4">
          <strong>Timezone: </strong>{{ poll.timezone }}
        </v-container>
        <v-spacer></v-spacer>
        <v-container v-if="poll.timezone" class="mr-4 pa-0 pt-4 text-right">
          <strong>Selections: </strong>{{ numSelected }} /
          {{ poll.votes_per_users }}
        </v-container>
      </v-container>
      <v-sheet class="ma-4">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          type="week"
          now="1970-1-1"
          :events="events"
          :first-time="poll.window_time_start"
          :interval-minutes="intervalMinutes"
          :interval-count="intervalCount"
          @click:event="showEvent"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card min-width="350px">
            <v-toolbar flat :color="selectedEvent.color">
              <v-icon class="mr-2">mdi-calendar</v-icon>
              <v-toolbar-title class="pb-1">{{
                selectedEvent.name
              }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon @click="selectedOpen = false">mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              {{
                simpleTime(selectedEvent.start) +
                " - " +
                simpleTime(selectedEvent.end)
              }}
              <br />
              {{ selectedEvent.details }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="selectedEvent.full || selectedEvent.disabled"
                color="secondary"
                @click="reservation"
              >
                <div v-if="selectedEvent.selected">Unselect</div>
                <div v-else>Select</div>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="$router.push('/dashboard')" color="secondary" :disabled="!numSelected">
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
    numSelected: 0,
    focus: "",
    poll: {},
    loading: false,
    identifier: "",
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    intervalMinutes: "",
    intervalCount: "",
    events: [],
    rules: {
      required: (value) => !!value || "Required.",
    },
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
          if (this.poll.published) {
            this.focus = this.poll.window_date_start;
            var start = this.poll.window_time_start.split(":");
            var end = this.poll.window_time_end.split(":");
            var windowMinutes =
              parseInt(end[0] - start[0]) * 60 + parseInt(end[1] - start[1]);
            if (this.poll.time_slot_duration) {
              this.intervalMinutes = this.poll.time_slot_duration;
              this.intervalCount = windowMinutes / this.intervalMinutes;
            } else {
              this.intervalMinutes =
                windowMinutes / this.poll.time_slots_per_day;
              this.intervalCount = windowMinutes / this.intervalMinutes;
            }
            this.generateEvents();
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
    generateEvents() {
      var dEnd = new Date(this.poll.window_date_end);
      var dCur = new Date(this.poll.window_date_start);
      dEnd.setDate(dEnd.getDate() + 1);
      dCur.setDate(dCur.getDate() + 1);
      while (dCur <= dEnd) {
        var date =
          dCur.getFullYear() +
          "-" +
          (dCur.getMonth() + 1) +
          "-" +
          dCur.getDate() +
          " ";
        for (var i = 0; i < this.intervalCount; i++) {
          this.events.push({
            name: "(" + 0 + "/" + this.poll.votes_per_timeslot + ")",
            start: date + this.addNIntervals(i, this.poll.window_time_start),
            end: date + this.addNIntervals(i + 1, this.poll.window_time_start),
            color: i % 2 == 0 ? "primary" : "grey",
            details: "This time slot is empty.",
            full: i % 2 == 0 ? false : true,
            selected: false,
            disabled: false,
          });
        }
        dCur.setDate(dCur.getDate() + 1);
      }
    },
    addNIntervals(n, time) {
      var split = time.split(":");
      split[1] = parseInt(split[1]) + this.intervalMinutes * n;
      split[0] = parseInt(split[0]) + Math.floor(split[1] / 60);
      split[1] = split[1] % 60;
      var hour = split[0].toString();
      var min = split[1].toString();
      if (split[0] < 10) {
        hour = "0" + hour;
      }
      if (split[1] < 10) {
        min = "0" + min;
      }
      return hour + ":" + min;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    reservation() {
      this.selectedOpen = false
      if (this.selectedEvent.selected) {
        this.selectedEvent.color = "primary";
        this.selectedEvent.selected = false;
        if (this.numSelected == this.poll.votes_per_users) {
          this.events.forEach((event) => {
            if (event.disabled) {
              event.color = "primary";
              event.disabled = false;
            }
          });
        }
        this.numSelected--;
      } else {
        this.selectedEvent.color = "secondary";
        this.selectedEvent.selected = true;
        this.numSelected++;
        if (this.numSelected == this.poll.votes_per_users) {
          this.events.forEach((event) => {
            if (!event.selected && !event.full) {
              event.color = "grey";
              event.disabled = true;
            }
          });
        }
      }
    },
    simpleTime(time) {
      var str = new Date(time).toLocaleTimeString("en-US");
      str = str.slice(0, str.length - 6) + str.slice(str.length - 3);
      return str;
    },
    getTmz24Time(str, tzn) {
      var hours = parseInt(str.split(":")[0]);
      var minutes = parseInt(str.split(":")[1]);
      var ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      return hours + ":" + minutes + " " + ampm + " " + tzn;
    },
  },
  computed: {
    calendarTitle() {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      var date = new Date(this.focus);
      date.setDate(date.getDate() - date.getDay());
      var from =
        months[date.getMonth()] +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear();
      date.setDate(date.getDate() + 6);
      var to =
        months[date.getMonth()] +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear();
      return from + " - " + to;
    },
  },
  metaInfo: {
    title: "Take Poll",
  },
};
</script>

<style>
.v-calendar {
  border-radius: 8px;
  border-right: none !important;
  border: solid 1px lightgrey;
}
.v-calendar-daily__head {
  margin-right: 0 !important;
}
.v-calendar-daily__scroll-area {
  overflow-y: auto !important;
}
.theme--dark.v-calendar-daily .v-calendar-daily__day {
  border-bottom: none !important;
}
</style>