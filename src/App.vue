<template>
	<a-row style="width: 1920px;height: 1080px;">
		<a-col :span="12" style="border-right: 1px solid #000;padding: 20px;">
			<a-space direction="vertical" align="center" style="width: 100%;" :size="20">
				<div>
					<a-input type="text" ref="textInput"></a-input>
					<a-button @click="appendText($refs.textInput.$el.value,pdf_class,index++)">添加文字</a-button>
					<div v-show="content[d]">
						<a-input type="text" @change="editText(()=>content[d] = $event.target.value)"
						         :value="content[d]"></a-input>
						<span>编辑文字</span></div>
				</div>
				<div class="stamp-uplaod" @click="fileInput.click()" @change="fileInputChange">
					<input type="file" hidden ref="fileInput">
					<div class="stamp-border" v-show="!stampUrl">
						<span>上传图片</span>
					</div>
					<img :src="stampUrl" alt="" v-show="stampUrl" style="max-height:200px;max-width: 300px ">
				</div>
				<a-button @click="appendStamp(stampUrl, $refs.pdf_class, index++)">添加图片</a-button>
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
				<editer-option v-model:value="stampX[d]" :min="0" :max="maxWidth-stampWidth[d]"
				               :disabled="stampWidth[d]>=maxWidth||!stamp[d]" label="X 轴" :precision="0">
				</editer-option>
				<editer-option v-model:value="stampY[d]" :min="0" :max="maxHeight-stampHeight[d]"
				               :disabled="stampHeight[d]>=maxHeight||!stamp[d]" :precision="0" label="Y 轴">
				</editer-option>
				<editer-option v-model:value="stampWidth[d]" :min="0" :max="Math.round(+viewport?.width)"
				               :key="viewport?.width" :precision="0" label="宽度" :disabled="!stamp[d]||content[d]">
				</editer-option>
				<editer-option v-model:value="stampHeight[d]" :min="0" :max="Math.round(+viewport?.height)"
				               :key="viewport?.width" :precision="0" label="高度" :disabled="!stamp[d]||content[d]">
				</editer-option>
				<div style="display: flex;align-items: center">
					<span style="width: 60px; text-align: right;margin-right: 10px">缩放</span>
					<a-slider v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1"
					          :disabled="!stamp[d]"/>
					<a-input-number v-model:value="stampScale[d]" :min="0.5" :max="maxScale" :step="0.1" :precision="1"
					                style="margin-left: 16px" :disabled="!stamp[d]"/>
				</div>
				<!--				<a-button @click="appendStamp(stampUrl,pdf_class)">-->
				<!--					添加签章-->
				<!--				</a-button>-->
				<div class="btn_page">
					<a-button
							@click="prePage"
							class="one"
					>上一页
					</a-button>
					<span>{{ curPage }}/{{ pdfEnd }}</span>
					<a-button
							@click="nextPage"
							class="two"
					>下一页
					</a-button>
				</div>
			</a-space>
		</a-col>
		<a-col :span="12">
			<div class="pdf_class" style="width: min-content;border: 1px #000 solid" ref="pdf_class">
				<canvas ref="myCanvas" id="canvas-wrap">
					<div id="annotation-layer"></div>
				</canvas>
			</div>
		</a-col>
		<span ref="measure" :style="textSize" style="position: absolute">{{ content[d] }}</span>
	</a-row>
	<a-button @click="test">1111111111</a-button>
	<a-drawer
			title="Basic Drawer"
			placement="right"
			:closable="false"
			v-model:visible="visible"
      width="50%"
      :drawerStyle="{index:9999999999999999999}"
	>
	  <img :src="src" alt="">
	</a-drawer>
</template>

<script setup>

import * as PDFJS from 'pdfjs-dist/build/pdf'
import 'pdfjs-dist/build/pdf.worker'

PDFJS.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.js';
import {TextLayerBuilder} from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import {computed, nextTick, onMounted, reactive, ref, toRaw, watch} from 'vue';
import EditerOption from "@/components/editer-option.vue";

const visible=ref(false)
const src=ref('')
const intX = ref(0)
const intY = ref(0)
// const dragX=ref(0)
// const dragY=ref(0)
const viewport = ref()
const pdf_class = ref()
const fileInput = ref()
const textInput = ref()
const measure = ref()
const pdfEnd = ref(0); // 尾页码
const myCanvas = ref(null); // 拿到 pdf dom
let pdfObj = null; // 用于保存 pdf 实例
const curPage = ref(1); // 当前页
const stampUrl = ref()
const stamp = reactive([])
const index = ref(0)
const d = ref(null)
const stampX = reactive([])
const stampY = reactive([])
const dragSwitch = ref(false)
const stampWidth = reactive([])
const stampHeight = reactive([])
const stampWidthCache = reactive([])
const stampHeightCache = reactive([])
const stampScale = reactive([])
const stampScaleCache = reactive([])
const content = reactive([])
const stampClass = reactive([])
//TODO 初始化宽高
const maxWidth = computed(() => Math.round(+viewport.value?.width))
const maxHeight = computed(() => Math.round(+viewport.value?.height))
const maxScale = ref(1)
const fontSize = reactive([])
const fontFamily = reactive([])
const fontStyle = reactive([])
const pre = ref()
const test = () => {
    const a = stamp.map((i, k) => {
        let canvas = document.createElement("canvas");
        canvas.width = i.width;
        canvas.height = i.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(i, 0, 0, i.width, i.height);
        let ext = i.src.substring(i.src.lastIndexOf(".") + 1).toLowerCase();
        let dataURL = canvas.toDataURL("image/" + ext);
        // const str = i.src.replaceAll('data:image/svg+xml,', '')
        // svg.innerHTML=str
        const str2 = `<div  style="width:${stampWidth[k] + 'px'}; height:${stampHeight[k] + 'px'};left:${stampX[k]}px; top:${stampY[k]}px;position: absolute;" >` +
            `<img src="${dataURL}"/>` +
            "</div>";
        return str2
    }).join('')
    const str = "data:image/svg+xml," + `<svg xmlns='http://www.w3.org/2000/svg' width='${maxWidth.value}' height='${maxHeight.value}'>` +
        "<foreignObject width='100%' height='100%'>" + "<div xmlns='http://www.w3.org/1999/xhtml'>" +
        a + "</div>" + "</foreignObject>" + "</svg>";
    src.value=str
    visible.value=true
}
const textSize = computed(() => {
    return {
        fontFamily: 'Microsoft YaHei,serif',
        fontSize: fontSize[d.value] + 'px',
        fontStyle: fontStyle[d.value]
    }
})
watch(stampScale, (a) => {
    // console.log(a[d.value] -b[d.value])
    if ((stampWidth[d.value] >= maxWidth.value || stampHeight[d.value] >= maxHeight.value) && stampScale[d.value] > stampScaleCache[d.value]) return
    stampWidth[d.value] *= a[d.value] / stampScaleCache[d.value]
    stampHeight[d.value] *= a[d.value] / stampScaleCache[d.value]
    stampScaleCache[d.value] = stampScale[d.value]
}, {deep: true})
watch(stampX, (val) => {
    if (stampX[d.value] >= pdf_class.value.clientWidth - stampWidth[d.value]) stampX[d.value] = pdf_class.value.clientWidth - stampWidth[d.value]
    if (stampX[d.value] <= 0) stampX[d.value] = 0
    stamp[d.value] && (stamp[d.value].style.left = val[d.value] + "px")

}, {deep: true})
watch(stampY, (val) => {
    // if (stampY[d.value] >= maxHeight.value - stampHeight[i]) stampY[d.value] = maxHeight.value - stampHeight[i]
    if (stampY[d.value] >= pdf_class.value.clientHeight - stampHeight[d.value]) stampY[d.value] = pdf_class.value.clientHeight - stampHeight[d.value]
    if (stampY[d.value] <= 0) stampY[d.value] = 0
    stamp && (stamp[d.value].style.top = val[d.value] + "px")
}, {deep: true})
watch(stampWidth, () => {
    if (viewport.value) {
        stampWidth[d.value] >= maxWidth.value && (stampWidth[d.value] = maxWidth.value)
        stampWidthCache[d.value] = stampWidth[d.value]
        stamp[d.value].style.width = stampWidth[d.value] + 'px'
    }
}, {deep: true})
watch(stampHeight, () => {
    if (viewport.value) {
        stampHeight[d.value] >= maxHeight.value && (stampHeight[d.value] = maxHeight.value)
        stampHeightCache[d.value] = stampHeight[d.value]
        stamp[d.value].style.height = stampHeight[d.value] + 'px'
    }
}, {deep: true})

const editText = async (fallback) => {
    fallback()
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    const str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${rect.width}px"  height="${rect.height}px">' +
        `<text x="0" y="${+fontSize[d.value] + 2}" fill="black" font-size="${fontSize[d.value]}" font-style="${fontStyle[d.value]}px" font-family="${fontFamily[d.value]}" >` + content[d.value] +
        '</text></svg>'
    stampWidth[d.value] = rect.width
    stampHeight[d.value] = rect.height
    stamp[d.value].src = "data:image/svg+xml," + str
}
const registerEvent = (el, pre, stamp, i) => {
    stamp.forEach(i => i.classList.remove('active-stamp'))
    stamp[i].classList.add('active-stamp')
    stamp[i].addEventListener('mousedown', function () {
        stamp.forEach(i => i.classList.remove('active-stamp'))
        stamp[i].classList.add('active-stamp')
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
    pre.value.style.zIndex = 99999
    pre.value.style.position = 'absolute'
    pre.value.style.top = pre.value.style.left = '0'
    pre.value.style.pointerEvents = 'none'
    el.append(pre.value)
    pre.value.addEventListener('wheel', function (e) {
        e.preventDefault()
        if (content[d.value] || (stampWidth[d.value] >= maxWidth.value || stampHeight[d.value] >= maxHeight.value) && e.deltaY < 0) return
        stampScale[d.value] -= e.deltaY / 10000 * 5
    })
    return pre
}

const appendText = async (text, el, i, x = 0, y = 0, scale = 1) => {
    const pre = createPre(el)
    stamp.push(document.createElement('img'))
    content.push(text)
    stampScale.push(scale)
    stampScaleCache.push(scale)
    fontSize.push('14')
    fontFamily.push('微软雅黑')
    fontStyle.push('normal')
    stampX.push(x)
    stampY.push(y)
    d.value = i
    await nextTick()
    const rect = measure.value.getBoundingClientRect()
    stampWidth[i] = rect.width
    stampHeight[i] = rect.height
    const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${rect.width}px"  height="${rect.height}px">` +
        '<text x="0" y="16" fill="black" font-size="14px" font-style="normal">' + text +
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
    maxScale.value = +Math.min(maxWidth.value / stampWidth[i], maxHeight.value / stampHeight[i]).toFixed(1)
    pre.value.append(stamp[i])
}
const appendStamp = (url, el, i) => {
    // content.push(url)
    const pre = createPre(el)
    stamp.push(document.createElement('img'))
    stampScale.push(1)
    stampScaleCache.push(1)
    stampX.push(0)
    stampY.push(0)
    d.value = i
    stampWidth[i] = 300
    stampHeight[i] = 200
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
    maxScale.value = +Math.min(maxWidth.value / stampWidth[i], maxHeight.value / stampHeight[i]).toFixed(1)
    pre.value.append(stamp[i])
}

const fileInputChange = (e) => {
    const file = new FileReader()
    file.readAsDataURL(e.target.files[0])
    file.onloadend = () => {
        stampUrl.value = file.result
        // appendStamp(stampUrl.value, document.querySelector('.pdf_class'), index.value++)
    }
}
const getPage = (pdf, pageNumber) => {  // 参数为 pdf 实例, 当前页码
    if (pageNumber <= 0) {
        console.log("页数超过");
        curPage.value = 1;
    } else if (pageNumber > pdf.numPages) {
        curPage.value = pdf.numPages;
    } else {
        // 在不超出 & 低于总页数的情况下执行
        pdf.getPage(pageNumber).then((page) => {
            let pageDiv = document.querySelector(`.pdf_class`) //选择渲染父容器
            let canvas = toRaw(myCanvas.value);
            //设置参数
            viewport.value = page.getViewport({scale: 1});
            canvas.height = viewport.value.height;
            canvas.width = viewport.value.width;
            let ctx = canvas.getContext("2d");
            let renderContext = {
                canvasContext: ctx,
                viewport: viewport.value,
            };
            // 渲染 pdf到canvas
            page.render(renderContext).promise.then(async () => {
                //获取签章信息
                const annotationLayer = document.querySelector('#annotation-layer')
                const annotations = await page.getAnnotations()
                for (const annotation of annotations) {
                    // console.log(annotation)
                    // if (this.data[annotation.fieldName]) {
                    // annotation.fieldValue = this.data[annotation.fieldName]
                    // }
                }
                annotationLayer.style.width = `${500}px`
                annotationLayer.style.height = `${500}px`
                annotationLayer.style.left = `${0}px`
                annotationLayer.style.top = `${0}px`

                // Render the annotation layer
                PDFJS.AnnotationLayer.render({
                    viewport: viewport.value.clone({dontFlip: true, scale: 1}),
                    div: annotationLayer,
                    annotations,
                    page,
                })
                return page.getTextContent()
            }).then(textContent => {
                //渲染文本层
                const textLayerDiv = document.createElement('div')
                textLayerDiv.setAttribute('class', 'textLayer')
                // 将文本图层div添加至每页pdf的div中
                pageDiv.appendChild(textLayerDiv)
                let textLayer = new TextLayerBuilder({
                    textLayerDiv: textLayerDiv,
                    pageIndex: page.pageIndex,
                    viewport: viewport.value
                })
                textLayer.setTextContent(textContent)
                textLayer.render()
            });
        });
    }
};

// 初始化 pdf
const previewPDF = (url) => { // 参数为 pdf 链接
    let loadingTask = PDFJS.getDocument({
        url,
        // cMapUrl: "https://unpkg.com/pdfjs-dist@2.16.105/cmaps/",
        cMapUrl: "/src/pdfjs-3.4.120-dist/web/cmaps/",
        cMapPacked: true,
    });
    loadingTask.promise.then((pdf) => {
        pdfObj = pdf; // 保存 pdf 整体实例
        pdfEnd.value = pdf.numPages;
        getPage(pdf, curPage.value);
    });
};

// 上一页
const prePage = () => {
    curPage.value--;
    getPage(pdfObj, curPage.value); // 重新执行
};

// 下一页
const nextPage = () => {
    curPage.value++;
    getPage(pdfObj, curPage.value);  // 重新执行
};
onMounted(() => {
    previewPDF('.\\6877828801.pdf'); // 进入页面执行
})
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
