import PropTypes from 'prop-types';
import React from 'react';

import { FaramListElement } from '../../General/FaramElements';
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
    keySelector: PropTypes.func,
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
    keySelector: undefined,
    renderer: undefined,
    rendererClassName: '',
    rendererParams: undefined,
};

export class NormalList extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderListItem = (datum, i) => {
        const {
            data,
            keySelector,
            modifier,
            renderer: Renderer,
            rendererClassName,
            rendererParams,
        } = this.props;

        const key = (keySelector && keySelector(datum, i)) || datum;

        if (modifier) {
            return modifier(key, datum, i, data);
        } else if (Renderer) {
            const extraProps = rendererParams ? rendererParams(key, datum, i, data) : undefined;

            return (
                <Renderer
                    className={rendererClassName}
                    key={key}
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

export default FaramListElement(NormalList);
