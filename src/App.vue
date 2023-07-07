<template>
	<div class="pdf_class"  ref="pdf_class">
		<canvas ref="myCanvas" id="canvas-wrap">
			<div id="annotation-layer"></div>
		</canvas>
	</div>
	<stamp-main :size="{width:viewport?.width,height:viewport?.height}" :canvas="$refs.pdf_class">
		<!--		<div class="pdf_class" style="width: min-content;border: 1px #000 solid" ref="pdf_class">-->
		<!--			<canvas ref="myCanvas" id="canvas-wrap" >-->
		<!--				<div id="annotation-layer"></div>-->
		<!--			</canvas>-->
		<!--		</div>-->
	</stamp-main>
</template>
<script setup>
import StampMain from "@/components/stamp-main.vue";
import * as PDFJS from 'pdfjs-dist/build/pdf'
import 'pdfjs-dist/build/pdf.worker'
PDFJS.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.js';
import {TextLayerBuilder} from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { onMounted, ref, toRaw} from 'vue';
const viewport = ref()
const pdf_class = ref()
const pdfEnd = ref(0); // 尾页码
const myCanvas = ref(null); // 拿到 pdf dom
let pdfObj = null; // 用于保存 pdf 实例
const curPage = ref(1); // 当前页
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
            viewport.value.width
            viewport.value.height
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

