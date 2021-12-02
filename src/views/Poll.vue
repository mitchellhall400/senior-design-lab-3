<template>
  <v-container v-if="loading">
    <v-skeleton-loader class="ma-4" type="article, actions"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="submited">
    <v-banner class="ma-4">
      <v-avatar slot="icon" color="secondary" size="40">
        <v-icon>mdi-calendar-multiple-check</v-icon>
      </v-avatar>
      <div class="text-h6">Thanks for taking this Poodle Poll!</div>
      Your response has been recorded and is shown below.
    </v-banner>
    <v-card class="ma-4"  elevation="8">
      <v-card-title class="primary">
        {{ poll.title }}
      </v-card-title>
      <v-list-item class="pt-4" v-if="poll.description.replace(/\s/g, '').length"
        ><v-icon class="pa-2">mdi-comment-text</v-icon>
        {{ poll.description }}</v-list-item
      >
      <v-list-item v-if="poll.location.replace(/\s/g, '').length"
        ><v-icon class="pa-2">mdi-map-marker</v-icon
        >{{ poll.location }}</v-list-item
      >
      <v-divider></v-divider>
      <v-list-item v-if="poll.location.replace(/\s/g, '').length"
        ><v-icon class="pa-2">mdi-calendar-multiple-check</v-icon
        >Your Response: </v-list-item
      >
      <div class="d-flex flex-wrap ml-4 mr-4" style="overflow: wrap;">
        <template v-for="(event, index) in events">
          <v-card v-if="event.selected" outlined elevation="0" :key="index" class="ma-4" width="250">
            <v-toolbar flat color="primary">
              {{ event.start.split(' ')[0] }}
              <br>
              {{ simpleTime(event.start) }} - {{ simpleTime(event.end) }}
            </v-toolbar>
            <v-chip-group column class="pl-2 pr-2">
              <v-chip
                v-for="(ident, index) in event.details"
                :key="index"
                >{{ ident }}</v-chip
              >
              <v-chip>{{ identifier }}</v-chip>
            </v-chip-group>
            <div class="pa-2">
              ({{
                parseInt(event.name.split("/")[0].replace('(','')) + 1
              }}/{{ poll.votes_per_timeslot }})
            </div>
          </v-card>
        </template>
      </div>
    </v-card>
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
      <v-form ref="pollForm" class="ml-4 mr-4" lazy-validation>
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
        <v-container class="mr-4 pa-0 pt-4 text-right">
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
          <v-card width="350px">
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
            <div class="text-body-2 pa-2">
              {{
                simpleTime(selectedEvent.start) +
                " - " +
                simpleTime(selectedEvent.end)
              }}
            </div>
            <v-divider></v-divider>
            <v-chip-group column class="pl-2 pr-2">
              <v-chip
                small
                v-for="(ident, index) in selectedEvent.details"
                :key="index"
                >{{ ident }}</v-chip
              >
            </v-chip-group>
            <v-card-actions
              v-if="!selectedEvent.full && !selectedEvent.disabled"
            >
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="reservation">
                <div v-if="selectedEvent.selected">Unselect</div>
                <div v-else>Select</div>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!closed['val']"
          @click="submit"
          color="secondary"
          :disabled="!numSelected"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
  
<script>
import { db } from "../firebase";
import { set, get, ref } from "firebase/database";

export default {
  name: "Edit",
  data: () => ({
    submited: false,
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
    closed: { val: false },
    rules: {
      required: (value) => !!value || "Required.",
    },
    timezones: {
      GMT: "+0",
      UTC: "+0",
      ECT: "+1",
      EET: "+2",
      ART: "+2",
      EAT: "+3",
      MET: "+3",
      NET: "+4",
      PLT: "+5",
      IST: "+5.5",
      BST: "+6",
      VST: "+7",
      CTT: "+8",
      JST: "+9",
      ACT: "+9.5",
      AET: "+10",
      SST: "+11",
      NST: "+12",
      MIT: "-11",
      HST: "-10",
      AST: "-9",
      PST: "-8",
      PNT: "-7",
      MST: "-7",
      CST: "-6",
      EST: "-5",
      IET: "-5",
      PRT: "-4",
      CNT: "-3",
      AGT: "-3",
      BET: "-3",
      CAT: "-1",
    },
  }),
  created() {
    this.getPoll();
  },
  methods: {
    isClosed(date, time, tzn) {
      var dSplit = date.split("-");
      var tSplit = time.split(":");
      var closeDate = new Date(
        dSplit[0],
        parseInt(dSplit[1]) - 1,
        dSplit[2],
        tSplit[0],
        tSplit[1]
      );
      if (tzn == "") {
        return closeDate < new Date();
      } else {
        console.log(
          closeDate < this.getTimeInTimezone(new Date(), this.timezones[tzn])
        );
        return (
          closeDate < this.getTimeInTimezone(new Date(), this.timezones[tzn])
        );
      }
    },
    getTimeInTimezone(d, offset) {
      var utc = d.getTime() + d.getTimezoneOffset() * 60000;
      var nd = new Date(utc + 3600000 * offset);
      return nd;
    },
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
              this.intervalMinutes = parseInt(
                windowMinutes / this.poll.time_slots_per_day
              );
              this.intervalCount = windowMinutes / this.intervalMinutes;
            }
            this.generateEvents();
            this.closed["val"] = this.isClosed(
              this.poll.close_date,
              this.poll.close_time,
              this.poll.timezone
            );
            this.loading = false;
          } else {
            this.$router.push("/");
          }
        } else {
          this.$router.push("/");
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
          dCur.getDate();
        for (var i = 0; i < this.intervalCount; i++) {
          var start_time = this.addNIntervals(i, this.poll.window_time_start);
          var response = this.getResponse(date, start_time);
          this.events.push({
            name: "(" + response.num + "/" + this.poll.votes_per_timeslot + ")",
            start: date + " " + start_time,
            end:
              date +
              " " +
              this.addNIntervals(i + 1, this.poll.window_time_start),
            color:
              response.num == this.poll.votes_per_timeslot ? "grey" : "primary",
            details: response.identifiers,
            full: response.num == this.poll.votes_per_timeslot,
            selected: false,
            disabled: false,
          });
        }
        dCur.setDate(dCur.getDate() + 1);
      }
    },
    getResponse(date, start) {
      if (
        this.poll.time_slots != undefined &&
        this.poll.time_slots[date] != undefined &&
        this.poll.time_slots[date][start] != undefined
      ) {
        return {
          num: this.poll.time_slots[date][start].length,
          identifiers: this.poll.time_slots[date][start],
        };
      } else {
        return {
          num: 0,
          identifiers: "",
        };
      }
    },
    addNIntervals(n, time) {
      var split = time.split(":");
      split[1] = parseInt(split[1]) + this.intervalMinutes * n;
      split[0] = parseInt(split[0]) + Math.floor(split[1] / 60);
      split[1] = parseInt(split[1] % 60);
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
      this.selectedOpen = false;
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
              event.color = "grey  darken-2";
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
    submit() {
      if (
        this.isClosed(
          this.poll.close_date,
          this.poll.close_time,
          this.poll.timezone
        )
      ) {
        this.$set(this.closed, "val", true);
        this.$root.toast.show({ message: "Poll has closed." });
        this.events.forEach((event) => {
          event.selected = false;
          event.color = event.full ? "grey" : "primary";
          event.disabled = true;
        });
      } else if (this.$refs.pollForm.validate()) {
        get(ref(db, "polls/" + this.$route.params.id)).then((snapshot) => {
          if (snapshot.exists()) {
            var tmpPoll = snapshot.val();
            this.events.forEach((event) => {
              if (event.selected) {
                var date = event.start.split(" ")[0];
                var start = event.start.split(" ")[1];
                var prevEmails = [];
                if (
                  tmpPoll.time_slots != undefined &&
                  tmpPoll.time_slots[date] != undefined &&
                  tmpPoll.time_slots[date][start] != undefined &&
                  tmpPoll.time_slots[date][start].length !=
                    this.poll.votes_per_timeslot
                ) {
                  prevEmails = tmpPoll.time_slots[date][start];
                }
                prevEmails.push(this.identifier);
                set(
                  ref(
                    db,
                    "polls/" +
                      this.$route.params.id +
                      "/time_slots/" +
                      date +
                      "/" +
                      start
                  ),
                  prevEmails
                );
              }
            });
          } else {
            this.$root.toast.show({ message: "This poll no longer exists." });
            this.$router.push("/");
          }
        });
        this.submited = true;
        this.$root.toast.show({
          message: "Response recorded!",
        });
      } else {
        this.$root.toast.show({ message: "Identifier is required." });
      }
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