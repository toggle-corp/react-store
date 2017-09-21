import originalUpdate from 'immutability-helper';

originalUpdate.extend('$auto', (value, object) => (
    object ? originalUpdate(object, value) : originalUpdate({}, value)
));
originalUpdate.extend('$autoArray', (value, object) => (
    object ? originalUpdate(object, value) : originalUpdate([], value)
));
const update = (state, params) => {
    // ENABLE FOR DEBUG:
    console.log(params);
    return originalUpdate(state, params);
};

export default update;
