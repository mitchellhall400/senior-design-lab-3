<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-card class="justify-center pa-4" max-width="800px" min-width="500px">
        <v-form @submit="validateCreate">
          <div class="text-h5 mb-4">Create New Poodle</div>
          <v-text-field
            filled
            v-model="title"
            label="Title"
            required
            prepend-icon="mdi-label"
            @input="$v.name.$touch()"
            @blur="$v.name.$touch()"
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
            @input="$v.name.$touch()"
            @blur="$v.name.$touch()"
          ></v-text-field>
          <v-select
            :items="timezones"
            filled
            prepend-icon="mdi-map-clock"
            value="Not Specified"
            label="Time Zone"
          ></v-select>
          <v-list class="ml-0 pl-0 pr-0">
            <v-card-title>Poodle - Date Range</v-card-title>
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
            <v-card-title>Poodle - Time Range</v-card-title>
            <v-list-item class="ml-0 pl-0 mr-0 pr-0">
              <v-list-item-icon class="mr-0 pr-2">
                <v-icon>mdi-timeline-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-row>
                  <v-col>
                    <v-time-picker
                      v-model="timeRangeStart"
                      color="primary"
                      full-width
                      ampm-in-title
                      :max="timeRangeStop"
                    ></v-time-picker>
                  </v-col>
                  <v-col>
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
            <v-card-title>Poodle - Submission Close Time</v-card-title>
            <v-list-item class="ml-0 pl-0 mr-0 pr-0">
              <v-list-item-icon class="mr-0 pr-2">
                <v-icon>mdi-calendar-end</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-row>
                  <v-col>
                    <v-date-picker
                      v-model="closeDate"
                      color="primary"
                      full-width
                    ></v-date-picker>
                  </v-col>
                  <v-col>
                    <v-time-picker
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
          <v-textarea
            filled
            name="poodlers"
            label="Poodlers"
            auto-grow
            placeholder="email1, email2, ect."
            hint="comma separated list of emails"
            prepend-icon="mdi-account-group"
          ></v-textarea>
          <v-checkbox name="publish" label="Publish with creation"></v-checkbox>
          <v-btn block color="secondary" type="submit" class="mb-4"
            >Create
          </v-btn>
          <v-btn
            block
            @click="$router.push('/dashboard')"
            color="secondary"
            outlined
            >Cancel
          </v-btn>
        </v-form>
      </v-card>
    </v-row>
  </v-container>
</template>
  
<script>
export default {
  name: "Create",
  data: () => ({
    dates: [],
    timeRangeStart: null,
    timeRangeStop: null,
    closeDate: null,
    closeTime: null,
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
  }),
  metaInfo: {
    title: "Create",
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
};
</script>

<style scoped>
.remove-top {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.h-stand {
  height: 380px;
}
</style>