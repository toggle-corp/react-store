import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../List/ListView';
import GridItem from './GridItem';

const propTypes = {
    // className: PropTypes.string,
    // renderer: PropTypes.func.isRequired,
    // data: PropTypes.arrayOf(PropTypes.object),
    // paramSelector: PropTypes.func,
    // layoutSelector: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class GridViewLayout extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            bounds: {},
        };
    }

    componentDidMount() {
        this.calculateBounds(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.calculateBounds(nextProps, this.props);
    }

    getBounds = () => {
        const {
            data,
            layoutSelector,
        } = this.props;

        let maxW = 0;
        let maxH = 0;

        data.forEach((datum) => {
            const layout = layoutSelector(datum, data);

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

    calculateBounds = (nextProps, currentProps = {}) => {
        const {
            bounds: newBounds,
            layoutSelector: newLayoutSelector,
        } = nextProps;

        const {
            bounds: oldBounds,
            layoutSelector: oldLayoutSelector,
        } = currentProps;

        if (newBounds !== oldBounds || newLayoutSelector !== oldLayoutSelector) {
            const bounds = this.getBounds();
            this.setState({ bounds });
        }
    }

    render() {
        const {
            data,
            layoutSelector,
            keySelector,
            itemHeaderModifier,
            itemContentModifier,
            itemClassName,
        } = this.props;

        const { bounds } = this.state;

        return (
            <ListView
                style={{ ...bounds }}
                data={data}
                renderer={GridItem}
                rendererClassName={itemClassName}
                rendererParams={{
                    layoutSelector,
                    headerModifier: itemHeaderModifier,
                    contentModifier: itemContentModifier,
                }}
                keyExtractor={keySelector}
            />
        );
    }
}
