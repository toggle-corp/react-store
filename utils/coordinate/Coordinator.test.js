import Coordinator from './Coordinator';

const store = {
    status: 'none',
};

const onPreLoad = () => {
    store.status = 'running';
};

const onPostLoad = () => {
    store.status = 'stopped';
};

const getActorForCoordinator = (coordinator, id, immediate) => ({
    start: () => {
        // console.log('running');
        // after some time
        if (immediate) {
            coordinator.notifyComplete(id);
        }
    },
    close: () => {
        // console.log('stopped');
    },
});

test('Coordinator construction', () => {
    const coordinator = new Coordinator(onPreLoad, onPostLoad, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', true));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', true));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', true));
    coordinator.add('d', getActorForCoordinator(coordinator, 'd', true));
    coordinator.add('e', getActorForCoordinator(coordinator, 'e', false));
    coordinator.add('f', getActorForCoordinator(coordinator, 'f', false));
    coordinator.add('g', getActorForCoordinator(coordinator, 'g', false));

    // Expect a to be added, must be in queued state and not in active state
    expect(coordinator.getActorById('a')).toBeDefined();
    expect(coordinator.getQueuedActorIndexById('a')).toBe(0);
    expect(coordinator.getActiveActorIndexById('a')).toBe(-1);

    expect(store.status).toBe('none');
    coordinator.start();
    expect(store.status).toBe('running');

    // after start, it starts 2 actors immediately, and is waiting after 4th completes
    // after completion remove from active and queued state
    expect(coordinator.getActorById('d')).not.toBeDefined();

    expect(coordinator.getActorById('e')).toBeDefined();
    expect(coordinator.getQueuedActorIndexById('e')).toBe(-1);
    expect(coordinator.getActiveActorIndexById('e')).not.toBe(-1);

    // manually complete 5th (almost like a debug point)
    coordinator.notifyComplete('e');

    // after 5th is complete, it is not in actor list
    expect(coordinator.getActorById('e')).not.toBeDefined();
    expect(coordinator.getActorById('f')).toBeDefined();

    // removing active actor 'f' and inactive action 'h'
    // both removed from actors list
    coordinator.remove('f');
    coordinator.remove('h');
    expect(coordinator.getActorById('f')).not.toBeDefined();
    expect(coordinator.getActorById('h')).not.toBeDefined();

    // actor 'g' is now in active list
    expect(coordinator.getActorById('g')).toBeDefined();
    expect(coordinator.getActiveActorIndexById('g')).not.toBe(-1);
    expect(coordinator.getQueuedActorIndexById('g')).toBe(-1);

    expect(coordinator.hasActiveQueue()).toBeFalsy();

    expect(store.status).toBe('running');

    coordinator.notifyComplete('g');

    expect(store.status).toBe('stopped');
});
