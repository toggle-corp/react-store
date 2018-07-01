// import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import GridItem from './GridItem';

import styles from './styles.scss';

const propTypes = {
    // className: PropTypes.string,
    // renderer: PropTypes.func.isRequired,
    // data: PropTypes.arrayOf(PropTypes.object),
    // paramSelector: PropTypes.func,
    // layoutSelector: PropTypes.func.isRequired,
};

const defaultProps = {
    // className: '',
};

export default class GridViewLayout extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getBounds = (data, layoutSelector) => {
        let maxW = 0;
        let maxH = 0;

        data.forEach((datum) => {
            const layout = layoutSelector(datum);

            const w = layout.left + layout.width;
            const h = layout.top + layout.height;

            if (w > maxW) {
                maxW = w;
            }

            if (h > maxH) {
                maxH = h;
            }
        });

        return {
            width: maxW,
            height: maxH,
        };
    }

    static getSortedData = (data, layoutSelector) => (
        data.sort((foo, bar) => {
            const fooLayout = layoutSelector(foo);
            const barLayout = layoutSelector(bar);
            const distA = (fooLayout.top ** 2) + (fooLayout.left ** 2);
            const distB = (barLayout.top ** 2) + (barLayout.left ** 2);
            return distA - distB;
        })
    )

    constructor(props) {
        super(props);

        this.bounds = {};
        this.data = [];
    }

    componentWillMount() {
        const { data, layoutSelector } = this.props;
        this.bounds = GridViewLayout.getBounds(data, layoutSelector);
        this.data = GridViewLayout.getSortedData(data, layoutSelector);
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
            newLayoutSelector !== oldLayoutSelector ||
            newData !== oldData
        ) {
            this.bounds = GridViewLayout.getBounds(newData, newLayoutSelector);
            this.data = GridViewLayout.getSortedData(newData, newLayoutSelector);
        }
    }

    renderParams = (key, datum) => ({
        layoutSelector: this.props.layoutSelector,
        headerModifier: this.props.itemHeaderModifier,
        contentModifier: this.props.itemContentModifier,
        datum,
    })

    render() {
        const {
            className: classNameFromProps,
            data,
            layoutSelector,
            keySelector,
            itemHeaderModifier,
            itemContentModifier,
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
                    keyExtractor={keySelector}
                    renderer={GridItem}
                    rendererClassName={itemClassName}
                    rendererParams={this.renderParams}
                />
            </div>
        );
    }
}
