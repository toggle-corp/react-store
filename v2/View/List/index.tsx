import React from 'react';
import {
    listToGroupList,
    isNotDefined,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

interface BaseProps<D, P, K> {
    data: D[];
    keySelector(datum: D, index: number): K;
    renderer: React.ComponentType<P>;
    rendererParams: (key: K, datum: D, index: number, data: D[]) => P;
    rendererClassName?: string;
}

interface GroupOptions<D, P, K, GP, GK> {
    grouped: true;

    groupKeySelector(datum: D): GK;
    groupRenderer: React.ComponentType<GP>;
    groupRendererParams: (key: GK, index: number, data: D[]) => GP;

    groupRendererClassName?: string;
    groupComparator?: (a: GK, b: GK) => number;
}

interface NoGroupOptions {
    grouped?: false;
}

type Props<D, P, K, GP, GK> = BaseProps<D, P, K> & (GroupOptions<D, P, K, GP, GK> | NoGroupOptions);

export default class List<
    D, P, K extends string | number, GP, GK extends string | number,
> extends React.Component<Props<D, P, K, GP, GK>> {
    public static defaultProps = {
        data: [],
    };

    // eslint-disable-next-line max-len
    private hasGroup = (props: Props<D, P, K, GP, GK>): props is (BaseProps<D, P, K> & GroupOptions<D, P, K, GP, GK>) => (
        !!(props as BaseProps<D, P, K> & GroupOptions<D, P, K, GP, GK>).grouped
    )

    private getGroups = memoize((data: D[], groupKeySelector: (datum: D) => GK) => (
        listToGroupList(data, groupKeySelector)
    ))

    private renderListItem = (datum: D, i: number) => {
        const {
            data,
            keySelector,
        } = this.props;

        const key = keySelector(datum, i);

        const {
            rendererParams,
            renderer: Renderer,
            rendererClassName,
        } = this.props;

        const extraProps = rendererParams(key, datum, i, data);

        return (
            <Renderer
                key={key}
                className={rendererClassName}
                {...extraProps}
            />
        );
    }

    private renderGroup = (groupKey: GK, index: number, data: D[]) => {
        if (this.hasGroup(this.props)) {
            const {
                groupRenderer: Renderer, // = GroupItem,
                groupRendererClassName,
                groupRendererParams,
            } = this.props;

            const extraProps = groupRendererParams(groupKey, index, data);

            return (
                <Renderer
                    key={groupKey}
                    className={groupRendererClassName}
                    {...extraProps}
                />
            );
        }
        return null;
    }

    public render() {
        const {
            data,
        } = this.props;

        if (isNotDefined(data)) {
            return null;
        }

        if (!this.hasGroup(this.props)) {
            return data.map(this.renderListItem);
        }

        const {
            groupKeySelector,
            groupComparator,
        } = this.props;

        const groups = this.getGroups(data, groupKeySelector);

        // FIXME: memoize this later
        const keys = Object.keys(groups) as GK[];
        const sortedGroupKeys = keys.sort(groupComparator);

        const children: React.ReactNode[] = [];

        sortedGroupKeys.forEach((groupKey, i) => {
            children.push(this.renderGroup(groupKey, i, data));
            children.push(...groups[groupKey].map(this.renderListItem));
        });
        return children;
    }
}
