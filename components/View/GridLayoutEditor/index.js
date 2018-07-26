import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import GridItem from './GridItem';
import { getLayoutBounds } from '../../../utils/grid-layout';

import styles from './styles.scss';

const propTypes = {
    itemClassName: PropTypes.string,
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    layoutSelector: PropTypes.func.isRequired,
    // minSizeSelector: PropTypes.func.isRequired,
    keySelector: PropTypes.func.isRequired,
    itemHeaderModifier: PropTypes.func.isRequired,
    itemContentModifier: PropTypes.func.isRequired,
    onLayoutChange: PropTypes.func.isRequired,
    gridSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    itemClassName: '',
    className: '',
    data: [],
};

const reduceLayout = (layout, gridSize) => ({
    left: Math.round(layout.left / gridSize.width),
    top: Math.round(layout.top / gridSize.height),
    width: Math.round(layout.width / gridSize.width),
    height: Math.round(layout.height / gridSize.height),
});

const snapLayout = (layout, gridSize) => {
    const reducedLayout = reduceLayout(layout, gridSize);

    return {
        left: reducedLayout.left * gridSize.width,
        top: reducedLayout.top * gridSize.height,
        width: reducedLayout.width * gridSize.width,
        height: reducedLayout.height * gridSize.height,
    };
};

const getLayouts = (data, keySelector, layoutSelector) => {
    const layouts = {};

    data.forEach((datum) => {
        const key = keySelector(datum);
        const layout = layoutSelector(datum);

        layouts[key] = layout;
    });

    return layouts;
};

const doesIntersect = (l1, l2) => (
    l1.left < l2.left + l2.width
    && l1.left + l1.width > l2.left
    && l1.top < l2.top + l2.height
    && l1.height + l1.top > l2.top
);

export default class GridLayoutEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            keySelector,
            layoutSelector,
        } = props;

        this.bounds = {};
        this.layouts = getLayouts(data, keySelector, layoutSelector);
    }

    componentWillMount() {
        const {
            data,
            layoutSelector,
        } = this.props;
        this.bounds = getLayoutBounds(data, layoutSelector);
    }

    componentWillReceiveProps(nextProps) {
        const {
            layoutSelector: newLayoutSelector,
            data: newData,
            keySelector,
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
            this.layouts = getLayouts(newData, keySelector, newLayoutSelector);
        }
    }

    handleItemLayoutValidation = (key, newLayout) => {
        const { gridSize } = this.props;
        const layoutKeyList = (Object.keys(this.layouts)).filter(d => d !== key);


        if (newLayout.left < 0 || newLayout.top < 0) {
            return false;
        }

        let isLayoutValid = true;
        for (let i = 0; i < layoutKeyList.length; i += 1) {
            if (doesIntersect(
                reduceLayout(this.layouts[layoutKeyList[i]], gridSize),
                reduceLayout(newLayout, gridSize),
            )) {
                isLayoutValid = false;
                break;
            }
        }

        return isLayoutValid;
    }

    handleLayoutChange = (key, layout) => {
        const {
            onLayoutChange,
            gridSize,
        } = this.props;

        onLayoutChange(key, snapLayout(layout, gridSize));
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
            layoutValidator: this.handleItemLayoutValidation,
            onLayoutChange: this.handleLayoutChange,
        };
    }


    render() {
        const {
            className: classNameFromProps,
            keySelector,
            itemClassName,
            data,
            gridSize,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.gridLayoutEditor}
            'grid-layout-editor'
        `;

        const {
            width,
            height,
        } = this.bounds;

        const style = {
            width: `${width}px`,
            height: `${height}px`,
            backgroundSize: `${gridSize.width}px ${gridSize.height}px`,
        };

        return (
            <div
                className={className}
                style={style}
            >
                <List
                    data={data}
                    keyExtractor={keySelector}
                    renderer={GridItem}
                    rendererClassName={itemClassName}
                    rendererParams={this.renderParams}
                />
            </div>
        );
    }
}
