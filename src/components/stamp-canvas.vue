<template>
	<a-row style="width: 1920px;height: 100vh;">
		<a-col :span="12" style="border-right: 1px solid #000;padding: 20px;">
			<a-space direction="vertical" align="center" style="width: 100%;" :size="20">
				<div>
					<div style="display: flex">
						<a-input type="text" ref="textRepeatInput"></a-input>
						<a-button @click="appendRepeatText($refs.textRepeatInput.$el.value,tela,index++)">
							添加平铺文字
						</a-button>
					</div>
					<div style="display: flex">
						<a-input type="text" ref="textInput"></a-input>
						<a-button @click="appendText($refs.textInput.$el.value,tela,index++)">添加文字</a-button>
					</div>
					<div style="display: flex" v-show="content[d]">
						<a-input type="text" @change="editText(()=>content[d] = $event.target.value)"
						         :value="content[d]"></a-input>
						<span>编辑文字</span>
					</div>
				</div>
				<div style="display: flex">
					<div class="stamp-uplaod" @click="fileInput.click()" @change="fileInputChange">
						<input type="file" hidden ref="fileInput">
						<div class="stamp-border" v-show="!stampUrl">
							<span>上传图片</span>
						</div>
						<img :src="stampUrl" alt="" v-show="stampUrl" style="max-height:200px;max-width: 300px ">
					</div>
					<a-button @click="appendStamp(stampUrl, tela, index++)">添加图片</a-button>
				</div>
				<div>
					<a-select :value="fontFamily[d]" @change="editText(()=>fontFamily[d] = $event)">
						<a-select-option value="微软雅黑"></a-select-option>
						<a-select-option value="宋体"></a-select-option>
						<a-select-option value="黑体"></a-select-option>
						<a-select-option value="楷体"></a-select-option>
						<a-select-option value="仿宋"></a-select-option>
					</a-select>
					<a-select :value="fontStyle[d]" @change="editText(()=>fontStyle[d] = $event)">
						<a-select-option value="normal">正常</a-select-option>
						<a-select-option value="italic">斜体</a-select-option>
						<a-select-option value="oblique">倾斜</a-select-option>
					</a-select>
					<a-select :value="fontSize[d]" @change="editText(()=>fontSize[d] = $event)">
						<a-select-option value="12">12</a-select-option>
						<a-select-option value="14">14</a-select-option>
						<a-select-option value="16">16</a-select-option>
					</a-select>
				</div>

				<editer-option v-model:value="stampOpicity[d]" :min="0" :max="1" step="0.1"
				               @update:value="editText()"
				               :disabled="!stamp[d]" label="透明度" :precision="1">
				</editer-option>
				<editer-option v-model:value="fontSize[d]" :min="0" :max="48" :key="maxScale"
				               @update:value="editText()"
				               :disabled="!stamp[d]" label="字体" :precision="0">
				</editer-option>
				<editer-option v-model:value="stampRotate[d]" :min="0" :max="360"
				               @update:value="editText()"
				               :disabled="!stamp[d]" label="旋转" :precision="0">
				</editer-option>
				<editer-option v-model:value="stampMarginTop[d]" @update:value="editText()" :min="0"
				               :max="props.size?.width"
				               :precision="0" label="纵向间距" :disabled="stampClass[d]!=='repeat'">
				</editer-option>
				<editer-option v-model:value="stampMarginLeft[d]" @update:value="editText()" :min="0"
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
				<editer-option v-model:value="stampWidth[d]" :min="0" :max="props.size?.width"
				               :precision="0" label="宽度" :disabled="!stamp[d]||content[d]">
				</editer-option>
				<editer-option v-model:value="stampHeight[d]" :min="0" :max="props.size?.height"
				               :precision="0" label="高度" :disabled="!stamp[d]||content[d]">
				</editer-option>
				<div style="display: flex;align-items: center">
					<span style="width: 60px; text-align: right;margin-right: 10px">缩放</span>
					<a-slider v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1"
					          :disabled="!stamp[d]"/>
					<a-input-number v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1" :precision="1"
					                style="margin-left: 16px" :disabled="!stamp[d]"/>
				</div>
				<!--				<a-button @click="appendStamp(stampUrl,tela)">-->
				<!--					添加签章-->
				<!--				</a-button>-->
				<a-button @click="test">测试</a-button>
			</a-space>
		</a-col>
		<a-col :span="12" style="display:flex;justify-content: center;align-items: center;">
			<div ref="tela" style="width: fit-content;height:fit-content;overflow: hidden;display: flex">
			</div>
		</a-col>
		<span ref="measure" :style="textSize" style="position: absolute;visibility:hidden;">{{ content[d] }}</span>

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
import {computed, nextTick, onMounted, reactive, ref, toRaw, watch, useSlots, defineComponent, toRefs} from 'vue';
import EditerOption from "@/components/editer-option.vue";

const props = defineProps(['canvas', 'size'])
const visible = ref(false)
const src = ref('')
const intX = ref(0)
const intY = ref(0)
// const dragX=ref(0)
// const dragY=ref(0)


const scaleX = ref(1)
const scaleY = ref(1)
const transform = computed(() => `scaleX(${scaleX.value}) scaleY(${scaleY.value})`)
const tela = ref()
const fileInput = ref()
const textInput = ref()
const measure = ref()
const stampUrl = ref()
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
    stampWidthCache,
    stampHeightCache,
    stampScale,
    stampOpicity,
    stampScaleCache,
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
const d = ref(null)
const dragSwitch = ref(false)
const maxScale = ref(1)
const pre = ref()
watch(props, () => {
    tela.value.appendChild(props.canvas)
    props.canvas.style.transform = transform.value
    scaleX.value = 800 / props.size.width
    scaleY.value = 1000 / props.size.height
    if (scaleX.value < 1) {
        scaleX.value = 800 / props.size.width
    }
    if (scaleY.value < 1) {
        scaleY.value = 1000 / props.size.height
    }
}, {deep: true})
// onMounted(() => tela.value = (useSlots().default()[0]))
// onMounted(() => tela.value = (useSlots().default()[0]))
const test = () => {
    const str = stamp.map((i, k) => {
        const canvas = document.createElement("canvas");
        canvas.width = i.width;
        canvas.height = i.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(i, 0, 0, i.width, i.height);
        const ext = i.src.substring(i.src.lastIndexOf(".") + 1).toLowerCase();
        const dataURL = canvas.toDataURL("image/" + ext);
        // const str = i.src.replaceAll('data:image/svg+xml,', '')
        // svg.innerHTML=str
        return (`<div  style="width:${stampWidth[k]}px; height:${stampHeight[k] +
        'px'};left:${stampX[k]}px; top:${stampY[k]}px;position: absolute;" >` + `<img src="${dataURL}"/>` + "</div>")
    }).join('')
    src.value = ("data:image/svg+xml," + `<svg xmlns='http://www.w3.org/2000/svg' width='${props.size.width}' height='${props.size.height}'>` +
        "<foreignObject width='100%' height='100%'>" + "<div xmlns='http://www.w3.org/1999/xhtml'>" +
        str + "</div>" + "</foreignObject>" + "</svg>")
    visible.value = true
}
const textSize = computed(() => {
    return {
        fontFamily: 'Microsoft YaHei,serif',
        fontSize: fontSize[d.value] + 'px',
        fontStyle: fontStyle[d.value],
        transform: `rotate(${stampRotate[d.value]}deg)`
    }
})
watch(stampScale, (val) => {
    // console.log(a[d.value] -b[d.value])
    if ((stampWidth[d.value] >= props.size.width || stampHeight[d.value] >= props.size.height) && stampScale[d.value] > stampScaleCache[d.value]) return
    stampWidth[d.value] *= val[d.value] / stampScaleCache[d.value]
    stampHeight[d.value] *= val[d.value] / stampScaleCache[d.value]
    stampScaleCache[d.value] = stampScale[d.value]
}, {deep: true})
watch(stampX, (val) => {
    if (stampX[d.value] >= tela.value.clientWidth - stampWidth[d.value]) stampX[d.value] = tela.value.clientWidth - stampWidth[d.value]
    if (stampX[d.value] <= 0) stampX[d.value] = 0
    stamp[d.value] && (stamp[d.value].style.left = val[d.value] + "px")

}, {deep: true})
watch(stampY, (val) => {
    // if (stampY[d.value] >= props.height - stampHeight[i]) stampY[d.value] = props.height - stampHeight[i]
    if (stampY[d.value] >= tela.value.clientHeight - stampHeight[d.value]) stampY[d.value] = tela.value.clientHeight - stampHeight[d.value]
    if (stampY[d.value] <= 0) stampY[d.value] = 0
    stamp && (stamp[d.value].style.top = val[d.value] + "px")
}, {deep: true})
watch(stampWidth, () => {
    stampWidth[d.value] >= props.size.width && (stampWidth[d.value] = props.size.width)
    stampWidthCache[d.value] = stampWidth[d.value]
    stamp[d.value].style.width = stampWidth[d.value] + 'px'

}, {deep: true})
watch(stampHeight, () => {
    stampHeight[d.value] >= props.size.height && (stampHeight[d.value] = props.size.height)
    stampHeightCache[d.value] = stampHeight[d.value]

    stamp[d.value].style.height = stampHeight[d.value] + 'px'

}, {deep: true})

const editText = async (fallback = new Function()) => {
    fallback()
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    switch (stampClass[d.value]) {
        case 'text': {
            const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${rect.width}px" style="transform: rotate(${stampRotate}deg)" opacity="${stampOpicity}"  height="${rect.height}px"><text x="0"   y="${rect.height / 2}" fill="black" dominant-baseline="Central" font-size="${fontSize[d.value]}px" font-style="${fontStyle[d.value]}"  font-family="${fontFamily[d.value]}" >${content[d.value]}</text></svg>`
            stampWidth[d.value] = rect.width
            stampHeight[d.value] = rect.height
            stamp[d.value].src = "data:image/svg+xml," + str
            stamp[d.value].style.transform = 'scale(1)'
        }
            break
        case 'repeat': {
            const width = props.size.width
            const height = props.size.height
            const numX = width / (rect.width + stampMarginLeft[d.value])
            const numY = height / (rect.height + stampMarginTop[d.value])
            const list = []
            for (let j = 0; j <= numX + 5; j++) {
                for (let k = 0; k <= numY + 5; k++) {
                    list.push(`<text transform="rotate(${stampRotate[d.value]},${rect.width * (j - 2)},${rect.height / 2 + (k - 2) * rect.height})"    x="${(rect.width + stampMarginLeft[d.value]) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d.value])}"  fill="black"  dominant-baseline="Central"   font-size="${fontSize[d.value]}px"  font-style="${fontStyle[d.value]}"  font-family="${fontFamily[d.value]}">${content[d.value]}</text>`)
                }
            }
            const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${stampOpicity}"  width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
            stamp[d.value].src = "data:image/svg+xml," + str
            stamp[d.value].style.transform = 'scale(1)'
        }
            break
    }


}
const registerEvent = (el, pre, stamp, i) => {
    stamp.forEach(i => i.classList.remove('active-stamp'))
    stampClass[i] !== 'repeat' && stamp[i].classList.add('active-stamp')
    stamp[i].addEventListener('mousedown', function () {
        stamp.forEach(i => i.classList.remove('active-stamp'))
        stampClass[i] !== 'repeat' && stamp[i].classList.add('active-stamp')
        d.value = i
    })
    el.addEventListener('mousedown', function (e) {
        stamp[i].style.pointerEvents = 'none'
        pre.style.pointerEvents = 'all';
        (e.target === stamp[i]) && (dragSwitch.value = true)
        intX.value = e.layerX
        intY.value = e.layerY
    })
    pre.addEventListener('mousemove', (e) => {
        e.stopPropagation()
        if (dragSwitch.value && e.target === pre && d.value === i) {
            stampX[i] = e.layerX - intX.value
            stampY[i] = e.layerY - intY.value
        }
    })
    document.addEventListener('click', (e) => {
        e.stopPropagation()
        if (e.target !== pre && d.value === null) {
            d.value = stamp.length + 1
            stamp.forEach(i => i.classList.remove('active-stamp'))
        }
    })
    document.addEventListener('mouseup', function (e) {
        stamp[i].style.pointerEvents = 'all'
        // pre.style.pointerEvents = 'none'
        dragSwitch.value = false
    })
}
const createPre = (el) => {
    !pre.value && (pre.value = document.createElement('div'))
    pre.value.style.height = el.clientHeight + 'px'
    pre.value.style.width = el.clientWidth + 'px'
    pre.value.style.zIndex = 999
    pre.value.style.position = 'absolute'
    pre.value.style.top = pre.value.style.left = '0'
    pre.value.style.pointerEvents = 'none'
    el.append(pre.value)
    pre.value.addEventListener('wheel', function (e) {
        e.preventDefault()
        if (content[d.value] || (stampWidth[d.value] >= props.size.width || stampHeight[d.value] >= props.size.height) && e.deltaY < 0) return
        stampScale[d.value] -= e.deltaY / 10000 * 5
    })
    return pre
}
const appendRepeatText = async (text, el, i, x = 0, y = 0, scale = 1) => {
    const pre = createPre(el)
    stamp.push(document.createElement('img'))
    content.push(text)
    stampScale.push(scale)
    stampClass.push('repeat')
    stampScaleCache.push(scale)
    fontSize.push('14')
    fontFamily.push('微软雅黑')
    fontStyle.push('normal')
    stampOpicity.push(0.5)
    stampRotate.push(0)
    stampMarginTop.push(0)
    stampMarginLeft.push(0)
    stampX.push(x)
    stampY.push(y)
    d.value = i
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    const width = el.offsetWidth
    const height = el.offsetHeight
    stampWidth[i] = width
    stampHeight[i] = height
    const numX = width / rect.width
    const numY = height / rect.height
    const list = []
    for (let j = 0; j < numX; j++) {
        for (let k = 0; k < numY; k++) {
            list.push(`<text x="${rect.width * j}"  y="${rect.height / 2 + k * rect.height}" fill="black"  dominant-baseline="Central" font-size="14px" font-style="normal">` + text + '</text>')
        }
    }
    const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${stampOpicity}"  width="${width}px"  height="${height + rect.height / 2}px">`
        + list.map(i => i) +
        '</svg>'
    stamp[i].src = "data:image/svg+xml," + str
    el.style.position = 'relative'
    stamp[i].style.width = width + 'px'
    stamp[i].style.height = height + 'px'
    stamp[i].style.position = 'absolute'
    stamp[i].style.top = stamp[i].style.left = '0'
    stamp[i].style.cursor = 'pointer'
    stamp[i].draggable = false
    // stamp[i].tabIndex = -1
    stamp[i].style.pointerEvents = 'all'
    // stamp[i].classList.add('stamp')
    // registerEvent(el, pre.value, stamp, i)
    maxScale.value = 1
    pre.value.append(stamp[i])
}

const appendText = async (text, el, i, x = 0, y = 0, scale = 1) => {
    const pre = createPre(el)
    stamp.push(document.createElement('img'))
    content.push(text)
    stampClass.push('text')
    stampScale.push(scale)
    stampScaleCache.push(scale)
    fontSize.push('14')
    fontFamily.push('微软雅黑')
    fontStyle.push('normal')
    stampOpicity.push(0.5)
    stampRotate.push(0)
    stampX.push(x)
    stampY.push(y)
    d.value = i
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    stampWidth[i] = rect.width
    stampHeight[i] = rect.height
    const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${stampOpicity}"  width="${rect.width}px"  height="${rect.height}px">` +
        `<text x="0"  y="${rect.height / 2}" fill="black"  dominant-baseline="Central" font-size="14px" font-style="normal">` + text +
        '</text></svg>'
    stamp[i].src = "data:image/svg+xml," + str
    el.style.position = 'relative'
    stamp[i].style.width = rect.width + 'px'
    stamp[i].style.height = rect.height + 'px'
    stamp[i].style.position = 'absolute'
    stamp[i].style.top = stamp[i].style.left = '0'
    stamp[i].style.cursor = 'pointer'
    stamp[i].draggable = false
    stamp[i].tabIndex = -1
    stamp[i].style.pointerEvents = 'all'
    stamp[i].classList.add('stamp')
    registerEvent(el, pre.value, stamp, i)
    maxScale.value = +Math.min(props.size.width / stampWidth[i], props.size.height / stampHeight[i]).toFixed(1)
    pre.value.append(stamp[i])
}
const appendStamp = (url, el, i) => {
    // content.push(url)
    const pre = createPre(el)
    stampClass.push('img')
    stamp.push(document.createElement('img'))
    stampScale.push(1)
    stampScaleCache.push(1)
    stampX.push(0)
    stampY.push(0)
    d.value = i
    stampWidth[i] = 300
    stampHeight[i] = 200
    stampOpicity.push(0.5)
    stampRotate.push(0)
    stamp[i].src = url
    stamp[i].style.width = stampWidth[i] + 'px'
    stamp[i].style.height = stampHeight[i] + 'px'
    el.style.position = 'relative'
    stamp[i].style.position = 'absolute'
    stamp[i].style.top = stamp[i].style.left = '0'
    stamp[i].style.cursor = 'pointer'
    stamp[i].style.zIndex = 999999
    stamp[i].draggable = false
    stamp[i].tabIndex = -1
    stamp[i].classList.add('stamp')
    registerEvent(el, pre.value, stamp, i)
    maxScale.value = +Math.min(props.size.width / stampWidth[i], props.size.height / stampHeight[i]).toFixed(1)
    pre.value.append(stamp[i])
}

const fileInputChange = (e) => {
    const file = new FileReader()
    file.readAsDataURL(e.target.files[0])
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
