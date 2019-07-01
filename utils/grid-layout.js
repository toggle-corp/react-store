export const getLayoutBounds = (data, layoutSelector) => {
    let maxW = 0;
    let maxH = 0;

    data.forEach((datum) => {
        const layout = layoutSelector(datum);

        const w = layout.left + layout.width;
        const h = layout.top + layout.height;

        if (w > maxW) {
            maxW = w;
        }

        if (h > maxH) {
            maxH = h;
        }
    });

    return {
        width: maxW,
        height: maxH,
    };
};

export const getSortedItems = (data = [], layoutSelector) => (
    [...data].sort((foo, bar) => {
        const fooLayout = layoutSelector(foo);
        const barLayout = layoutSelector(bar);
        const distA = (fooLayout.top ** 2) + (fooLayout.left ** 2);
        const distB = (barLayout.top ** 2) + (barLayout.left ** 2);
        return distA - distB;
    })
);
