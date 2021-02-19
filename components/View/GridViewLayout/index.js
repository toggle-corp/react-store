import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import List from '../List';
import GridItem from './GridItem';
import {
    getLayoutBounds,
    getSortedItems,
} from '../../../utils/grid-layout';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    itemHeaderModifier: PropTypes.func.isRequired,
    itemContentModifier: PropTypes.func.isRequired,
    layoutSelector: PropTypes.func.isRequired,
    keySelector: PropTypes.func.isRequired,
    itemRendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    itemClassName: '',
    data: [],
    itemRendererParams: undefined,
};


export default class GridViewLayout extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            layoutSelector,
        } = this.props;
        this.bounds = getLayoutBounds(data, layoutSelector);
        this.data = getSortedItems(data, layoutSelector);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {
            layoutSelector: newLayoutSelector,
            data: newData,
        } = nextProps;

        const {
            layoutSelector: oldLayoutSelector,
            data: oldData,
        } = this.props;

        if (
            newLayoutSelector !== oldLayoutSelector
            || newData !== oldData
        ) {
            this.bounds = getLayoutBounds(newData, newLayoutSelector);
            this.data = getSortedItems(newData, newLayoutSelector);
        }
    }

    renderParams = (key, datum) => {
        const {
            layoutSelector,
            itemHeaderModifier: headerModifier,
            itemContentModifier: contentModifier,
            itemRendererParams,
        } = this.props;

        const newParams = itemRendererParams ? itemRendererParams(key, datum) : {};

        return {
            layoutSelector,
            headerModifier,
            contentModifier,
            datum,
            ...newParams,
        };
    }

    render() {
        const {
            className,
            keySelector,
            itemClassName,
        } = this.props;

        const style = {
            width: `${this.bounds.width}px`,
            height: `${this.bounds.height}px`,
        };

        return (
            <div
                className={_cs(className, styles.gridViewLayout, 'grid-view-layout')}
                style={style}
            >
                <List
                    data={this.data}
                    keySelector={keySelector}
                    renderer={GridItem}
                    rendererClassName={itemClassName}
                    rendererParams={this.renderParams}
                />
            </div>
        );
    }
}
