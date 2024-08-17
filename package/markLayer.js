import {getImageSize, toBase64, xmlToBase} from "./common";
import {initStyle} from "./init";

export default function markRender(props) {
    if (!props.size) {
        props.size = props.target.getBoundingClientRect()
    }
    if (!props.target.style.position) {
        props.target.style.position = 'relative'
    }
    if (props.markClass) {
        props.activeClass =props.markClass + '-' + i
    }
    let intX = 0
    let intY = 0
    const markScaleCache = []
    let d = null
    let dragSwitch = false
    let maxScale = 1
    let pre = null
    let markList = {
        mark: [],
        markX: new Proxy([], {
            set(target, p, value) {
                if (value >= props.target.clientWidth - markWidth[d] && typeof +p === 'number') value = props.target.clientWidth - markWidth[d]
                if (value <= 0 && typeof +p === 'number') value = 0
                target[p] = value
                mark[d] && (mark[d].style.left = markX[d] + "px")
                return true
            }
        }),
        markY: new Proxy([], {
            set(target, p, value) {
                if (value >= props.target.clientHeight - markHeight[d] && typeof +p === 'number') value = props.target.clientHeight - markHeight[d]
                if (value <= 0 && typeof +p === 'number') value = 0
                target[p] = value
                if (p !== 'length') mark && (mark[d].style.top = markY[d] + "px")
                return true
            }
        }),
        markWidth: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    // markWidth[d] * markScale[d]> props.size.width && (markWidth[d] = props.size.width/ markScale[d])
                    mark[d].style.width = markWidth[d] + 'px'
                    return true
                }
                return true
            }
        }),
        markHeight: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    // markHeight[d]* markScale[d] > props.size.height && (markHeight[d] = props.size.height/ markScale[d])
                    mark[d].style.height = markHeight[d] + 'px'
                    return true
                }
                return true
            }
        }),
        markScale: new Proxy([], {
            set(target, p, value) {
                target[p] = value
                if (p !== 'length') {
                    if ((markWidth[d] >= props.size.width || markHeight[d] >= props.size.height) && markScale[d] > markScaleCache[d]) return true
                    if (markScaleCache[d]) {
                        markWidth[d] *= value / markScaleCache[d]
                        markHeight[d] *= value / markScaleCache[d]
                    }
                    if (markWidth[d] + markX[d] > pre.width) {
                        markX[d] -= markWidth[d] + markX[d] - pre.width
                    }
                    if (markHeight[d] + markY[d] > pre.height) {
                        markY[d] -= markHeight[d] + markY[d] - pre.height
                    }
                    markScaleCache[d] = value
                    return true
                }
                return true
            }
        }),
        markOpicity: [],
        markScaleCache: [],
        content: [],
        markClass: [],
        markRotate: [],
        fontSize: [],
        fontFamily: [],
        fontStyle: [],
        markMarginTop: [],
        markMarginLeft: [],
        color: []
    }
    const {
        mark,
        markX,
        markY,
        markWidth,
        markHeight,
        markScale,
        markOpicity,
        content,
        markClass,
        markRotate,
        fontSize,
        fontFamily,
        fontStyle,
        markMarginTop,
        markMarginLeft,
        color
    } = markList

    const getMarkBase = () => {
        const str = mark.map((i, k) => {
            if (i.src.includes('data:image/svg+xml,')) {
                const src = i.src.replace('data:image/svg+xml,', '')
                return (`<svg style="width:${markWidth[k]}px; height:${markHeight[k]}px;left:${markX[k]}px; top:${markY[k]}px;position: absolute;">${src}</svg>`)
            } else {
                const dataURL = toBase64(i)
                return (`<div style="width:${markWidth[k]}px;height:${markHeight[k]}px;left:${markX[k]}px; top:${markY[k]}px;position: absolute;" ><img src="${dataURL}"/></div>`)
            }
        }).join('')
        return (`data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${props.size.width}' height='${props.size.height}'><foreignObject width='100%' height='100%'><div xmlns='http://www.w3.org/1999/xhtml'>${str}</div></foreignObject></svg>`)
    }

    const addClass = (i) => {
        //
        mark[i].classList.add(props.markClass)
        if (markClass[i] !== 'repeat') {
            mark.forEach(i => i.classList.remove(props.activeClass))
            mark[i].classList.add(props.activeClass)

        }

    }
    const registerEvent = (el, pre, mark, i) => {
        if (props.cancelEvent) return
        props.markClick && props.markClick(i)
        props.activeClass && addClass(i)
        mark[i].addEventListener('mousedown', function () {
            props.markClick && props.markClick(i)
            props.activeClass && addClass(i)
            d = i
        })
        el.addEventListener('mousedown', function (e) {
            mark[i].style.pointerEvents = 'none'
            pre.style.pointerEvents = 'all';
            (e.target === mark[i]) && (dragSwitch = true)
            intX = e.offsetX
            intY = e.offsetY
        })
        pre.addEventListener('mousemove', (e) => {
            e.stopPropagation()
            if (dragSwitch && e.target === pre && d === i) {
                markX[i] = (e.offsetX - intX)
                markY[i] = (e.offsetY - intY)
            }
            props.markDrag && props.markDrag(i)
        })
        document.addEventListener('click', (e) => {
            e.stopPropagation()
            if (e.target !== pre && d === null) {
                d = mark.length + 1
                mark.forEach(i => i.classList.remove(props.activeClass || ""))
            }
        })
        document.addEventListener('mouseup', function () {
            mark[i].style.pointerEvents = 'all'
            dragSwitch = false
        })
    }
    const createPre = (el) => {
        !pre && (pre = document.createElement('div'))
        pre.height = el.clientHeight
        pre.width = el.clientWidth
        pre.setAttribute("style", `height:${el.clientHeight}px;width:${el.clientWidth}px;z-index:${props.zIndex || 999};position:absolute;transformOrigin:left top;top:0;left:0;pointerEvents:none`);
        el.append(pre)
        pre.addEventListener('wheel', function (e) {
            e.preventDefault()
            if (content[d] || (markWidth[d] >= props.size.width || markHeight[d] >= props.size.height) && e.deltaY < 0) return
            markScale[d] -= e.deltaY / 10000 * 5
        })
        return pre
    }

    const handleList = (text, kind, style = {}) => {
        const el = document.createElement('img')
        props.class && el.classList.add(props.class)
        const s = initStyle(text, kind, style, el)
        Object.keys(markList).forEach(k => markList[k].push(s[k]))
    }

    const getTextRect = (text) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")
        ctx.rotate(markRotate[d])
        ctx.fillStyle = color[d]
        ctx.font = `${fontSize[d]}px ${fontFamily[d]}`
        return ctx.measureText(text)
    }
    const appendRepeatText = async (text, style) => {
        d = mark.length
        if (!text) return
        const el = props.target
        const pre = createPre(el)
        handleList(text, 'repeat', style)
        const width = el.offsetWidth
        const height = el.offsetHeight
        markWidth[d] = width - 1
        markHeight[d] = height - 1
        const rect = {width: getTextRect(text).width, height: fontSize[d]}
        const numX = width / rect.width
        const numY = height / rect.height
        const list = []
        for (let j = 0; j <= numX + 5; j++) {
            for (let k = 0; k <= numY + 5; k++) {
                list.push(`<text transform="rotate(${markRotate[d]},${((rect.width + markMarginLeft[d])) * (j - 2)},${rect.height / 2 + (k - 2) * (rect.height + markMarginTop[d])})"    x="${((rect.width + markMarginLeft[d])) * (j - 2)}"    y="${rect.height / 2 + (k - 2) * (rect.height + markMarginTop[d])}"  fill="${color[d]}"  dominant-baseline="Central"   font-size="${fontSize[d]}px"  font-style="${fontStyle[d]}"  font-family="${fontFamily[d]}">${content[d]}</text>`)
            }
        }
        const str = `<svg xmlns="http://www.w3.org/2000/svg"   version="1.1" opacity="${markOpicity[d]}"   width="${width}px"  height="${height + rect.height / 2}px">${list.map(i => i)}</svg>`
        mark[d].src = "data:image/svg+xml," + str
        mark[d].setAttribute("style", `width:${width}px;height:${height}px;top:0;left:0;cursor:pointer;position:absolute;pointerEvents:none`);
        mark[d].draggable = false
        maxScale = 1
        pre.append(mark[d])
        return mark[d]
    }
    const appendText = async (text, style = {}) => {
        d = mark.length
        if (!text) return
        const el = props.target
        const pre = createPre(el)
        handleList(text, 'text', style)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = color[d]
        ctx.font = `${fontSize[d]}px ${fontFamily[d]}`
        const rect = {width: getTextRect(text).width, height: fontSize[d]}
        markWidth[d] = rect.width
        let str
        if (typeof text === 'string') {
            markHeight[d] = rect.height
            str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  opacity="${markOpicity[d]}"  width="${rect.width}px"  height="${rect.height}px">` +
                `<text  x="0"  y="${rect.height / 2}" fill="${color[d]}"  dominant-baseline="Central"  font-family="${fontFamily[d]}" font-size="${fontSize[d]}px" font-style="${fontStyle[d]}">` + text +
                '</text></svg>'
        } else {
            markHeight[d] = rect.height * text.length
            str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" opacity="${markOpicity[d]}"  width="${rect.width}px"  height="${markHeight[d]}px">` +
                text.map((i, k) => {
                    return `<text    x="0"  y="${rect.height / 2 + (k) * rect.height}" fill="${color[d]}"  dominant-baseline="Central"  font-family="${fontFamily[d]}" font-size="${fontSize[d]}px" font-style="${fontStyle[d]}">` + i + '</text>'
                })
                + '</svg>'
        }
        mark[d].src = "data:image/svg+xml," + str
        mark[d].setAttribute("style", `width:${rect.width}px;height:${markHeight[d]}px;top:0;left:0;cursor:pointer;position:absolute;pointerEvents:all`);
        mark[d].draggable = false
        mark[d].tabIndex = -1
        registerEvent(el, pre, mark, d)
        maxScale = +Math.min(props.size.width / markWidth[d], props.size.height / markHeight[d]).toFixed(1)
        pre.append(mark[d])
        return mark[d]
    }
    const appendMark = (url) => {
        d = mark.length
        const el = props.target
        const pre = createPre(el)
        handleList('', '')
        const nMark = mark.at(-1)
        nMark.src = url
        nMark.setAttribute("style", `width:${markWidth[d]}px;height:${markHeight[d]}px;top:0;left:0;cursor:pointer;position:absolute;pointerEvents:all`);
        nMark.draggable = false
        nMark.tabIndex = -1
        registerEvent(el, pre, mark, d)

        maxScale = +Math.min(props.size.width / markWidth[d], props.size.height / markHeight[d]).toFixed(1)
        getImageSize(url).then(({width, height}) => {
            markWidth[d] = width
            markHeight[d] = height
            if (width > props.size.width || height > props.size.height) {
                markScale[d] = Math.min(props.size.width / width, props.size.height / height).toFixed(2)
            }
            pre.append(nMark)
        })
        return nMark
    }
    const exportMark = async () => {
        const src = getMarkBase()
        return await xmlToBase([src], props.size)
    }
    const exportImage = async () => {
        const src = getMarkBase()
        const el = props.target.children[0]
        return await xmlToBase([el.src, src], props.size)
    }
    const deleteMark = (index) => {
        markList.mark[index].parentElement.removeChild(markList.mark[index])
        Object.values(markList).forEach((i) => i.splice(index, 1))
        return index
    }
    return {
        appendMark, appendText, appendRepeatText, exportMark, exportImage, deleteMark, source: markList
    }
}
