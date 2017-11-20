import PropTypes from 'prop-types';
import React from 'react';

import ListItem from './ListItem';
import styles from './styles.scss';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            dummy: PropTypes.string,
        }),
    ]),
);

const propTypes = {
    /* data to be iterated and shown as list */
    data: propTypeData,
    /* get key for each component in list */
    keyExtractor: PropTypes.func.isRequired,
    /* component to be shown as item in list */
    modifier: PropTypes.func,
};

const defaultProps = {
    data: [],
    modifier: undefined,
};

export default class List extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getListItem = (datum, i) => {
        const {
            data,
            keyExtractor,
            modifier,
        } = this.props;

        const key = keyExtractor(datum, i);

        if (modifier) {
            return modifier(key, datum, i, data);
        }

        // If there is no modifier, then return a ListItem
        return (
            <ListItem
                className={`${styles['list-item']} list-item`}
                key={key}
            >
                { datum }
            </ListItem>
        );
    }

    render() {
        const { data } = this.props;

        return data.map(
            (datum, i) => this.getListItem(datum, i),
        );
    }
}
