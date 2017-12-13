export const dummy = 0;
export const checkCollision = (items, index) => {
    const rect1 = items[index].layout;
    for (let i = 0; i < items.length; i += 1) {
        if (i !== index) {
            const rect2 = items[i].layout;
            if (
                (rect1.left < rect2.left + rect2.width) &&
                (rect1.left + rect1.width > rect2.left) &&
                (rect1.top < rect2.top + rect2.height) &&
                (rect1.height + rect1.top > rect2.top)
            ) {
                return true;
            }
        }
    }
    return false;
};
