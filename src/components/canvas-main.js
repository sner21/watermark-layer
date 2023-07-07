function stampRender(props) {
    // const props = defineProps(['canvas', 'size', 'stampDrag', 'stampClick', 'scale'])
    let intX = 0 // 签章点击的初始坐标
    let intY = 0
    // const dragX=ref(0)
    // const dragY=ref(0)
    let scale = props.scale
    // const transform = computed(()=> `scale(${scale})`) // 缩放比率的样式
    // 主体 ref
    let measure = null  // 比对字段 ref
    let stampUrl = null // 上传图片框的 URL
    let stampList = {
        stamp: [],
        stampX: new Proxy([], {
            set(target, p, value) {
                if (value >= props.canvas.clientWidth - stampWidth[d] && typeof +p === 'number') value = props.canvas.clientWidth - stampWidth[d]
                if (value <= 0 && typeof +p === 'number') value = 0
                target[p] = value
                stamp[d] && (stamp[d].style.left = stampX[d] + "px")
                return true
            }
        }),
        stampY: new Proxy([], {
            set(target, p, value) {
                // if (stampY[d] >= props.height - stampHeight[i]) stampY[d] = props.height - stampHeight[i]
                if (value >= props.canvas.clientHeight - stampHeight[d] && typeof +p === 'number') value = props.canvas.clientHeight - stampHeight[d]
                if (value <= 0 && typeof +p === 'number') value = 0
                target[p] = value
                stamp && (stamp[d].style.top = stampY[d] + "px")
                return true
            }
        }),
        stampWidth: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    //TODO 最大值 +1
                    stampWidth[d] >= props.size.width && (stampWidth[d] = props.size.width)
                    stampWidthCache[d] = stampWidth[d]
                    stamp[d].style.width = stampWidth[d] + 'px'
                    return true
                }
                return true
            }
        }),
        stampHeight: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    stampHeight[d] >= props.size.height && (stampHeight[d] = props.size.height)
                    stampHeightCache[d] = stampHeight[d]
                    stamp[d].style.height = stampHeight[d] + 'px'
                    return true
                }
                return true
            }
        }),
        stampScale: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    if ((stampWidth[d] >= props.size.width || stampHeight[d] >= props.size.height) && stampScale[d] > stampScaleCache[d]) return true
                    if (stampScaleCache[d]) {
                        stampWidth[d] *= value / stampScaleCache[d]
                        stampHeight[d] *= value / stampScaleCache[d]
                    }
                    if (stampWidth[d] + stampX[d] > pre.width) {
                        stampX[d] -= stampWidth[d] + stampX[d] - pre.width
                    }
                    if (stampHeight[d] + stampY[d] > pre.height) {
                        stampY[d] -= stampHeight[d] + stampY[d] - pre.height
                    }
                    stampScaleCache[d] = value
                    return true
                }
                return true
            }
        }),
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
    }
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
    const stampWidthCache = []
    const stampHeightCache = []
    const stampScaleCache = []
    let d = null // 当前选中的序号
    let dragSwitch = false // 拖动锁
    let maxScale = 1 // 缩放值
    let pre = null // 蒙版 ref
    let textSize = {
        fontFamily: 'Microsoft YaHei,serif',
        fontSize: 14 + 'px',
        fontStyle: 'normal',
        transform: `rotate(${stampRotate[d]}deg)`
    }
    const changeTextSize = () => {
        textSize = {
            fontFamily: 'Microsoft YaHei,serif',
            fontSize: fontSize[d] + 'px',
            fontStyle: fontStyle[d],
            transform: `rotate(${stampRotate[d]}deg)`
        }
        refreshMeasure()
    }
    const refreshMeasure = () => {
        measure || (measure = document.createElement('span'))
        measure.style.position = 'absolute'
        measure.style.fontFamily = textSize.fontFamily
        measure.style.fontSize = textSize.fontSize
        measure.style.fontStyle = textSize.fontStyle
        measure.style.transform = textSize.transform
        measure.style.visibility = 'hidden'
        props.canvas.appendChild(measure)
    }
    // const textSize = computed(() => { // 比对字体的样式
    //     return {
    //         fontFamily: 'Microsoft YaHei,serif',
    //         fontSize: fontSize[d] + 'px',
    //         fontStyle: fontStyle[d],
    //         transform: `rotate(${stampRotate[d]}deg)`
    //     }
    // })

    refreshMeasure()

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
        await new Promise(resolve => file.onloadend = () => resolve())
        return file.result
        // await  fetch(src).then(function(response) {
        //     return response.blob();
        // }).then(function(data) {
        //     file.readAsDataURL(data)
        //     file.onloadend = () => {
        //         return file.result
        //     }
        // }).catch(function(e) {
        //     console.log("Oops, error");
        // });
    }
    // watch(stampX, (val) => {
    //     if (stampX[d] >= props.canvas.clientWidth - stampWidth[d]) stampX[d] = props.canvas.clientWidth - stampWidth[d]
    //     if (stampX[d] <= 0)stampX[d] = 0
    //     stamp[d] && (stamp[d].style.left = stampX[d] + "px")
    // }, {deep: true})
    // watch(stampY, (val) => {
    //     // if (stampY[d] >= props.height - stampHeight[i]) stampY[d] = props.height - stampHeight[i]
    //     if (stampY[d] >= props.canvas.clientHeight - stampHeight[d]) stampY[d] = props.canvas.clientHeight - stampHeight[d]
    //     if (stampY[d] <= 0)stampY[d] = 0
    //     stamp && (stamp[d].style.top = stampY[d] + "px")
    // }, {deep: true})
    // watch(stampScale, (val) => {
    //     if ((stampWidth[d] >= props.size.width || stampHeight[d] >= props.size.height)&& stampScale[d] > stampScaleCache[d]) return
    //     stampWidth[d] *= stampScale[d] / stampScaleCache[d]
    //     stampHeight[d] *= stampScale[d] / stampScaleCache[d]
    //     stampScaleCache[d] = stampScale[d]
    // }, {deep: true})
    // watch(stampWidth, () => {
    //     //TODO 最大值 +1
    //     stampWidth[d] >= props.size.width && (stampWidth[d] = props.size.width)
    //     stampWidthCache[d] = stampWidth[d]
    //     stamp[d].style.width = stampWidth[d] + 'px'
    //
    // }, {deep: true})
    // watch(stampHeight, () => {
    //     stampHeight[d] >= props.size.height && (stampHeight[d] = props.size.height)
    //     stampHeightCache[d] = stampHeight[d]
    //     stamp[d].style.height = stampHeight[d] + 'px'
    // }, {deep: true})

    const editText = async (fallback = new Function()) => {
        fallback()
        changeTextSize()
        const rect = measure.getBoundingClientRect()
        switch (stampClass[d]) {
            case 'text': {
                const str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${rect.width}px" style="transform: rotate(${stampRotate}deg)" opacity="${stampOpicity}"  height="${rect.height}px"><text x="0"   y="${rect.height / 2}" fill="black" dominant-baseline="Central" font-size="${fontSize[d]}px" font-style="${fontStyle[d]}"  font-family="${fontFamily[d]}" >${content[d]}</text></svg>`
                stampWidth[d] = rect.width
                stampHeight[d] = rect.height
                stamp[d].src = "data:image/svg+xml," + str
                stamp[d].style.transform = 'scale(1)'
            }
                break
            case 'repeat': {
                const width = props.size.width
                const height = props.size.height
                const numX = width / (rect.width + stampMarginLeft[d])
                const numY = height / (rect.height + stampMarginTop[d])
                const list = []
                for (let j = 0; j <= numX + 5; j++) {
                    for (let k = 0; k <= numY + 5; k++) {
                        list.push(`<text transform="rotate(${stampRotate[d]},${((rect.width + stampMarginLeft[d])) * (j - 2)},${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d])})"    x="${((rect.width + stampMarginLeft[d])) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d])}"  fill="black"  dominant-baseline="Central"   font-size="${fontSize[d]}px"  font-style="${fontStyle[d]}"  font-family="${fontFamily[d]}">${content[d]}</text>`)
                    }
                }
                const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${stampOpicity}"  width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
                stamp[d].src = "data:image/svg+xml," + str
                // stamp[d].style.transform = transform
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
            d = i
        })
        el.addEventListener('mousedown', function (e) {
            props.stampClick(i)
            // d = i
            stamp[i].style.pointerEvents = 'none'
            pre.style.pointerEvents = 'all';
            (e.target === stamp[i]) && (dragSwitch = true)
            intX = e.offsetX
            intY = e.offsetY
        })
        pre.addEventListener('mousemove', (e) => {
            e.stopPropagation()
            if (dragSwitch && e.target === pre && d === i) {
                stampX[i] = (e.offsetX - intX)
                stampY[i] = (e.offsetY - intY)
            }
            // if (stampX[d] >= props.canvas.clientWidth - stampWidth[d]) stampX[d] = props.canvas.clientWidth - stampWidth[d]
            // if (stampX[d] <= 0)stampX[d] = 0
            // stamp[d] && (stamp[d].style.left = stampX[d] + "px")
            // if (stampY[d] >= props.canvas.clientHeight - stampHeight[d]) stampY[d] = props.canvas.clientHeight - stampHeight[d]
            // if (stampY[d] <= 0)stampY[d] = 0
            // stamp && (stamp[d].style.top = stampY[d] + "px")

            props.stampDrag(stampList, i)
        })
        document.addEventListener('click', (e) => {
            e.stopPropagation()
            if (e.target !== pre && d === null) {
                d = stamp.length + 1
                stamp.forEach(i => i.classList.remove('active-stamp'))
            }
        })
        document.addEventListener('mouseup', function (e) {
            stamp[i].style.pointerEvents = 'all'
            // pre.style.pointerEvents = 'none'
            dragSwitch = false
        })
    }
    const createPre = (el) => {
        !pre && (pre = document.createElement('div'))
        pre.height = el.clientHeight
        pre.style.height = el.clientHeight + 'px'
        pre.width = el.clientWidth
        pre.style.width = el.clientWidth + 'px'
        pre.style.zIndex = 999
        pre.style.position = 'absolute'
        // pre.style.transform = transform
        pre.style.transformOrigin = 'left top'
        pre.style.top = pre.style.left = '0'
        pre.style.pointerEvents = 'none'
        el.append(pre)
        pre.addEventListener('wheel', function (e) {
            e.preventDefault()
            if (content[d] || (stampWidth[d] >= props.size.width || stampHeight[d] >= props.size.height) && e.deltaY < 0) return
            // if (stampScale[d] - e.deltaY / 10000 * 5)
            stampScale[d] -= e.deltaY / 10000 * 5
            // if ((stampWidth[d] >= props.size.width || stampHeight[d] >= props.size.height)&& stampScale[d] > stampScaleCache[d]) return
            // stampWidth[d] *= stampScale[d] / stampScaleCache[d]
            // stampHeight[d] *= stampScale[d] / stampScaleCache[d]
            // stampScaleCache[d] = stampScale[d]
            // //TODO 最大值 +1
            // stampWidth[d] >= props.size.width && (stampWidth[d] = props.size.width)
            // stampWidthCache[d] = stampWidth[d]
            // stamp[d].style.width = stampWidth[d] + 'px'
            // stampHeight[d] >= props.size.height && (stampHeight[d] = props.size.height)
            // stampHeightCache[d] = stampHeight[d]
            // stamp[d].style.height = stampHeight[d] + 'px'
        })
        return pre
    }
    const handleList = (text, kind) => {
        stamp.push(document.createElement('img'))
        stampWidth.push(200)
        stampHeight.push(200)
        console.log(stampHeight.at(-1))
        stampScaleCache.push(1)
        stampScale.push(1)
        console.log(stampHeight.at(-1))
        content.push(text)
        stampClass.push(kind)
        stampMarginTop.push(0)
        stampMarginLeft.push(0)
        fontSize.push('14')
        fontFamily.push('微软雅黑')
        fontStyle.push('normal')
        stampOpicity.push(0.5)
        stampRotate.push(0)
        stampX.push(0)
        stampY.push(0)
    }

    const appendRepeatText = async (text, i) => {
        d = i
        changeTextSize()
        if (!text) return
        const el = props.canvas
        const pre = createPre(el)
        handleList(text, 'repeat')
        //await nextTick()
        const rect = measure.getBoundingClientRect()
        const width = el.offsetWidth
        const height = el.offsetHeight
        stampWidth[i] = width - 1
        stampHeight[i] = height - 1
        const numX = width / rect.width
        const numY = height / rect.height
        const list = []
        for (let j = 0; j <= numX + 5; j++) {
            for (let k = 0; k <= numY + 5; k++) {
                list.push(`<text transform="rotate(${stampRotate[d]},${((rect.width + stampMarginLeft[d])) * (j - 2)},${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d])})"    x="${((rect.width + stampMarginLeft[d])) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + stampMarginTop[d])}"  fill="black"  dominant-baseline="Central"   font-size="${fontSize[d]}px"  font-style="${fontStyle[d]}"  font-family="${fontFamily[d]}">${content[d]}</text>`)
            }
        }
        const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${stampOpicity[d]}"  width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
        stamp[i].src = "data:image/svg+xml," + str
        stamp[i].setAttribute("style", `width:${width}px;height:${height}px;top:0;left:0;cursor:pointer;position:absolute;`);
        stamp[i].draggable = false
        stamp[i].style.pointerEvents = 'all'
        maxScale = 1
        pre.append(stamp[i])
        // stamp[i].tabIndex = -1
        // stamp[i].classList.add('stamp')
        // registerEvent(el, pre, stamp, i)
    }
    const appendText = async (text, i) => {
        d = i
        handleList(text, 'text')
        if (typeof text === 'string') {
            measure.innerText = text
        } else {
            measure.innerText = text.find(i => i.length === Math.max(...text.map(i => i.length)))
        }
        if (!text) return
        const el = props.canvas
        const pre = createPre(el)
        const rect = measure.getBoundingClientRect()
        stampWidth[i] = rect.width
        let str
        if (typeof text === 'string') {
            stampHeight[i] = rect.height
            str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${stampOpicity[i]}"  width="${rect.width}px"  height="${rect.height}px">` +
                `<text x="0"  y="${rect.height / 2}" fill="black"  dominant-baseline="Central" font-size="14px" font-style="normal">` + text +
                '</text></svg>'
        } else {
            stampHeight[i] = rect.height * text.length
            str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${stampOpicity[i]}"  width="${rect.width}px"  height="${stampHeight[i]}px">` +
                text.map((i, k) => {
                    return `<text x="0"  y="${rect.height / 2 + (k) * rect.height}" fill="black"  dominant-baseline="Central" font-size="14px" font-style="normal">` + i + '</text>'
                })
                + '</svg>'
        }
        stamp[i].src = "data:image/svg+xml," + str
        stamp[i].setAttribute("style", `width:${rect.width}px;height:${stampHeight[i]}px;top:0;left:0;cursor:pointer;position:absolute;`);
        stamp[i].style.pointerEvents = 'all'
        stamp[i].draggable = false
        stamp[i].tabIndex = -1
        stamp[i].classList.add('stamp')
        registerEvent(el, pre, stamp, i)
        maxScale = +Math.min(props.size.width / stampWidth[i], props.size.height / stampHeight[i]).toFixed(1)
        pre.append(stamp[i])
    }
    const appendStamp = (url, i) => {
        d = i
        const el = props.canvas
        // content.push(url)
        const pre = createPre(el)
        handleList('', '')
        stamp[i].src = url
        stamp[i].setAttribute("style", `width:${stampWidth[i]}px;height:${stampHeight[i]}px;top:0;left:0;cursor:pointer;position:absolute;`);
        stamp[i].style.zIndex = 1000
        stamp[i].draggable = false
        stamp[i].tabIndex = -1
        stamp[i].classList.add('stamp')
        registerEvent(el, pre, stamp, i)
        maxScale = +Math.min(props.size.width / stampWidth[i], props.size.height / stampHeight[i]).toFixed(1)
        pre.append(stamp[i])
    }
    return {
        appendStamp, appendText, appendRepeatText, editText, test, stampList
    }
}

export default stampRender
