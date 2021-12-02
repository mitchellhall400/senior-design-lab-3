<template>
  <v-container v-if="loading">
    <v-skeleton-loader class="ma-4" type="article, actions"></v-skeleton-loader>
  </v-container>
  <v-container v-else>
    <v-card class="ma-4" elevation="8">
      <v-card-title class="primary"> Create New Poodle </v-card-title>
      <v-list-item-content class="ma-4">
        <v-form>
          <v-text-field
            v-model="title"
            label="Title"
            prepend-icon="mdi-label"
            filled
          ></v-text-field>
          <v-textarea
            v-model="description"
            label="Description"
            prepend-icon="mdi-comment-text"
            auto-grow
            filled
          ></v-textarea>
          <v-text-field
            v-model="location"
            label="Location"
            prepend-icon="mdi-map-marker"
            filled
          ></v-text-field>
          <v-select
            v-model="timezone"
            label="Time Zone"
            prepend-icon="mdi-map-clock"
            :items="timezones"
            filled
          ></v-select>
          <v-row>
            <v-col>
              <v-text-field
                v-model="votesPerTimeslot"
                label="Number of Votes Per Time Slot"
                prepend-icon="mdi-check-all"
                filled
              ></v-text-field>
              <v-select
                v-model="selectedTimeOption"
                label="Create time slots based on:"
                prepend-icon="mdi-application-cog"
                :items="timeslotOptions"
                filled
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field
                v-model="votesPerUser"
                label="Number of Votes Per User"
                filled
              ></v-text-field>
              <v-text-field
                v-model="timeslotCreationNumber"
                filled
                :label="selectedTimeOptionLabel()"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-combobox
            v-model="emails"
            label="Poodlers Email's"
            prepend-icon="mdi-account-group"
            hint="Enter individually or a comma separated list"
            @change="verifyCombo()"
            append-icon=""
            chips
            clearable
            multiple
            filled
            auto-grow
          >
            <template v-slot:selection="{ item }">
              <v-chip
                close
                outlined
                @click:close="remove(item)"
                @input="alert('sadaf')"
              >
                {{ item }}
              </v-chip>
            </template>
          </v-combobox>
          <v-list class="ml-0 pl-0 pr-0">
            <h3>Poodle - Date Range</h3>
            <v-list-item class="ml-0 pl-0 mr-0 pr-0">
              <v-list-item-icon class="mr-0 pr-2">
                <v-icon>mdi-calendar-collapse-horizontal</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-text-field
                  v-model="dateRangeText"
                  label="Poodle Date Range"
                  filled
                  hide-details
                  disabled
                ></v-text-field>
                <v-date-picker
                  v-model="dates"
                  class="remove-top"
                  @input="updateDateRangeText()"
                  range
                  no-title
                  color="primary"
                  full-width
                ></v-date-picker>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-list class="ml-0 pl-0 pr-0">
            <h3>Poodle - Time Range</h3>
            <v-list-item class="ml-0 pl-0 mr-0 pr-0">
              <v-list-item-icon class="mr-0 pr-2">
                <v-icon>mdi-timeline-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-row>
                  <v-col>
                    <h4>Start:</h4>
                    <v-time-picker
                      v-model="timeRangeStart"
                      color="primary"
                      full-width
                      ampm-in-title
                      :max="getStartTimeBound()"
                    ></v-time-picker>
                  </v-col>
                  <v-col>
                    <h4>End:</h4>
                    <v-time-picker
                      v-model="timeRangeStop"
                      color="primary"
                      full-width
                      ampm-in-title
                      :min="getStopTimeBound()"
                    ></v-time-picker>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-list class="ml-0 pl-0 pr-0">
            <h3>Poodle - Submission Close</h3>
            <v-list-item class="ml-0 pl-0 mr-0 pr-0">
              <v-list-item-icon class="mr-0 pr-2">
                <v-icon>mdi-calendar-end</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-row>
                  <v-col>
                    <h4>Date:</h4>
                    <v-date-picker
                      v-model="closeDate"
                      class="stand-height"
                      color="primary"
                      full-width
                    ></v-date-picker>
                  </v-col>
                  <v-col>
                    <h4>Time:</h4>
                    <v-time-picker
                      v-model="closeTime"
                      class="stand-height"
                      color="primary"
                      full-width
                      ampm-in-title
                    ></v-time-picker>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="$router.push('/dashboard')"
              color="secondary"
              outlined
              >Cancel
            </v-btn>
            <v-btn @click="editPoll(false)" color="secondary">Update</v-btn>
            <v-dialog v-model="dialog" width="500">
              <v-card>
                <v-card-title class="error">
                  Overwrite warning!
                </v-card-title>
                <v-card-text class="pt-4">
                  You are about to edit time settings on your "{{ poll.title }}" Poodle.
                  <br><br>
                  This Poodle is published and has responses already. Updating time settings now will remove previous responses. Are you sure you want to continue?
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" outlined @click="dialog = false">
                    Cancel
                  </v-btn>
                  <v-btn color="error" @click="editPoll(true)">
                    Confirm Edit
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-form>
      </v-list-item-content>
    </v-card>
  </v-container>
</template>
  
<script>
import { db, auth } from "../firebase";
import { update, get, ref } from "firebase/database";

export default {
  name: "Create",
  data: () => ({
    // v-model field vars
    title: "",
    description: "",
    location: "",
    timezone: "Not Specified",
    votesPerTimeslot: "",
    loading: false,
    selectedTimeOption: "",
    votesPerUser: "",
    timeslotCreationNumber: "",
    emails: [],
    dateRangeText: "",
    dates: [],
    timeRangeStart: null,
    timeRangeStop: null,
    closeDate: null,
    closeTime: null,
    dialog: false,

    // constant vars for v-selects
    timeslotOptions: [
      "desired number of time slots per day",
      "desired length of time per time slot",
    ],
    timeZone: "Not Specified", 
    timezones: [
      "Not Specified",
      "GMT - Greenwich Mean Time",
      "UTC - Universal Coordinated Time",
      "ECT - European Central Time",
      "EET - Eastern European Time",
      "ART - (Arabic) Egypt Standard Time",
      "EAT - Eastern African Time",
      "MET - Middle East Time",
      "NET - Near East Time",
      "PLT - Pakistan Lahore Time",
      "IST - India Standard Time",
      "BST - Bangladesh Standard Time",
      "VST - Vietnam Standard Time",
      "CTT - China Taiwan Time",
      "JST - Japan Standard Time",
      "ACT - Australia Central Time",
      "AET - Australia Eastern Time",
      "SST - Solomon Standard Time",
      "NST - New Zealand Standard Time",
      "MIT - Midway Islands Time",
      "HST - Hawaii Standard Time",
      "AST - Alaska Standard Time",
      "PST - Pacific Standard Time",
      "PNT - Phoenix Standard Time",
      "MST - Mountain Standard Time",
      "CST - Central Standard Time",
      "EST - Eastern Standard Time",
      "IET - Indiana Eastern Standard Time",
      "PRT - Puerto Rico and US Virgin Islands Time",
      "CNT - Canada Newfoundland Time",
      "AGT - Argentina Standard Time",
      "BET - Brazil Eastern Time",
      "CAT - Central African Time",
    ],
    rules: {
      required: (value) => !!value || "Required.",
      min: (v) => (v && v.length >= 4) || "Min 4 characters",
    },
  }),
  created() {
    this.determinePermission()
  },
  metaInfo: {
    title: "Edit",
  },
  methods: {
    updateDateRangeText() {
      var d1 = new Date(this.dates[0]);
      d1.setDate(d1.getDate() + 1);
      var d2 = new Date(this.dates[1]);
      d2.setDate(d2.getDate() + 1);
      if (this.dates[0] == null) {
        this.dateRangeText = "";
      } else if (this.dates[1] == null) {
        this.dateRangeText = d1.toLocaleDateString("en-US") + " ~ ";
      } else {
        if (d1 > d2) {
          [this.dates[0], this.dates[1]] = [this.dates[1], this.dates[0]];
          this.dateRangeText =
            d2.toLocaleDateString("en-US") +
            " ~ " +
            d1.toLocaleDateString("en-US");
        } else {
          this.dateRangeText =
            d1.toLocaleDateString("en-US") +
            " ~ " +
            d2.toLocaleDateString("en-US");
        }
      }
    },
    selectedTimeOptionText() {
      if (this.selectedTimeOption == "desired number of time slots per day") {
        return "Number of Time Slots Per Day"
      }
      return "Time Slot Length (Minutes)"
    },
    remove(item) {
      this.emails.splice(this.emails.indexOf(item), 1)
      this.emails = [...this.emails]
    },
    verifyCombo() {
      if (this.emails.length) {
        if (
          !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
            this.emails.at(-1)
          )
        ) {
          var last = this.emails.pop().replace(/\s+/g, "").split(",")
          var allGood = true
          last.forEach((email) => {
            if (
              !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)
            ) {
              allGood = false
            }
          })
          if (allGood) {
            last.forEach((email) => {
              if (!this.emails.includes(email)) {
                this.emails = this.emails.concat(email)
              }
            })
          }
        }
      }
    },
    determinePermission() {
      this.loading = true
      get(ref(db, "polls/" + this.$route.params.id)).then((snapshot) => {
        if (snapshot.exists()) {
          this.poll = snapshot.val()
          if (this.poll.created_by == auth.currentUser.email) {
            this.title = this.poll.title
            this.description = this.poll.description
            this.location = this.poll.location
            if (this.poll.timezone) {
              this.timezones.forEach((val) => {
                if (val.startsWith(this.poll.timezone)) {
                  this.timeZone = val 
                }
              })  
            }
            else {
              this.timeZone = "Not Specified" 
            }
            this.votesPerTimeslot = this.poll.votes_per_timeslot
            this.votesPerUser = this.poll.votes_per_users 
            this.selectedTimeOption = this.poll.time_slot_duration ? this.timeslotOptions[1] : this.timeslotOptions[0]
            this.timeslotCreationNumber = this.poll.time_slot_duration ? this.poll.time_slot_duration : this.poll.time_slots_per_day
            
            this.emails = this.poll.poodlers.replace(/\s+/g, "").split(",")
            this.dates = [this.poll.window_date_start, this.poll.window_date_end]
            this.timeRangeStart = this.poll.window_time_start
            this.timeRangeStop = this.poll.window_time_end
            this.closeDate = this.poll.close_date
            this.closeTime = this.poll.close_time
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
    getStopTimeBound() {
      if (this.timeRangeStart != null) {
        var time = this.timeRangeStart.split(":");
        if (parseInt(time[1]) > 54) {
          return parseInt(time[0]) + 1 + ":" + (parseInt(time[1]) - 55);
        }
        return time[0] + ":" + (parseInt(time[1]) + 5);
      }
      return "0:05";
    },
    getStartTimeBound() {
      if (this.timeRangeStop != null) {
        var time = this.timeRangeStop.split(":");
        if (parseInt(time[1]) < 6) {
          return parseInt(time[0]) - 1 + ":" + (parseInt(time[1]) + 55);
        }
        return time[0] + ":" + (parseInt(time[1]) - 5);
      }
      return "23:54";
    },
    selectedTimeOptionLabel() {
      if (this.selectedTimeOption == "desired number of time slots per day") {
        return "Number of Time Slots Per Day";
      }
      return "Time Slot Length (Minutes)";
    },
    editPoll(force) {
      // process timezone
      var dbTimezone = null;
      if (this.timezone == "Not Specified") {
        dbTimezone = "";
      } else {
        dbTimezone = this.timezone.substring(0, 3);
      }

      // process close date
      var dCur = new Date(this.closeDate);
      var closeDateMod = "";
      var closeTimeMod = "";
      if (this.closeDate != null) {
        closeDateMod =
          dCur.getFullYear() +
          "-" +
          (dCur.getMonth() + 1) +
          "-" +
          (dCur.getDate() + 1);
        if (this.closeTime == null) {
          closeTimeMod = "23:59";
        }
        else {
          closeTimeMod = this.closeTime;
        }
      }

      // field verification
      var valid = true;
      if (this.dates.length < 2) {
        this.$root.toast.show({ message: "Please enter a valid Date Range" });
        valid = false;
      }
      if (this.title == "") {
        this.$root.toast.show({ message: "Please enter a valid Title" });
        valid = false;
      } else if (isNaN(this.votesPerTimeslot) || this.votesPerTimeslot == "" || this.votesPerTimeslot == 0) {
        this.$root.toast.show({
          message: "Please enter a valid number for Votes Per Time Slot",
        });
        valid = false;
      } else if (isNaN(this.votesPerUser) || this.votesPerUser == "" || this.votesPerUser == 0) {
        this.$root.toast.show({
          message: "Please enter a valid Number for Votes Per User",
        });
        valid = false;
      } else if (this.timeRangeStart == null) {
        this.$root.toast.show({ message: "Please enter a Start Time Range" });
        valid = false;
      } else if (this.timeRangeStop == null) {
        this.$root.toast.show({ message: "Please enter a End Time Range" });
        valid = false;
      } else if (
        this.selectedTimeOption == "desired number of time slots per day"
      ) {
        var timeSlotDuration = "";
        var timeSlotPerDay = this.timeslotCreationNumber;
        var start = this.timeRangeStart.split(":");
        var end = this.timeRangeStop.split(":");
        if (
          isNaN(this.timeslotCreationNumber) ||
          this.timeslotCreationNumber == ""
        ) {
          this.$root.toast.show({
            message: "Please enter a valid Number of Time Slots Per Day",
          });
          valid = false;
        } else if (
          (parseInt(end[0] - start[0]) * 60 + parseInt(end[1] - start[1])) /
            this.timeslotCreationNumber <
          5
        ) {
          this.$root.toast.show({
            message:
              "Too many Time Slots Per Day for entered Poodle Time Range",
          });
          valid = false;
        }
      } else if (
        this.selectedTimeOption == "desired length of time per time slot"
      ) {
        timeSlotPerDay = "";
        timeSlotDuration = this.timeslotCreationNumber;
        if (
          isNaN(this.timeslotCreationNumber) ||
          this.timeslotCreationNumber == "" ||
          this.timeslotCreationNumber < 5
        ) {
          this.$root.toast.show({
            message: "Please enter a valid Time Slot Length",
          });
          valid = false;
        }
      }
      
      if (valid) {
        if(this.poll.published && !force && 'time_slots' in this.poll && (
          timeSlotDuration != this.poll.time_slot_duration ||
          timeSlotPerDay != this.poll.time_slots_per_day ||
          this.dates[1] != this.poll.window_date_end ||
          this.dates[0] != this.poll.window_date_start ||
          this.timeRangeStop != this.poll.window_time_end ||
          this.timeRangeStart != this.poll.window_time_start
        )) {
          this.dialog = true
        }
        else {
          update(ref(db, "polls/" + this.$route.params.id), {
            close_date: closeDateMod,
            close_time: closeTimeMod,
            created_by: auth.currentUser.email,
            description: this.description,
            location: this.location,
            poodlers: this.emails.join(","),
            time_slot_duration: timeSlotDuration,
            time_slots: {},
            time_slots_per_day: timeSlotPerDay,
            timezone: dbTimezone,
            title: this.title,
            votes_per_timeslot: this.votesPerTimeslot,
            votes_per_users: this.votesPerUser,
            window_date_end: this.dates[1],
            window_date_start: this.dates[0],
            window_time_end: this.timeRangeStop,
            window_time_start: this.timeRangeStart,
          })
          this.$root.toast.show({ message: "Succesfully created Poodle!" });
          this.$router.push("/dashboard");
        }
      }
    },
  },
}
</script>

<style scoped>
.remove-top {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.stand-height {
  height: 400px;
}
</style>