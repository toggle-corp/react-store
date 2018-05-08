export const defaultRect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
};

export const defaultOffset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

export const defaultLimit = {
    minW: 0,
    maxW: Infinity,
    minH: 0,
    maxH: Infinity,
};

const defaultParams = {
    contentRect: { ...defaultRect },
    parentRect: { ...defaultRect },
    boundingRect: { ...defaultRect },
    offset: { ...defaultOffset },
    limit: { ...defaultLimit },
};

export const calcFloatRect = (p) => {
    const params = {
        ...defaultParams,
        ...p,
    };

    const {
        contentRect,
        parentRect,
        boundingRect,
        offset,
        limit,
    } = params;

    const newWidth = Math.max(
        Math.min(
            contentRect.width,
            limit.maxW,
        ),
        limit.minW,
    );

    const newContentRect = {
        top: (parentRect.top + parentRect.height) - offset.top,
        left: parentRect.left - offset.left,
        width: newWidth,
    };

    // TODO: consider the case where height doesn't fit on either side (top or bottom)
    const containerOffsetY = parentRect.top + parentRect.height + contentRect.height;
    if (boundingRect.height < containerOffsetY) {
        newContentRect.top = (parentRect.top + boundingRect.top)
            - (contentRect.height + offset.bottom);
    }

    const containerOffsetX = parentRect.left + newWidth;
    if (boundingRect.width < containerOffsetX) {
        newContentRect.left = (boundingRect.left + parentRect.left + parentRect.width)
            - (newContentRect.width + offset.right);
    }

    return newContentRect;
};

export const calcFloatRectInMainWindow = p => (
    calcFloatRect({
        ...p,
        boundingRect: {
            top: window.scrollY,
            left: window.scrollX,
            width: window.innerWidth,
            height: window.innerHeight,
        },
    })
);

export const calcFloatPositionInMainWindow = (p) => {
    const floatRect = calcFloatRectInMainWindow(p);

    return {
        top: `${floatRect.top}px`,
        left: `${floatRect.left}px`,
        width: `${floatRect.width}px`,
    };
};
