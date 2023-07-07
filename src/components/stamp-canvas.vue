<template>
  <a-row style="width: auto;height: 100vh;flex-flow: nowrap;overflow: hidden">
    <a-col :span="12" style="border-right: 1px solid #000;padding: 20px;overflow: auto;height: 100%;">
      <a-space direction="vertical" align="center" style="width: 100%;" :size="20">
        <div>
          <div style="display: flex">
            <a-input type="text" ref="textRepeatInput"></a-input>
            <a-button @click="shira.appendRepeatText($refs.textRepeatInput.$el.value,index++)">
              添加平铺文字
            </a-button>
          </div>
          <div style="display: flex">
            <a-input type="text" ref="textInput"></a-input>
            <a-button @click="shira.appendText([$refs.textInput.$el.value,$refs.textInput.$el.value],index++)"> 添加文字</a-button>
          </div>
          <div style="display: flex" v-show="content[d]">
            <a-input type="text" @change="$refs.tela.editText(()=>content[d] = $event.target.value)"
                     :value="content[d]"></a-input>
            <span> 编辑文字 </span>
          </div>
        </div>
        <div style="display: flex">
          <div class="stamp-uplaod" @click="fileInput.click()" @change="fileInputChange">
            <input type="file" hidden ref="fileInput">
            <div class="stamp-border" v-show="!stampUrl">
              <span> 上传图片 </span>
            </div>
            <img :src="stampUrl" alt="" v-show="stampUrl" style="max-height:200px;max-width: 300px ">
          </div>
          <a-button @click="shira.appendStamp(stampUrl, index++)"> 添加图片</a-button>
        </div>
        <div>
          <a-select :value="fontFamily[d]" @change="shira.editText(()=>fontFamily[d] = $event)">
            <a-select-option value="微软雅黑"></a-select-option>
            <a-select-option value="宋体"></a-select-option>
            <a-select-option value="黑体"></a-select-option>
            <a-select-option value="楷体"></a-select-option>
            <a-select-option value="仿宋"></a-select-option>
          </a-select>
          <a-select :value="fontStyle[d]" @change="shira.editText(()=>fontStyle[d] = $event)">
            <a-select-option value="normal"> 正常</a-select-option>
            <a-select-option value="italic"> 斜体</a-select-option>
            <a-select-option value="oblique"> 倾斜</a-select-option>
          </a-select>
          <a-select :value="fontSize[d]" @change="shira.editText(()=>fontSize[d] = $event)">
            <a-select-option value="12">12</a-select-option>
            <a-select-option value="14">14</a-select-option>
            <a-select-option value="16">16</a-select-option>
          </a-select>
        </div>
        <editer-option v-model:value="stampOpicity[d]" :min="0" :max="1" step="0.1"
                       @update:value="shira.editText()"
                       :disabled="!stamp[d]" label="透明度" :precision="1">
        </editer-option>
        <editer-option v-model:value="fontSize[d]" :min="0" :max="48" :key="maxScale"
                       @update:value="shira.editText()"
                       :disabled="!stamp[d]" label="字体" :precision="0">
        </editer-option>
        <editer-option v-model:value="stampRotate[d]" :min="0" :max="360"
                       @update:value="shira.editText()"
                       :disabled="!stamp[d]" label="旋转" :precision="0">
        </editer-option>
        <editer-option v-model:value="stampMarginTop[d]" @update:value="shira.editText()" :min="0"
                       :max="props.size?.width"
                       :precision="0" label="纵向间距" :disabled="stampClass[d]!=='repeat'">
        </editer-option>
        <editer-option v-model:value="stampMarginLeft[d]" @update:value="shira.editText()" :min="0"
                       :max="props.size?.width"
                       :precision="0" label="横向间距" :disabled="stampClass[d]!=='repeat'">
        </editer-option>
        <editer-option v-model:value="stampX[d]" :min="0" :max="props.size?.width-stampWidth[d]"
                       :disabled="stampWidth[d]>=props.size?.width||!stamp[d]" label="X 轴"
                       :precision="0">
        </editer-option>
        <editer-option v-model:value="stampY[d]" :min="0" :max="props.size?.height-stampHeight[d]"
                       :disabled="stampHeight[d]>=props.size?.height||!stamp[d]" :precision="0"
                       label="Y 轴">
        </editer-option>
        <editer-option v-if="shira" v-model:value="shira.stampList.stampWidth[d]" :min="0" :max="props.size?.width-1"
                       :precision="0" label="宽度" :disabled="!shira.stampList.stamp[d]">
        </editer-option>
        <editer-option v-model:value="stampHeight[d]" :min="0" :max="props.size?.height-1"
                       :precision="0" label="高度" :disabled="!stamp[d]">
        </editer-option>
        <div style="display: flex;align-items: center">
          <span style="width: 60px; text-align: right;margin-right: 10px"> 缩放 </span>
          <a-slider v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1"
                    :disabled="!stamp[d]"/>
          <a-input-number v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1" :precision="1"
                          style="margin-left: 16px" :disabled="!stamp[d]"/>
        </div>
        <!--				<a-button @click="appendStamp(stampUrl,tela)">-->
        <!--					添加签章 -->
        <!--				</a-button>-->
        <a-button v-if="$refs.tela" @click="test()"> 测试</a-button>
      </a-space>
    </a-col>
    <a-col :span="12"
           style="width: auto;height: 100%;position: relative;display: flex;justify-content: center;align-items: center;">
      <div ref="tela"
           style="overflow: hidden;position: absolute;border: 1px #000 solid"
           :style="{width:props.size?.width+'px',height:props.size?.height+'px'}">
      </div>
      <!--        <span ref="measure" :style="textSize" style="position: absolute;visibility:hidden;">{{content[d] }}</span>-->
      <!--			<canvas-main :size="props.size" :canvas="$refs.tela"-->
      <!--			             :stampDrag="stampDrag" :stampClick="stampClick"></canvas-main>-->
    </a-col>
  </a-row>
  <a-drawer
      title="Basic Drawer"
      placement="right"
      :closable="false"
      v-model:visible="visible"
      width="50%"
      :drawerStyle="{zIndex:9999999999999999999}"
  >
    <img :src="src" ref="mask" :style="{width:props.size.width+'px',height:props.size.height+'px'}">
  </a-drawer>
</template>

<script setup>
import stampRender from './canvas-main.js'
import {computed, nextTick, onMounted, reactive, ref, toRaw, watch, useSlots, defineComponent, toRefs} from 'vue';
import EditerOption from "@/components/editer-option.vue";
// import CanvasMain from "@/components/canvas-main.vue";

const props = defineProps(['canvas', 'size'])
const visible = ref(false)
const src = ref('')
const intX = ref(0)
const intY = ref(0)
const shira = ref()
// const dragX=ref(0)
// const dragY=ref(0)
const canvas = ref()
const scale = ref(1)
const transform = computed(() => `scale(${scale.value})`)
const tela = ref()
const fileInput = ref()
const textInput = ref()
const measure = ref()
const stampUrl = ref()
onMounted(() => {
  shira.value = stampRender({
    size: props.size,
    canvas: tela.value,
    stampDrag,
    stampClick,
  })
})
watch(props, () => {
  tela.value.appendChild(props.canvas)
  const max = Math.min(750 / props.size.width, 900 / props.size.height)
  if (max < 1) scale.value = max
  // tela.value.style.transform = transform.value
}, {deep: true})

const stampList = reactive({
  stamp: [],
  stampX: [],
  stampY: [],
  stampWidth: [],
  stampHeight: [],
  stampWidthCache: [],
  stampHeightCache: [],
  stampScale: [],
  stampOpicity: [],
  stampScaleCache: [],
  content: [],
  stampClass: [],
  stampRotate: [],
  fontSize: [],
  fontFamily: [],
  fontStyle: [],
  stampMarginTop: [],
  stampMarginLeft: []
})
const {
  stamp,
  stampX,
  stampY,
  stampWidth,
  stampHeight,
  stampScale,
  stampOpicity,
  content,
  stampClass,
  stampRotate,
  fontSize,
  fontFamily,
  fontStyle,
  stampMarginTop,
  stampMarginLeft
} = stampList
const index = ref(0)
const d = ref(0)
const maxScale = ref(1)
const stampDrag = (e, i) => {
  // stampX[d.value]=e[i].stampX
  // stampY[d.value]=e[i].stampY
}
const stampClick = (i) => {
  d.value = i
}
const test = async () => {
  src.value = await tela.value.test();
  visible.value = true
}
// watch(props, () => {
//     tela.value.appendChild(props.canvas)
//     const max = Math.min(750 / props.size.width, 900 / props.size.height)
//     if (max < 1) scale.value = max
//     tela.value.style.transform = transform.value
// }, {deep: true})
// onMounted(()=> tela.value = (useSlots().default()[0]))
// onMounted(()=> tela.value = (useSlots().default()[0]))
const toBase64 = (i) => {
  const canvas = document.createElement("canvas");
  canvas.width = i.width;
  canvas.height = i.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(i, 0, 0, i.width, i.height);
  // const ext = i.src.substring(i.src.lastIndexOf(".") + 1).toLowerCase();
  // console.log(ext)
  return canvas.toDataURL();
}

const textSize = computed(() => {
  return {
    fontFamily: 'Microsoft YaHei,serif',
    fontSize: fontSize[d.value] + 'px',
    fontStyle: fontStyle[d.value],
    transform: `rotate(${stampRotate[d.value]}deg)`
  }
})
// watch(stampScale, (val) => {
//     // console.log(a[d.value] -b[d.value])
//     if ((stampWidth[d.value] >= props.size.width || stampHeight[d.value] >= props.size.height)&& stampScale[d.value] > stampScaleCache[d.value]) return
//     stampWidth[d.value] *= val[d.value] / stampScaleCache[d.value]
//     stampHeight[d.value] *= val[d.value] / stampScaleCache[d.value]
//     stampScaleCache[d.value] = stampScale[d.value]
// }, {deep: true})
// watch(stampX, (val) => {
//     if (stampX[d.value] >= tela.value.clientWidth - stampWidth[d.value]) stampX[d.value] = tela.value.clientWidth - stampWidth[d.value]
//     if (stampX[d.value] <= 0)stampX[d.value] = 0
//     stamp[d.value] && (stamp[d.value].style.left = val[d.value] + "px")
//
// }, {deep: true})
// watch(stampY, (val) => {
//     // if (stampY[d.value] >= props.height - stampHeight[i]) stampY[d.value] = props.height - stampHeight[i]
//     if (stampY[d.value] >= tela.value.clientHeight - stampHeight[d.value]) stampY[d.value] = tela.value.clientHeight - stampHeight[d.value]
//     if (stampY[d.value] <= 0)stampY[d.value] = 0
//     stamp && (stamp[d.value].style.top = val[d.value] + "px")
// }, {deep: true})
// watch(stampWidth, () => {
//     stampWidth[d.value] >= props.size.width && (stampWidth[d.value] = props.size.width)
//     stampWidthCache[d.value] = stampWidth[d.value]
//     stamp[d.value].style.width = stampWidth[d.value] + 'px'
//
// }, {deep: true})
// watch(stampHeight, () => {
//     stampHeight[d.value] >= props.size.height && (stampHeight[d.value] = props.size.height)
//     stampHeightCache[d.value] = stampHeight[d.value]
//     stamp[d.value].style.height = stampHeight[d.value] + 'px'
// }, {deep: true})


const fileInputChange = (e) => {
  const file = new FileReader()
  file.readAsDataURL(e.target.files[0])
  // stampUrl.value = URL.createObjectURL(e.target.files[0])
  file.onloadend = () => {
    stampUrl.value = file.result
    // appendStamp(stampUrl.value, document.querySelector('.tela'), index.value++)
  }
}
</script>
<style lang="scss" scoped>
.ant-slider {
  width: 300px;
}

.stamp-uplaod {
  width: min-content;
  cursor: pointer;

  .stamp-border {
    width: 300px;
    height: 200px;
    border: 2px #b9b9b9 dashed;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      border: 2px #545454 dashed;
    }
  }

}

:deep(.active-stamp) {
  outline: 2px #000 dashed !important;
  backdrop-filter: brightness(90%);
}

//:deep(.stamp) {
//  &:focus {
//    outline: 2px #000 dashed !important;
//    backdrop-filter: brightness(90%);
//  }
//}

#annotation-layer {
  position: absolute;

  section {
    position: absolute;
    display: flex !important;
    align-items: center !important;

    div {
      white-space: pre;
      color: black;
      font-size: 12px !important;
      line-height: 1 !important;
    }
  }
}
</style>
