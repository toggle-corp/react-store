import React, { useMemo, Fragment } from 'react';
import {
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';

import { OptionKey } from '../../types';

/*
# Breaking Change
- Remove modifier prop
- Remove default ListItem and GroupItem
- Add prop grouped to identify grouped / non-grouped list
*/

interface BaseProps<D, P, K extends OptionKey> {
    data: D[];
    keySelector(datum: D, index: number): K;
    renderer: React.ComponentType<P>;
    rendererClassName?: string;
    rendererParams: (key: K, datum: D, index: number, data: D[]) => P;
}

interface GroupOptions<D, P, K extends OptionKey, GP, GK extends OptionKey> {
    groupComparator?: (a: GK, b: GK) => number;
    groupKeySelector(datum: D): GK;
    groupRenderer: React.ComponentType<GP>;
    groupRendererClassName?: string;
    groupRendererParams: (key: GK, index: number, data: D[]) => GP;
    grouped: true;
}

interface NoGroupOptions {
    grouped?: false;
}

export type ListProps<D, P, K extends OptionKey, GP, GK extends OptionKey> = (
    BaseProps<D, P, K> & (GroupOptions<D, P, K, GP, GK> | NoGroupOptions)
);

export type GroupedListProps<D, P, K extends OptionKey, GP, GK extends OptionKey> = (
    BaseProps<D, P, K> & GroupOptions<D, P, K, GP, GK>
);

function hasGroup<D, P, K extends OptionKey, GP, GK extends OptionKey>(
    props: ListProps<D, P, K, GP, GK>,
): props is (BaseProps<D, P, K> & GroupOptions<D, P, K, GP, GK>) {
    return !!(props as BaseProps<D, P, K> & GroupOptions<D, P, K, GP, GK>).grouped;
}

function GroupedList<D, P, K extends OptionKey, GP, GK extends OptionKey>(
    props: GroupedListProps<D, P, K, GP, GK>,
) {
    const {
        groupKeySelector,
        groupComparator,
        renderer: Renderer,
        groupRenderer: GroupRenderer,
        groupRendererClassName,
        groupRendererParams,
        data,
        keySelector,
        rendererParams,
        rendererClassName,
    } = props;

    const renderListItem = (datum: D, i: number) => {
        const key = keySelector(datum, i);
        const extraProps = rendererParams(key, datum, i, data);

        return (
            <Renderer
                key={key}
                className={rendererClassName}
                {...extraProps}
            />
        );
    };
    const renderGroup = (groupKey: GK, index: number) => {
        const extraProps = groupRendererParams(groupKey, index, data);

        return (
            <GroupRenderer
                key={groupKey}
                className={groupRendererClassName}
                {...extraProps}
            />
        );
    };

    const groups = useMemo(
        () => listToGroupList(data, groupKeySelector),
        [data, groupKeySelector],
    );

    const sortedGroupKeys = useMemo(
        () => {
            const keys = Object.keys(groups) as GK[];
            return keys.sort(groupComparator);
        },
        [groups, groupComparator],
    );

    const children: React.ReactNode[] = [];
    sortedGroupKeys.forEach((groupKey, i) => {
        children.push(renderGroup(groupKey, i));
        children.push(...groups[groupKey].map(renderListItem));
    });

    return (
        <Fragment>
            {children}
        </Fragment>
    );
}

function List<D, P, K extends OptionKey, GP, GK extends OptionKey>(
    props: ListProps<D, P, K, GP, GK>,
) {
    const {
        data,
        keySelector,
        renderer: Renderer,
        rendererClassName,
        rendererParams,
    } = props;

    if (isNotDefined(data)) {
        return null;
    }

    const renderListItem = (datum: D, i: number) => {
        const key = keySelector(datum, i);
        const extraProps = rendererParams(key, datum, i, data);

        return (
            <Renderer
                key={key}
                className={rendererClassName}
                {...extraProps}
            />
        );
    };

    if (!hasGroup(props)) {
        return (
            <Fragment>
                {data.map(renderListItem)}
            </Fragment>
        );
    }

    return (
        <GroupedList
            {...props}
        />
    );
}

List.defaultProps = {
    data: [],
};

export default List;
