<template>
  <v-container>
    <v-card class="ma-4" elevation="8">
      <v-card-title class="primary"> Create New Poodle </v-card-title>
      <v-list-item-content class="ma-4">
        <v-form>
          <v-text-field
            v-model="title"
            label="Title"
            prepend-icon="mdi-label"
            filled
            :rules="[rules.required, rules.min]"
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
                      :max="timeRangeStop"
                    ></v-time-picker>
                  </v-col>
                  <v-col>
                    <h4>End:</h4>
                    <v-time-picker
                      v-model="timeRangeStop"
                      color="primary"
                      full-width
                      ampm-in-title
                      :min="timeRangeStart"
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
          <v-checkbox
            v-model="published"
            name="publish"
            label="Publish with creation"
          ></v-checkbox>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="$router.push('/dashboard')"
              color="secondary"
              outlined
              >Cancel
            </v-btn>
            <v-btn @click.prevent="createPoll" color="secondary">Create</v-btn>
          </v-card-actions>
        </v-form>
      </v-list-item-content>
    </v-card>
  </v-container>
</template>
  
<script>
import { db, auth } from "../firebase";
import { push, ref } from "firebase/database";

export default {
  name: "Create",
  data: () => ({
    // v-model field vars
    title: "",
    description: "",
    location: "",
    timezone: "Not Specified",
    votesPerTimeslot: "",
    selectedTimeOption: "desired number of time slots per day",
    votesPerUser: "",
    timeslotCreationNumber: "",
    emails: [],
    dateRangeText: "",
    dates: [],
    timeRangeStart: null,
    timeRangeStop: null,
    closeDate: null,
    closeTime: null,
    published: false,

    // constant vars for v-selects
    timeslotOptions: [
      "desired number of time slots per day",
      "desired length of time per time slot",
    ],
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
  metaInfo: {
    title: "Create",
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
    selectedTimeOptionLabel() {
      if (this.selectedTimeOption == "desired number of time slots per day") {
        return "Number of Time Slots Per Day";
      }
      return "Time Slot Length (Minutes)";
    },
    remove(item) {
      this.emails.splice(this.emails.indexOf(item), 1);
      this.emails = [...this.emails];
    },
    verifyCombo() {
      if (this.emails.length) {
        if (
          !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
            this.emails.at(-1)
          )
        ) {
          var last = this.emails.pop().replace(/\s+/g, "").split(",");
          var allGood = true;
          last.forEach((email) => {
            if (
              !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)
            ) {
              allGood = false;
            }
          });
          if (allGood) {
            last.forEach((email) => {
              if (!this.emails.includes(email)) {
                this.emails = this.emails.concat(email);
              }
            });
          }
        }
      }
    },
    createPoll() {
      // process timezone
      var dbTimezone = null;
      if (this.timezone == "Not Specified") {
        dbTimezone = "";
      } else {
        dbTimezone = this.timezone.substring(0, 3);
      }
      var dCur = new Date(this.closeDate);

      // process timeslot number to store
      var timeSlotDuration = "";
      var timeSlotPerDay = "";
      if (this.selectedTimeOption == "desired number of time slots per day") {
        timeSlotPerDay = this.timeslotCreationNumber;
      } else {
        timeSlotDuration = this.timeslotCreationNumber;
      }

      push(ref(db, "polls"), {
        close_date:
          dCur.getFullYear() +
          "-" +
          (dCur.getMonth() + 1) +
          "-" +
          (dCur.getDate() + 1),
        close_time: this.closeTime,
        created_by: auth.currentUser.email,
        description: this.description,
        location: this.location,
        poodlers: this.emails.join(","),
        published: this.published,
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
      });
    },
  },
};
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