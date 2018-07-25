import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '../../Input/Faram/FaramElement';
import ListItem from './ListItem';

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
    keyExtractor: PropTypes.func,
    /* component to be shown as item in list */
    modifier: PropTypes.func,

    renderer: PropTypes.func,
    rendererClassName: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    rendererParams: PropTypes.func,
};

const defaultProps = {
    data: [],
    modifier: undefined,
    keyExtractor: undefined,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
};

class List extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderListItem = (datum, i) => {
        const {
            data,
            keyExtractor,
            modifier,
            renderer: Renderer,
            rendererClassName,
            rendererParams,
        } = this.props;

        const key = (keyExtractor && keyExtractor(datum, i)) || datum;

        if (modifier) {
            return modifier(key, datum, i, data);
        } else if (Renderer) {
            const extraProps = rendererParams ? rendererParams(key, datum, i, data) : undefined;

            return (
                <Renderer
                    className={rendererClassName}
                    key={key}
                    $itemKey={key}
                    {...extraProps}
                />
            );
        }
        // If there is no modifier, then return a ListItem
        return (
            <ListItem key={key}>
                { datum }
            </ListItem>
        );
    }

    render() {
        const { data } = this.props;
        return data.map(this.renderListItem);
    }
}

export default FaramElement('list')(List);
