import localForage from 'localforage';
import * as lfo from 'localforage-observable';
import { REHYDRATE } from 'redux-persist';
import Observable from 'zen-observable';

const localforage = lfo.extendPrototype(localForage);
localforage.newObservable.factory = subscribeFn => new Observable(subscribeFn);


// Listen to localforage changes and rehydrate the store
// with new data.
// Allows blacklisted keys to be ignored while syncing.
const reduxSync = (store, persistor, blacklist = undefined, key = undefined) => {
    localforage.ready(() => {
        localforage.configObservables({
            crossTabNotification: true,
        });
        const observable = localforage.newObservable({
            crossTabNotification: true,
            changeDetection: false,
        });

        observable.subscribe({
            next: (args) => {
                if (args.crossTabNotification) {
                    const stringData = JSON.parse(args.newValue);
                    const data = {};
                    Object.keys(stringData).forEach((k) => {
                        if (blacklist && blacklist.indexOf(k) !== -1) {
                            return;
                        }
                        data[k] = JSON.parse(stringData[k]);
                    });
                    const rehydrateAction = {
                        type: REHYDRATE,
                        payload: data,
                        key,
                    };
                    store.dispatch(rehydrateAction);
                    persistor.dispatch(rehydrateAction);
                }
            },
            error: (err) => {
                console.error('Found an error while observing local-forage', err);
            },
        });
    });
};

export default reduxSync;
