import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { VideoCamera, Memo, VideoPlay } from '@element-plus/icons-vue' 


export const routerList: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/Login/Login.vue")
  },
  {
    path: "/phone",
    name: "Phone",
    component: () => import("@/views/Login/Phone/Phone.vue")
  },
  {
    path: "/email",
    name: "Email",
    component: () => import("@/views/Login/Email/Email.vue")
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home/Home.vue"),
    redirect: "/meeting",
    children: [
      {
        path: "/meeting",
        name: "Meeting",
        component: () => import("@/views/Meeting/Meeting.vue"),
        meta: {
          name: "会议",
          icon: VideoCamera
        }
      },
      {
        path: "/address_book",
        name: "AddressBook",
        component: () => import("@/views/AddressBook/AddressBook.vue"),
         meta: {
          name: "通讯录",
          icon: Memo
        }
      },
      {
        path: "/record",
        name: "Record",
        component: () => import("@/views/Record/Record.vue"),
         meta: {
          name: "录制",
          icon: VideoPlay
        }
      },
      {
        path: "/setting",
        name: "Setting",
        component: () => import("@/views/Settings/Settings.vue")
      }
    ]
  },
  {
    path: "/quickmeeting",
    name: "QuickMeeting",
    component: () => import("@/views/Meeting/QuickMeeting/QuickMeeting.vue")
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: (to, from , savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  },
  routes: routerList
})