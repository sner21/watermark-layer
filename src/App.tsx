import React from 'react';
import {Button, Input, InputNumber, Select} from 'antd';
import markRender from '../package/markLayer.js'
import {useEffect, useState, useRef} from "react";
import test from "../test.jpg"

function App() {
    const markCon = useRef()
    const i = useRef()
    const [text, setText] = useState('')
    const [repeatText, setRepeatText] = useState('')
    const [style, setStyle] = useState({
        color: 'black',
        fontSize: 24,
        fontFamily: '微软雅黑',
        rotate: 0,
        opicity: 0.5,
        marginTop: 5,
        marginLeft: 5,
    })

    const exportMark = async () => {
        const url = await markCon.current.exportMark()
        const a = document.createElement('a')
        a.href = url
        a.download = "image.png";
        a.click()
    }
    const exportImage = async () => {
        const url = await markCon.current.exportImage()
        const a = document.createElement('a')
        a.href = url
        a.download = "mark.png";
        a.click()
    }
    const appendMark = async () => {
        const transfer = await window.showOpenFilePicker()
        const file = await transfer[0].getFile()
        const fd = new FileReader()
        fd.readAsDataURL(file)
        fd.onload = (e) => {
            markCon.current.appendMark(e.target.result)
        }
    }
    const deleteMark = () => {
        markCon.current.deleteMark(i.current)
    }
    const deleteBgMark = () => {
        markCon.current.source.markClass.map(i => i === "repeat").forEach((i, k) => i && markCon.deleteMark(k))
    }
    const appendText = () => {
        markCon.current.appendText(text, style)
    }
    const appendRepeatText = () => {
        markCon.current.appendRepeatText(repeatText.value, style)
    }
    useEffect(() => {
        document.querySelector('.test-img').addEventListener('load', () => {
            markCon.current = markRender({
                target: document.querySelector('#canvas-con'), // 需要转换的目标容器 (必需项)
                activeClass: 'active-class', // 被选中印记的类名
                zIndex: 1000, // 容器图层的层级
                markClick(index) {
                    i.current = index
                },
                markDrag(index) {
                    console.log(index)
                }
            })
        })
    }, [])
    // async function greet() {
    //   setGreetMsg(await invoke("greet", { name }));
    // }
    return (
        <div className={'main-con'}>
            <div id="home">
                <h1 style={{color: "#fff", textAlign: "center"}}> 演示页面 </h1>
                <div id="canvas-con">
                    <img src={test} style={{display: "block"}} className="test-img"/>
                </div>
                <div id="config-con">
                    <div>
                        <Button onClick={appendMark}> 添加图片</Button>
                        <Button onClick={deleteMark}> 删除</Button>
                        <Button onClick={deleteBgMark}> 删除背景文本</Button>
                        <Button onClick={exportImage}> 导出图片</Button>
                        <Button onClick={exportMark}> 单独导出标识图层</Button>
                    </div>
                    <div>
                        <Button onClick={appendText}> 添加文本</Button>
                        <Input onChange={e => setText(e.target.value)}/>
                    </div>
                    <div>
                        <Button onClick={appendRepeatText}> 添加背景文本</Button>
                        <Input onChange={e => setRepeatText(e.target.value)} style={{width: "200px"}}/>
                        <div className="title"> 角度</div>
                        <InputNumber onChange={e => setStyle({...style, rotate: e})} min={0} max={360}/>
                        <div className="title">X 间距</div>
                        <InputNumber onChange={e => setStyle({...style, marginTop: e})} min={0} max={360}/>
                        <div className="title">Y 间距</div>
                        <InputNumber onChange={e => setStyle({...style, marginLeft: e})} min={0} max={360}/>
                    </div>
                    <div>
                        <div className="title"> 颜色</div>
                        <Select defaultValue={"black"} onChange={e => setStyle({...style, color: e})} options={
                            [
                                {value: 'black', label: <span>黑色</span>},
                                {value: 'blue', label: <span>蓝色</span>},
                                {value: 'pink', label: <span>粉色</span>},
                                {value: 'white', label: <span>白色</span>},
                            ]
                        }>
                        </Select>
                        <div className="title"> 字体</div>
                        <Select defaultValue={"微软雅黑"} onChange={e => setStyle({...style, fontFamily: e})} options={
                            [
                                {value: '微软雅黑', label: <span>微软雅黑</span>},
                                {value: '宋体', label: <span>宋体</span>},
                                {value: '黑体', label: <span>黑体</span>},
                                {value: 'white', label: <span>白色</span>},
                            ]
                        }>
                        </Select>
                        <div className="title"> 字号</div>
                        <InputNumber v-model:value="style.fontSize"/>
                        <div className="title"> 透明度</div>
                        <InputNumber v-model:value="style.opicity"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
