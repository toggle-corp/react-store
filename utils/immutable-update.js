/**
 * @author tnagorra <weathermist@gmail.com>
 */

import update from 'immutability-helper';

update.extend('$auto', (value, object) => update(object || {}, value));
update.extend('$autoArray', (value, object) => update(object || [], value));

export default update;
