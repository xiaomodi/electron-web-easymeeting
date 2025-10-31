<template>
  <div class="meeting_wrapper">
    <div class="meeting_left">
      <div class="meeting_left_content">
        <JoinMeeting />
        <QuickMeeting />
        <div class="meeting_left_content_item" @mouseover="handleOnmouseOver('reserve')" @mouseleave="handleOnmouseLeave('reserve')">
          <div class="meeting_left_content_item_icon">
            <img v-show="reserveAction === ''" src="./iconfont/duigou.png" style="width: 30px;" alt="">
            <img v-show="reserveAction === 'reserve'" src="./iconfont/yudinghuiyi.png" style="width: 30px;" alt="">
          </div>
          预定会议
        </div>
        <ShareScreenMeeting />
      </div>
    </div>
    <div class="meeting_right">
      <div class="meeting_right_content_top">
        <div class="meeting_right_content">
           <h2>{{ month }}月{{ day }}日</h2>
           <div class="week_content">
            <div class="week">
              {{ getDay }}
              <div class="more_meeting" @click="handleClickAll">
                全部会议
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <el-divider />
          </div>
        </div>
      </div>
      <div class="meeting_right_content_bottom">
        <div class="meeting_right_content_empty">
          <el-empty v-if="!meetingList.length" description="暂无会议" />
        </div>
      </div>
    </div>
  </div>

 
</template>

<script lang='ts' setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue' 
import JoinMeeting from './JoinMeeting/JoinMeeting.vue'
import QuickMeeting from './QuickMeeting/QuickMeeting.vue'
import ShareScreenMeeting from './ShareScreenMeeting/ShareScreenMeeting.vue'

const router = useRouter()

const addAction = ref<string>("");
const quickAction = ref<string>("");
const reserveAction = ref<string>("");
const shareAction = ref<string>("");
const month = ref<number>(1);
const day = ref<number>(1);
const week = ref<number>(0)
let dateInterval = ref<NodeJS.Timeout | null>()
const meetingList = ref<any[]>([])

onMounted(() => {
  initDate()
  getDate()
})

onUnmounted(() => {
  clearInterval(dateInterval.value!)
})

const getDay = computed<string>(() => {
  switch(week.value) {
    case 0:
      return "周日";
    case 1:
      return "周一";
    case 2:
      return "周二";
    case 3:
      return "周三";
    case 4:
      return "周四";
    case 5:
      return "周五";
    case 6:
      return "周六";
    default:
      return "";
  }
})

function initDate(): void {
  const date = new Date();
  month.value = date.getMonth() + 1;
  day.value = date.getDate();
  week.value = date.getDay();
}

function getDate(): void {
  dateInterval.value = setInterval(() => {
   initDate()
  }, 1000)
}

function handleOnmouseOver(item: string) {
  switch(item) {
    case "add":
      addAction.value = 'add';
      break;
    case "quick":
      quickAction.value = 'quick';
      break;
    case "reserve":
      reserveAction.value = 'reserve';
      break;
    case "share":
      shareAction.value = 'share';
      break;
  }
}

function handleOnmouseLeave(item: string) {
  switch(item) {
    case "add":
      addAction.value = '';
      break;
    case "quick":
      quickAction.value = '';
      break;
    case "reserve":
      reserveAction.value = '';
      break;
    case "share":
      shareAction.value = '';
      break;
  }
}

function handleClickAll() {
  console.log("全部会议")
}


</script>

<style lang="scss" scoped>
.meeting_wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  .meeting_left {
    flex: 4;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #f0f2f5;
    box-sizing: border-box;
    .meeting_left_content {
      width: 230px;
      height: 250px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      // grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));  //这种属于grid自适应，如果宽度不够，会自动换行
      gap: 20px;
      padding: 10px;
      box-sizing: border-box;
      .meeting_left_content_item {
        -webkit-app-region: no-drag;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 14px;
        overflow: hidden;
        .meeting_left_content_item_icon {
          width: 66px;
          height: 66px;
          border-radius: 15px;
          background-color: var(--main-color);
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 37px;
          }
        }
      }
    }
  }
  .meeting_right {
    flex: 6;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
    .meeting_right_content_top {
      width: 80%;
      flex: 4.5;
      position: relative;
      .meeting_right_content {
        width: 100%;
        height: 80px;
        position: absolute;
        left: 0;
        bottom: 0;
        &:deep(.el-divider--horizontal) {
          margin: 0;
        }
        h2 {
          font-size: 27px;
          font-weight: 500;
          margin-bottom: 15px;
        }
        .week_content {
          width: 100%;
          .week {
            width: 100%;
            height: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            margin-bottom: 5px;
            .more_meeting {
              -webkit-app-region: no-drag;
              padding: 2px 2px 2px 5px;
              box-sizing: border-box;
              border-radius: 5px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #606266;
              background: var(--background-color-light);
              &:hover {
                cursor: pointer;
                background: var(--background-color-dark-hover);
              }
            }
          }
        }
      }
    }
    .meeting_right_content_bottom {
      width: 80%;
      flex: 5.5;
      &:deep(.el-empty) {
        padding: 0;
        --el-empty-image-width: 100px;
      }
      .meeting_right_content_empty {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>