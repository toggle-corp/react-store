import { KEY_PREFIX } from 'redux-persist/constants';


// Listen to localStorage changes and rehydrate the persistor
// with new data.
// Allows blacklisted keys to be ignored while syncing.
const reduxSync = (persistor, blacklist = undefined, keyPrefixOverride = undefined) => {
    const handleStorageEvent = (event) => {
        const keyPrefix = keyPrefixOverride || KEY_PREFIX;

        if (event.key && event.key.indexOf(keyPrefix) === 0) {
            const keyspace = event.key.substr(keyPrefix.length);
            if (blacklist && blacklist.indexOf(keyspace) !== -1) {
                return;
            }

            const partialState = {};
            partialState[keyspace] = event.newValue;
            persistor.rehydrate(partialState, { serial: true });
        }
    };
    window.addEventListener('storage', handleStorageEvent, false);
};

export default reduxSync;
