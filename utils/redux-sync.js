import { isFalsy } from '@togglecorp/fujs';

const SYNC_KEY = 'ACTION_DISPATCHED';

// Start listening to actions from other tabs and synchronize.
export const startActionsSync = (store) => {
    // Local storage is, by definition, listened when changed from
    // other tabs.
    window.addEventListener('storage', (e) => {
        if (e.key === SYNC_KEY) {
            const event = JSON.parse(e.newValue);
            if (event.action) {
                store.dispatch(event.action);
            }
        }
    });
};

// Create a middleware that dispatches actions to other tabs.
export const createActionSyncMiddleware = (actionPrefixes, tabId) => () => next => (action) => {
    const {
        senderId,
        resenderId,
        type,
        retransmit,
    } = action;

    const containsPrefix = prefix => type.startsWith(prefix);

    // do not set to local storage
    if (
        !actionPrefixes.find(containsPrefix)
        || (!isFalsy(senderId, ['']) && !isFalsy(resenderId, ['']))
    ) {
        return next(action);
    }

    let timestampedAction;
    // Two successive actions with same body won't propagate twice.
    // So, we add timestamp to make sure the body is unique.

    if (isFalsy(senderId, [''])) {
        // this is original message to be sent
        timestampedAction = {
            action: {
                ...action,
                senderId: tabId,
            },
            time: Date.now(),
        };
    } else if (retransmit) {
        // this is retransmitted back
        timestampedAction = {
            action: {
                ...action,
                resenderId: tabId,
            },
            time: Date.now(),
        };
    } else {
        return next(action);
    }

    try {
        localStorage.setItem(SYNC_KEY, JSON.stringify(timestampedAction));
    } catch (e) {
        // NOTE: error occurs if size of timestampedAction is very large
        console.error(e);
    }
    return next(action);
};
