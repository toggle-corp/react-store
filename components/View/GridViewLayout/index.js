import PropTypes from 'prop-types';
import React from 'react';

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
};

const defaultProps = {
    className: '',
    itemClassName: '',
    data: [],
};


export default class GridViewLayout extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.bounds = {};
        this.data = [];
    }

    componentWillMount() {
        const {
            data,
            layoutSelector,
        } = this.props;
        this.bounds = getLayoutBounds(data, layoutSelector);
        this.data = getSortedItems(data, layoutSelector);
    }

    componentWillReceiveProps(nextProps) {
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
        } = this.props;

        return {
            layoutSelector,
            headerModifier,
            contentModifier,
            datum,
        };
    }

    render() {
        const {
            className: classNameFromProps,
            keySelector,
            itemClassName,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.gridViewLayout}
            'grid-view-layout'
        `;

        const style = {
            width: `${this.bounds.width}px`,
            height: `${this.bounds.height}px`,
        };

        return (
            <div
                className={className}
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
