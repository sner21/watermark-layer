<template>
  <div id="home">
    <h1 style="color:#fff;text-align: center;"> 演示页面 </h1>
    <div id="canvas-con">
      <img src="test.jpg" alt="" style="display: block;" class="test-img">
    </div>
    <div id="config-con">
      <div>
        <a-button @click="appendMark"> 添加图片</a-button>
        <a-button @click="deleteMark"> 删除</a-button>
        <a-button @click="deleteBgMark"> 删除背景文本</a-button>
        <a-button @click="exportImage"> 导出图片</a-button>
        <a-button @click="exportMark"> 单独导出标识图层</a-button>
      </div>
      <div>
        <a-button @click="appendText"> 添加文本</a-button>
        <a-input v-model:value="text"/>
      </div>
      <div>
        <a-button @click="appendRepeatText"> 添加背景文本</a-button>
        <a-input v-model:value="repeatText" style="width: 200px;"/>
        <div class="title"> 角度</div>
        <a-input-number v-model:value="style.rotate" :min="0" :max="360"/>
        <div class="title">X 间距</div>
        <a-input-number v-model:value="style.marginTop" :min="0" :max="360"/>
        <div class="title">Y 间距</div>
        <a-input-number v-model:value="style.marginLeft" :min="0" :max="360"/>
      </div>
      <div>
        <div class="title"> 颜色</div>
        <a-select v-model:value="style.color">
          <a-select-option value="black"> 黑色</a-select-option>
          <a-select-option value="blue"> 蓝色</a-select-option>
          <a-select-option value="pink"> 粉色</a-select-option>
          <a-select-option value="white"> 白色</a-select-option>
        </a-select>
        <div class="title"> 字体</div>
        <a-select v-model:value="style.fontFamily">
          <a-select-option value="微软雅黑"></a-select-option>
          <a-select-option value="宋体"></a-select-option>
          <a-select-option value="黑体"></a-select-option>
        </a-select>
        <div class="title"> 字号</div>
        <a-input-number v-model:value="style.fontSize"/>
        <div class="title"> 透明度</div>
        <a-input-number v-model:value="style.opicity"/>
      </div>
    </div>
  </div>
</template>
<script setup>
import markRender from '../../package/markLayer.js'
import {onMounted, reactive, ref} from "vue";

let markCon = null
const i = ref()
const text = ref('')
const repeatText = ref('')
const style = reactive({
  color: 'black',
  fontSize: 24,
  fontFamily: '微软雅黑',
  rotate: 0,
  opicity: 0.5,
  marginTop: 5,
  marginLeft: 5,
})

const exportMark = async () => {
  const url = await markCon.exportMark()
  const a = document.createElement('a')
  a.href = url
  a.download = "image.png";
  a.click()
}
const exportImage = async () => {
  const url = await markCon.exportImage()
  const a = document.createElement('a')
  a.href = url
  a.download = "mark.png";
  a.click()
}
const appendMark = () => {
  markCon.appendMark('logo.png')
}
const deleteMark = () => {
  markCon.deleteMark(i.value,)
}
const deleteBgMark = () => {
  markCon.source.markClass.map(i => i === "repeat").forEach((i, k) => i && markCon.deleteMark(k))
}
const appendText = () => {
  markCon.appendText(text.value, style)
}
const appendRepeatText = () => {
  markCon.appendRepeatText(repeatText.value, style)
}
onMounted(() => {
  document.querySelector('.test-img').addEventListener('load', () => {
    markCon = markRender({
      target: document.querySelector('#canvas-con'), // 需要转换的目标容器 (必需项)
      activeClass: 'active-class', // 被选中印记的类名
      zIndex: 1000, // 容器图层的层级
      markClick(index) {
        i.value = index
      },
      markDrag(index) {
       console.log(index)
      }
    })
  })
})

</script>
<style lang="scss" scoped>
#home {
  display: flex;
  flex-direction: column;

  h1 {
    margin: 20px 0;
  }

  #canvas-con {
    width: max-content;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    height: 510px;

    > img {
      height: 100%;
    }
  }

  #config-con {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 350px;

    .title {
      min-width: 45px;
      color: white;
      line-height: 30px;
      font-size: 15px;
      text-align: center;
    }

    > div {
      display: flex;
      width: 40%;

      > * {
        margin: 10px;
      }
    }
  }
}

:deep(.active-class) {
  outline: 2px rgba(0, 0, 0, 0.64) dashed !important;
}

</style>
