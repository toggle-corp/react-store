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
export const createActionSyncMiddleware = actionPrefixes => () => next => (action) => {
    const containsPrefix = prefix => action.type.startsWith(prefix);
    if (!action.noFurtherDispatch && actionPrefixes.find(containsPrefix)) {
        // Two successive actions with same body won't propagate twice.
        // So, we add timestamp to make sure the body is unique.
        const timestampedAction = {
            action: {
                ...action,
                noFurtherDispatch: true,
            },
            time: Date.now(),
        };
        localStorage.setItem(SYNC_KEY, JSON.stringify(timestampedAction));
    }
    return next(action);
};
