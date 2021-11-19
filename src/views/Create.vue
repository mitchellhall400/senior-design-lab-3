<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-card class="justify-center pa-4" max-width="800px" min-width="500px">
        <v-form @submit="validateCreate">
          <div class="text-h5 mb-4">
              Create New Poodle
          </div>
          <v-text-field
            filled
            v-model="title"
            label="Title"
            required
            prepend-icon=mdi-label
            @input="$v.name.$touch()"
            @blur="$v.name.$touch()"
          ></v-text-field>
          <v-textarea
            filled
            name="description"
            label="Description"
            auto-grow
            prepend-icon=mdi-comment-text
          ></v-textarea>
          <v-text-field
            filled
            v-model="title"
            label="Location"
            prepend-icon=mdi-map-marker
            @input="$v.name.$touch()"
            @blur="$v.name.$touch()"
          ></v-text-field>
          <v-select
            :items="timezones"
            filled
            prepend-icon=mdi-map-clock
            value="Not Specified"
            label="Time Zone"
          ></v-select>
          <v-card class="justify-center ma-4">
            <v-date-picker
              v-model="dates"
              range
              
            ></v-date-picker>
          
          
            <v-text-field
              v-model="dateRangeText"
              label="Date range"
              prepend-icon="mdi-calendar"
              readonly
            ></v-text-field>
          </v-card>
          <v-textarea
            filled
            name="poodlers"
            label="Poodlers"
            auto-grow
            placeholder="email1, email2, ect."
            hint="comma separated list of emails"
            prepend-icon=mdi-account-group
          ></v-textarea>
          <v-checkbox
            name="publish"
            label="Publish with creation"
          ></v-checkbox>
          <v-btn
            block
            color="secondary"
            type="submit"
            class="mb-4"
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
    dates: ['2020-11-19'],
      // String(Date.getDate()).padStart(2, '0')+'-'+
      // String(Date.getMonth() + 1).padStart(2, '0')+'-'+
      // Date.getFullYear()],
    timezones: [
      'Not Specified',
      'GMT - Greenwich Mean Time',
      'UTC - Universal Coordinated Time',
      'ECT - European Central Time',
      'EET - Eastern European Time',
      'ART - (Arabic) Egypt Standard Time',
      'EAT - Eastern African Time',
      'MET - Middle East Time',
      'NET - Near East Time',
      'PLT - Pakistan Lahore Time',
      'IST - India Standard Time',
      'BST - Bangladesh Standard Time',
      'VST - Vietnam Standard Time',
      'CTT - China Taiwan Time',
      'JST - Japan Standard Time',
      'ACT - Australia Central Time',
      'AET - Australia Eastern Time',
      'SST - Solomon Standard Time',
      'NST - New Zealand Standard Time',
      'MIT - Midway Islands Time',
      'HST - Hawaii Standard Time',
      'AST - Alaska Standard Time',
      'PST - Pacific Standard Time',
      'PNT - Phoenix Standard Time',
      'MST - Mountain Standard Time',
      'CST - Central Standard Time',
      'EST - Eastern Standard Time',
      'IET - Indiana Eastern Standard Time',
      'PRT - Puerto Rico and US Virgin Islands Time',
      'CNT - Canada Newfoundland Time',
      'AGT - Argentina Standard Time',
      'BET - Brazil Eastern Time',
      'CAT - Central African Time'
    ]
  }),
  metaInfo: {
    title: 'Create'
  },
  computed: {
      dateRangeText () {
        return this.dates.join(' ~ ')
      },
    },
};
</script>