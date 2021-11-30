<template>
  <v-container>
    <v-card class="ma-4 pa-4" elevation="8">
      <v-form>
        <div class="text-h5 mb-4">Create New Poodle</div>
        <v-text-field
          filled
          v-model="title"
          label="Title"
          required
          :rules="[rules.required, rules.min]"
          prepend-icon="mdi-label"
        ></v-text-field>
        <v-textarea
          filled
          name="description"
          label="Description"
          auto-grow
          prepend-icon="mdi-comment-text"
        ></v-textarea>
        <v-text-field
          filled
          v-model="title"
          label="Location"
          prepend-icon="mdi-map-marker"
        ></v-text-field>
        <v-select
          :items="timezones"
          filled
          prepend-icon="mdi-map-clock"
          value="Not Specified"
          label="Time Zone"
        ></v-select>
        <v-row>
          <v-col>
            <v-text-field
              class="pa-0"
              filled
              label="Number of Votes Per Time Slot"
              prepend-icon="mdi-check-all"
            ></v-text-field>
            <v-select
              class="pa-0"
              :items="timeslotOptions"
              v-model="selectedTimeOption"
              filled
              prepend-icon="mdi-application-cog"
              value="Not Specified"
              label="Create time slots based on:"
            ></v-select>
          </v-col>
          <v-col>
            <v-text-field
              class="pa-0"
              filled
              label="Number of Votes Per User"
            ></v-text-field>
            <v-text-field
              class="pa-0"
              filled
              :label="selectedTimeOptionText()"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-combobox
          v-model="emails"
          chips
          clearable
          multiple
          append-icon=""
          filled
          label="Poodlers Email's"
          auto-grow
          hint="Enter individually or a comma separated list"
          prepend-icon="mdi-account-group"
          @change="verifyCombo()"
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
                filled
                v-model="dateRangeText"
                label="Poodle Date Range"
                hide-details
                disabled
              ></v-text-field>
              <v-date-picker
                v-model="dates"
                class="remove-top"
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
                    class="stand-height"
                    v-model="closeDate"
                    color="primary"
                    full-width
                  ></v-date-picker>
                </v-col>
                <v-col>
                  <h4>Time:</h4>
                  <v-time-picker
                    class="stand-height"
                    v-model="closeTime"
                    color="primary"
                    full-width
                    ampm-in-title
                  ></v-time-picker>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-checkbox name="publish" label="Publish with creation"></v-checkbox>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="$router.push('/dashboard')" color="secondary" outlined
            >Cancel
          </v-btn>
          <v-btn color="secondary">Create</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
  
<script>
import { db, auth } from "../firebase"
import { get, ref } from "firebase/database"



export default {
  name: "Edit",
  data: () => ({
    title: "",
    emails: [],
    dates: [],
    poll: {},
    timeRangeStart: null,
    timeRangeStop: null,
    closeDate: null,
    closeTime: null,
    selectedTimeOption: "desired number of time slots per day",
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
  created() {
    this.determinePermission()
  },
  metaInfo: {
    title: "Edit",
  },
  computed: {
    dateRangeText() {
      var d1 = new Date(this.dates[0]);
      d1.setDate(d1.getDate() + 1);
      var d2 = new Date(this.dates[1]);
      d2.setDate(d2.getDate() + 1);
      if (this.dates[0] == null) {
        return "";
      } else if (this.dates[1] == null) {
        return d1.toLocaleDateString("en-US") + " ~ ";
      } else {
        if (d1 > d2) {
          return (
            d2.toLocaleDateString("en-US") +
            " ~ " +
            d1.toLocaleDateString("en-US")
          );
        } else {
          return (
            d1.toLocaleDateString("en-US") +
            " ~ " +
            d2.toLocaleDateString("en-US")
          );
        }
      }
    },
  },
  methods: {
    selectedTimeOptionText() {
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



