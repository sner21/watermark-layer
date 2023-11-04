export const getImageSize = async function (url) {  // 获取图片尺寸
    return await new Promise((resolve) => {
        const img = new Image()
        img.src = url
        if (img.complete) {
            // 如果图片被缓存，则直接返回缓存数据
            resolve({width: img.width, height: img.height})
        } else {
            img.onload = () => {
                resolve({width: img.width, height: img.height})
            }
            img.onerror = () => {
                resolve({width: 0, height: 0, error: true})
            }
        }
    })
}
export const toBase64 = (i) => {
    const canvas = document.createElement("canvas");
    canvas.width = i.width;
    canvas.height = i.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(i, 0, 0, i.width, i.height);
    return canvas.toDataURL();
}
export const createImage = async (url) => {
    return await new Promise((resolve) => {
        const img = new Image()
        img.src = url
        if (img.complete) {
            // 如果图片被缓存，则直接返回缓存数据
            resolve(img)
        } else {
            img.onload = () => {
                resolve(img)
            }
            img.onerror = () => {
                resolve(null)
            }
        }
    })
}
export const xmlToBase = async (list = [], {width, height}) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")
    for (let i = 0; i < list.length; i++) {
        ctx.drawImage(await createImage(list[i]), 0, 0)
    }
    return canvas.toDataURL()
}
