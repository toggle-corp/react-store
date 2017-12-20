/**
 * @author tnagorra <weathermist@gmail.com>
 */

import update from 'immutability-helper';

update.extend(
    '$auto',
    (value, object) => update(object || {}, value),
);
update.extend(
    '$autoArray',
    (value, object) => update(object || [], value),
);
update.extend(
    '$if',
    (value, object) => (value[0] ? update(object, value[1]) : object),
);
update.extend(
    '$filter',
    (value, object) => object.slice().filter(value),
);
update.extend(
    '$bulk',
    (value, object) => value.reduce(
        (acc, val) => update(acc, val),
        object,
    ),
);

export default update;
