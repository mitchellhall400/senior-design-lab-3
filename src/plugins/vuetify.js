import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#446664',
                secondary: '#d98e7b',
                accent: '#f5d06d',
            },
            dark: {
                primary: '#334c4b',
                secondary: '#cf725b',
                accent: '#f3c445',
            },
        },
        dark: true, 
    },
})
