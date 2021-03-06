import PropTypes from 'prop-types';
import React from 'react';
import { _cs, listToGroupList } from '@togglecorp/fujs';
import { FaramListElement } from '@togglecorp/faram';

import ListItem from './ListItem';
import GroupItem from './GroupItem';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            dummy: PropTypes.string,
        }),
        PropTypes.array,
    ]),
);

const propTypes = {
    /* data to be iterated and shown as list */
    data: propTypeData,
    /* get key for each component in list */
    keySelector: PropTypes.func,
    /* get key fro each group */
    groupKeySelector: PropTypes.func,
    /* component to be shown as item in list */
    modifier: PropTypes.func,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,
    rendererParams: PropTypes.func,

    groupRenderer: PropTypes.func,
    groupRendererClassName: PropTypes.string,
    groupRendererParams: PropTypes.func,
    groupComparator: PropTypes.func,
};

const defaultProps = {
    data: [],
    modifier: undefined,
    keySelector: undefined,
    groupKeySelector: undefined,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
    groupRenderer: undefined,
    groupRendererClassName: undefined,
    groupRendererParams: undefined,
    groupComparator: undefined,
};

export class NormalList extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    renderListItem = (datum, i, namespace) => {
        const {
            data,
            keySelector,
            modifier,
            renderer: Renderer,
            rendererClassName,
            rendererParams,
        } = this.props;

        const keyFromSelector = keySelector && keySelector(datum, i);
        const key = keyFromSelector === undefined ? datum : keyFromSelector;

        const finalKey = namespace ? `${namespace}-${key}` : key;

        if (modifier) {
            return modifier(key, datum, i, data);
        }
        if (Renderer) {
            const extraProps = rendererParams ? rendererParams(key, datum, i, data) : undefined;

            return (
                <Renderer
                    key={finalKey}
                    {...extraProps}
                    className={_cs(rendererClassName, extraProps?.className)}
                />
            );
        }

        // If there is no modifier, then return a ListItem
        return (
            <ListItem key={finalKey}>
                { datum }
            </ListItem>
        );
    }

    renderListItemFromGroup = (datum, groupKey, i) => (
        this.renderListItem(datum, i, groupKey)
    )

    renderGroup = (groupKey) => {
        const {
            groupRenderer: Renderer = GroupItem,
            groupRendererClassName,
            groupRendererParams,
        } = this.props;

        const extraProps = groupRendererParams
            ? groupRendererParams(groupKey)
            : undefined;

        return (
            <Renderer
                key={groupKey}
                className={groupRendererClassName}
                {...extraProps}
            />
        );
    }

    render() {
        const {
            data,
            groupKeySelector,
            groupComparator,
        } = this.props;

        if (!groupKeySelector) {
            return data.map((datum, index) => this.renderListItem(datum, index));
        }

        // TODO: memoize this operation
        const groups = listToGroupList(
            data,
            groupKeySelector,
            this.renderListItemFromGroup,
        );

        const children = [];
        Object.keys(groups).sort(groupComparator).forEach((groupKey) => {
            children.push(this.renderGroup(groupKey));
            children.push(...groups[groupKey]);
        });
        return children;
    }
}

export default FaramListElement(NormalList);
