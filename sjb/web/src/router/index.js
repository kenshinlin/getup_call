import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/pages/HomePage'
import EditorGamePage from '@/pages/EditorGamePage'
import MePage from '@/pages/MePage'
import AllGamePage from '@/pages/AllGamePage'
import RulePage from '@/pages/RulePage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: HomePage
    },
    {
      path:'/home',
      component: HomePage
    },
    {
      path:'/addgame',
      component: EditorGamePage
    },
    {
      path:'/me',
      component: MePage
    },
    {
      path:'/allgames',
      component: AllGamePage
    },
    {
      path:'/rules',
      component: RulePage
    }
  ]
})
