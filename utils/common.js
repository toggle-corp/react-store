import { isFalsy, padStart } from '@togglecorp/fujs';

export const getStandardFilename = (title, type, date = undefined) => {
    const dateToUse = date || new Date();
    const y = padStart(dateToUse.getFullYear(), 4);
    const m = padStart(dateToUse.getMonth() + 1, 2);
    const d = padStart(dateToUse.getDate(), 2);

    return `${y}${m}${d} ${title} ${type}`;
};

// FIXME: deprecated
export const unique = (object, getValue, getComparisionValue) => {
    const memory = {};
    const newArr = [];
    object.forEach((o) => {
        const comparator = getComparisionValue || getValue;
        const id = comparator ? comparator(o) : o;
        if (!memory[id]) {
            memory[id] = true;
            newArr.push(getValue ? getValue(o) : o);
        }
    });
    // for efficiency
    if (!getValue && newArr.length === object.length) {
        return object;
    }
    return newArr;
};

export const getObjectChildren = (object, keys) => {
    // object: object, keys: (string | number | undefined)[], defaultValue: any,
    // ): any => {
    const key = keys[0];
    if (!object || isFalsy(key, ['']) || object[key] === undefined) {
        return undefined;
    }
    if (keys.length === 1) {
        return object[key];
    }
    return getObjectChildren(object[key], keys.slice(1));
};

const getClassNameListAndIndex = (el, className) => {
    const classNameList = (el.getAttribute('class') || '').split(' ');
    const index = classNameList.findIndex(d => d === className);

    return {
        classNameList,
        index,
    };
};

export const addClassName = (el, className) => {
    if (!className) {
        return;
    }

    const {
        classNameList: newClassNameList,
        index: classNameIndex,
    } = getClassNameListAndIndex(el, className);

    // className already there
    if (classNameIndex !== -1) {
        return;
    }

    newClassNameList.push(className);
    el.setAttribute('class', newClassNameList.join(' '));
};

export const removeClassName = (el, className) => {
    const {
        classNameList: newClassNameList,
        index: classNameIndex,
    } = getClassNameListAndIndex(el, className);

    if (classNameIndex !== -1) {
        newClassNameList.splice(classNameIndex, 1);
        el.setAttribute('class', newClassNameList.join(' '));
    }
};

const calcFloatingRect = (
    boundingRect,
    parentRect,
    contentRect,
    offset = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
) => {
    const newContentRect = {
        top: (parentRect.top + parentRect.height) - offset.top,
        left: parentRect.left - offset.left,
        width: parentRect.width,
    };

    const containerOffsetY = parentRect.top + parentRect.height + contentRect.height;
    const containerOffsetX = parentRect.left + Math.min(
        contentRect.width,
        parentRect.width,
    );

    // TODO: consider the case where height doesn't fit on either side (top or bottom)
    if (boundingRect.height < containerOffsetY) {
        newContentRect.top = (parentRect.top + boundingRect.top)
            - (contentRect.height + offset.bottom);
    }

    if (boundingRect.width < containerOffsetX) {
        newContentRect.left = (boundingRect.left + parentRect.left + parentRect.width)
            - (contentRect.width + offset.right);
    }

    return newContentRect;
};

const calcFloatingRectInMainWindow = (parentRect, contentRect, offset) => {
    const boundingRect = {
        top: window.scrollY,
        left: window.scrollX,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    return calcFloatingRect(boundingRect, parentRect, contentRect, offset);
};

export const calcFloatingPositionInMainWindow = (parentRect, contentRect, offset) => {
    const floatingRect = calcFloatingRectInMainWindow(parentRect, contentRect, offset);

    return {
        top: `${floatingRect.top}px`,
        left: `${floatingRect.left}px`,
        width: `${floatingRect.width}px`,
    };
};

// NOTE: only used in chord diagram; maybe on deep
// save the svg node element
export const saveSvg = (svgElement, name) => {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = svgElement.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

export const forEach = (obj, func) => {
    Object.keys(obj).forEach((key) => {
        func(key, obj[key]);
    });
};
