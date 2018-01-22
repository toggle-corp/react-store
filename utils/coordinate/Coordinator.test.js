import Coordinator from './Coordinator';


// const completeAfter = 10;

const getActorForCoordinator = (coordinator, id, completeAfter) => {
    let timeout;
    return {
        start: () => {
            // console.log('running');
            // after some time
            if (completeAfter > 0) {
                timeout = setTimeout(() => coordinator.notifyComplete(id), completeAfter);
            } else if (completeAfter === 0) {
                coordinator.notifyComplete(id);
            }
        },
        stop: () => {
            // console.log('stopped');
            clearTimeout(timeout);
        },
    };
};

test('Preload and Postload', () => {
    const store = { status: 'none' };
    const onPreLoad = () => { store.status = 'running'; };
    const onPostLoad = () => { store.status = 'stopped'; };

    const coordinator = new Coordinator(onPreLoad, onPostLoad, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', 0));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', 0));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', 0));
    coordinator.add('d', getActorForCoordinator(coordinator, 'd', 0));
    coordinator.add('g', getActorForCoordinator(coordinator, 'g', -1));

    expect(store.status).toBe('none');
    coordinator.start();
    expect(store.status).toBe('running');
    coordinator.notifyComplete('g');
    expect(store.status).toBe('stopped');

    coordinator.stop();
});

test('Test add, start, remove, hasQueuedActors, and accessors for Coordinator', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', 0));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', 0));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', 0));
    coordinator.add('d', getActorForCoordinator(coordinator, 'd', 0));
    coordinator.add('e', getActorForCoordinator(coordinator, 'e', -1));
    coordinator.add('f', getActorForCoordinator(coordinator, 'f', -1));
    coordinator.add('g', getActorForCoordinator(coordinator, 'g', -1));
    coordinator.add('h', getActorForCoordinator(coordinator, 'h', -1));

    // Expect a to be added, must be in queued state and not in active state
    expect(coordinator.getActorById('a')).toBeDefined();
    expect(coordinator.getQueuedActorIndexById('a')).toBe(0);
    expect(coordinator.getActiveActorIndexById('a')).toBe(-1);
    // after start, it starts 2 actors immediately, and is waiting after 4th completes
    // after completion remove from active and queued state
    coordinator.start();
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
});

test('Invalid and valid add()', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    expect(coordinator.add('a', getActorForCoordinator(coordinator, 'a', -1))).toBeTruthy();
    expect(coordinator.add('a', getActorForCoordinator(coordinator, 'a', -1))).toBeFalsy();
});

test('Invalid and valid notify complete', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', false));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', false));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', false));
    coordinator.start();

    expect(coordinator.notifyComplete('d')).toBeFalsy();
    expect(coordinator.notifyComplete('a')).toBeTruthy();
});

test('hasQueuedActors must be false if it has no active queue', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', -1));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', -1));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', -1));
    coordinator.start();
    // Has completed upto b
    expect(coordinator.hasQueuedActors()).toBeTruthy();
    coordinator.notifyComplete('a');
    // Has compelted upto c
    expect(coordinator.hasQueuedActors()).toBeFalsy();
});

test('Stop coordinator before starting', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', -1));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', -1));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', -1));

    coordinator.stop();
    expect(coordinator.getActorById('a')).toBe(undefined);
    expect(coordinator.getActorById('b')).toBe(undefined);
    expect(coordinator.getActorById('c')).toBe(undefined);
});

test('Stop coordinator after starting', () => {
    const coordinator = new Coordinator(undefined, undefined, 2);
    coordinator.add('a', getActorForCoordinator(coordinator, 'a', 0));
    coordinator.add('b', getActorForCoordinator(coordinator, 'b', 0));
    coordinator.add('c', getActorForCoordinator(coordinator, 'c', -1));
    coordinator.start();

    coordinator.stop();

    expect(coordinator.getActorById('a')).toBe(undefined);
    expect(coordinator.getActorById('b')).toBe(undefined);
    expect(coordinator.getActorById('c')).toBe(undefined);
});
