import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Paginate from 'vuejs-paginate-next';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

library.add(faUser, faEnvelope, faLock, faEye, faEyeSlash)

import App from './App.vue'
import { router } from './router/routes'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('Paginate', Paginate)
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')