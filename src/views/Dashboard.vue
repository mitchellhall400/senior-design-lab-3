<template>
  <v-container>
    <template v-for="n in 6">
      <v-card
        class="ma-4"
        :key='n'
      >
        <v-list-item three-line>
          <v-list-item-content>
            <v-list-item-title class="text-h5 mb-1">
              Advising Appointments
            </v-list-item-title>
            <v-list-item><v-icon class='pa-2'>mdi-map-marker</v-icon>Iowa City, IA</v-list-item>
            <v-list-item><v-icon class='pa-2'>mdi-timer-sand-complete</v-icon>Closes at 5:50 PM CTD on 1/1/2021</v-list-item>
            <v-list-item><v-icon class='pa-2'>mdi-clipboard-text-clock</v-icon>From 1/1/2021 5:50 PM CTD to 1/5/2021 5:50 PM CTD</v-list-item>
          </v-list-item-content>
        </v-list-item>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color='secondary'
          >
            Remind Poodlers
          </v-btn>
          <v-btn
            color='secondary'
          >
            Edit Poodle
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <v-fab-transition>
      <v-btn
        fab
        x-large
        fixed
        right
        bottom
        color='accent'
        class='ma-4'
      >
        <v-icon large color='grey darken-4'>mdi-table-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
import {database} from '../firebase'
import {get, ref, child} from 'firebase/database'

const polls = ref(database, "polls/")
get(child(polls,'1020120/created_by')).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val())
  } else {
    console.log("No data available")
  }
}).catch((error) => {
  console.error(error);
})

export default {
  name: 'Dashboard',
};
</script>