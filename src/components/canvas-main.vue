<template>
	<div ref="tela"
	     style="overflow: hidden;position: absolute;border: 1px #000 solid"
	     :style="{width:props.size?.width+'px',height:props.size?.height+'px'}">
	</div>
	<span ref="measure" :style="textSize" style="position: absolute;visibility:hidden;">{{ content[d] }}</span>
</template>

<script setup>
import {
    computed,
    nextTick,
    onMounted,
    reactive,
    ref,
    toRaw,
    watch,
    useSlots,
    defineComponent,
    toRefs,
    defineExpose
} from 'vue';

const props = defineProps(['canvas', 'size', 'stampList', 'stampDrag', 'stampClick'])
const intX = ref(0) //签章点击的初始坐标
const intY = ref(0)
// const dragX=ref(0)
// const dragY=ref(0)

const scale = ref(1)
const transform = computed(() => `scale(${scale.value})`) //缩放比率的样式
const tela = ref()  // 主体ref
const measure = ref()  //比对字段ref
const stampUrl = ref() //上传图片框的URL
const stampList = props.stampList
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
const stampWidthCache = reactive([])
const stampHeightCache = reactive([])
const stampScaleCache = reactive([])
const d = ref(null) //当前选中的序号
const dragSwitch = ref(false) //拖动锁
const maxScale = ref(1) //缩放值
const pre = ref() //蒙版ref
watch(props, () => {
    tela.value.appendChild(props.canvas)
    const max = Math.min(750 / props.size.width, 900 / props.size.height)
    if (max < 1) scale.value = max
    tela.value.style.transform = transform.value

}, {deep: true})

const toBase64 = (i) => {
    const canvas = document.createElement("canvas");
    canvas.width = i.width;
    canvas.height = i.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(i, 0, 0, i.width, i.height);
    // const ext = i.src.substring(i.src.lastIndexOf(".") + 1).toLowerCase();
    return canvas.toDataURL();
}
const test = async () => {
    const str = stamp.map((i, k) => {
        if (i.src.includes('data:image/svg+xml,')) {
            const src = i.src.replace('data:image/svg+xml,', '')
            return (`<svg style="width:${stampWidth[k]}px; height:${stampHeight[k]}px;left:${stampX[k]}px; top:${stampY[k]}px;position: absolute;">${src}</svg>`)
        } else {
            const dataURL = toBase64(i)
            return (`<div style="width:${stampWidth[k]}px;height:${stampHeight[k]}px;left:${stampX[k]}px; top:${stampY[k]}px;position: absolute;" ><img src="${dataURL}"/></div>`)
            // return (`<image href='${dataURL}' x='${stampX[k]}' y='${stampY[k]}' height='${stampHeight[k]}' width='${stampWidth[k]}px' />`)
        }
    }).join('')
    const src = (`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${props.size.width}' height='${props.size.height}'><foreignObject width='100%' height='100%'><div xmlns='http://www.w3.org/1999/xhtml'>${str}</div></foreignObject></svg>`)
    // const src = (`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${props.size.width}' height='${props.size.height}'>${str}</svg>`)
    const file = new FileReader()
    const response = await fetch(src)
    const data = await response.blob();
    file.readAsDataURL(data)
    await new Promise(resolve => file.onloadend=()=> resolve())
    return file.result
    // await  fetch(src).then(function(response) {
    //     return response.blob();
    // }).then(function(data) {
    //     file.readAsDataURL( data)
    //     file.onloadend = () => {
    //         return file.result
    //     }
    // }).catch(function(e) {
    //     console.log("Oops, error");
    // });
}
const textSize = computed(() => { //比对字体的样式
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
    //TODO 最大值+1
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
            console.log(rect.width , stampMarginLeft[d.value])
            for (let j = 0; j <= numX + 5; j++) {
                for (let k = 0; k <= numY + 5; k++) {
                    list.push(`<text transform="rotate(${stampRotate[d.value]},${((rect.width + stampMarginLeft[d.value])) * (j - 2)},${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d.value])})"    x="${((rect.width + stampMarginLeft[d.value])) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d.value])}"  fill="black"  dominant-baseline="Central"   font-size="${fontSize[d.value]}px"  font-style="${fontStyle[d.value]}"  font-family="${fontFamily[d.value]}">${content[d.value]}</text>`)
                }
            }
            const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${stampOpicity}"  width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
            stamp[d.value].src = "data:image/svg+xml," + str
            // stamp[d.value].style.transform = transform.value
        }
            break
    }
}
const registerEvent = (el, pre, stamp, i) => {
    props.stampClick(i)
    stamp.forEach(i => i.classList.remove('active-stamp'))
    stampClass[i] !== 'repeat' && stamp[i].classList.add('active-stamp')
    stamp[i].addEventListener('mousedown', function () {
        stamp.forEach(i => i.classList.remove('active-stamp'))
        stampClass[i] !== 'repeat' && stamp[i].classList.add('active-stamp')
        d.value = i
    })
    el.addEventListener('mousedown', function (e) {
        props.stampClick(i)
        d.value=i
        stamp[i].style.pointerEvents = 'none'
        pre.style.pointerEvents = 'all';
        (e.target === stamp[i]) && (dragSwitch.value = true)
        intX.value = e.offsetX
        intY.value = e.offsetY
    })
    pre.addEventListener('mousemove', (e) => {

        e.stopPropagation()
        if (dragSwitch.value && e.target === pre && d.value === i) {
            stampX[i] = (e.offsetX - intX.value)
            stampY[i] = (e.offsetY - intY.value)
        }
        props.stampDrag(stampList, i)
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
    // pre.value.style.transform = transform.value
    pre.value.style.transformOrigin = 'left top'
    pre.value.style.top = pre.value.style.left = '0'
    pre.value.style.pointerEvents = 'none'
    el.append(pre.value)
    pre.value.addEventListener('wheel', function (e) {
        e.preventDefault()
        if (content[d.value] || (stampWidth[d.value] >= props.size.width || stampHeight[d.value] >= props.size.height) && e.deltaY < 0) return
        // if ( stampScale[d.value] - e.deltaY / 10000 * 5)
        stampScale[d.value] -= e.deltaY / 10000 * 5
    })
    return pre
}
const handleList=(text,kind)=> {
    stamp.push(document.createElement('img'))
    content.push(text)
    stampClass.push(kind)
    stampMarginTop.push(0)
    stampMarginLeft.push(0)
    stampScale.push(scale)
    stampScaleCache.push(scale)
    fontSize.push('14')
    fontFamily.push('微软雅黑')
    fontStyle.push('normal')
    stampOpicity.push(0.5)
    stampRotate.push(0)
    stampX.push(0)
    stampY.push(0)
}
const appendRepeatText = async (text, i) => {
    if(!text) return
    const el = tela.value
    const pre = createPre(el)
    d.value = i
    handleList(text,'repeat')
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    console.log(stampOpicity)
    const width = el.offsetWidth
    const height = el.offsetHeight
    stampWidth[i] = width - 1
    stampHeight[i] = height - 1
    const numX = width / rect.width
    const numY = height / rect.height
    const list = []
    for (let j = 0; j <= numX + 5; j++) {
        for (let k = 0; k <= numY + 5; k++) {
            list.push(`<text transform="rotate(${stampRotate[d.value]},${((rect.width + stampMarginLeft[d.value])) * (j - 2)},${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d.value])})"    x="${((rect.width + stampMarginLeft[d.value])) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d.value])}"  fill="black"  dominant-baseline="Central"   font-size="${fontSize[d.value]}px"  font-style="${fontStyle[d.value]}"  font-family="${fontFamily[d.value]}">${content[d.value]}</text>`)
        }
    }
    const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${stampOpicity[d.value]}"  width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
    stamp[i].src = "data:image/svg+xml," + str
    stamp[i].style.width = width + 'px'
    stamp[i].style.height = height + 'px'
    stamp[i].style.position = 'absolute'
    stamp[i].style.top = stamp[i].style.left = '0'
    stamp[i].style.cursor = 'pointer'
    stamp[i].draggable = false
    stamp[i].style.pointerEvents = 'all'
    maxScale.value = 1
    pre.value.append(stamp[i])
    // stamp[i].tabIndex = -1
    // stamp[i].classList.add('stamp')
    // registerEvent(el, pre.value, stamp, i)
}

const appendText = async (text, i) => {
    if(!text) return
    const el = tela.value
    const pre = createPre(el)
    handleList(text,'text')
    d.value = i
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    stampWidth[i] = rect.width
    stampHeight[i] = rect.height
    const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${stampOpicity[i]}"  width="${rect.width}px"  height="${rect.height}px">` +
        `<text x="0"  y="${rect.height / 2}" fill="black"  dominant-baseline="Central" font-size="14px" font-style="normal">` + text +
        '</text></svg>'
    stamp[i].src = "data:image/svg+xml," + str
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
const appendStamp = (url, i) => {
    const el = tela.value
    // content.push(url)
    const pre = createPre(el)
    handleList('','')
    d.value = i
    stamp[i].src = url
    stamp[i].style.width = stampWidth[i] + 'px'
    stamp[i].style.height = stampHeight[i] + 'px'
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

defineExpose({appendStamp, appendText, appendRepeatText, editText, test})
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
