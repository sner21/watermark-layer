export const initStyle = (text, kind, style = {}, el) => {
    return {
        markScaleCache: style.scale || 1,
        markScale: style.scale || 1,
        content: text || '',
        markClass: kind,
        markMarginTop: style.marginTop || 0,
        markMarginLeft: style.marginLeft || 0,
        fontSize: parseInt(style.fontSize) || 14,
        fontFamily: style.fontFamily || '微软雅黑',
        fontStyle: style.fontStyle || 'normal',
        markOpicity: style.opicity || 0.5,
        markRotate: style.rotate || 0,
        markX: style.X || 0,
        markY: style.Y || 0,
        color: style.color || 'black',
        mark: el
    }
}
