import { mapToMap, listToMap, isDefined, Obj } from '@togglecorp/fujs';

export const version = 1;

interface InternalRelation<K> {
    key: K;
    parentKey?: K;
    problematic: boolean;
    children: { [key: string]: K };
}

export interface Relation<K> {
    key: K;
    parentKey?: K;
    problematic: boolean;
    children: K[];
}

export interface ExtendedRelation<T, K> {
    key: K;
    parentKey?: K;
    problematic: boolean;
    children: T[];
}

export function generateRelations<T, K extends string | number>(
    options: T[],
    keySelector: (item: T) => K,
    parentKeySelector: (item: T) => K | undefined,
): Obj<Relation<K> | undefined> {
    const acc: {
        [key: string]: InternalRelation<K> | undefined;
    } = {};

    options.forEach((node) => {
        // NOTE: item in acc
        const id = keySelector(node);

        const elementFromAcc = acc[id];
        const parentKey = parentKeySelector(node);
        const elem: InternalRelation<K> = elementFromAcc
            ? ({
                ...elementFromAcc,
                parentKey,
                problematic: false,
            })
            : ({
                key: id,
                parentKey,
                problematic: false,
                children: {},
            });
        acc[id] = elem;

        // Iterate over all parents
        let parentId = parentKeySelector(node);
        while (parentId) {
            const parentFromAcc = acc[parentId];
            const parent: InternalRelation<K> = parentFromAcc
                ? ({
                    ...acc[parentId],
                    children: {
                        ...parentFromAcc.children,
                        ...elem.children,
                        [id]: id,
                    },
                })
                : ({
                    key: parentId,
                    parentKey: undefined,
                    problematic: true,
                    children: {
                        ...elem.children,
                        [id]: id,
                    },
                });
            acc[parentId] = parent;

            parentId = parent.parentKey;
        }
    });

    return mapToMap(
        acc,
        key => key,
        item => (
            item
                ? ({
                    ...item,
                    children: Object.values(item.children),
                })
                : undefined
        ),
    );
}

export function generateExtendedRelations<T, K extends string | number>(
    options: T[],
    keySelector: (item: T) => K,
    parentKeySelector: (item: T) => K | undefined,
): Obj<ExtendedRelation<T, K> | undefined> {
    const relations = generateRelations(options, keySelector, parentKeySelector);

    const mapping = listToMap(
        options,
        keySelector,
        item => item,
    );

    return mapToMap(
        relations,
        key => key,
        item => (
            item
                ? ({
                    ...item,
                    children: item.children.map(k => mapping[k]).filter(isDefined),
                })
                : undefined
        ),
    );
}
