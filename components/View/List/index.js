import PropTypes from 'prop-types';
import React from 'react';

import ListItem from './ListItem';
import styles from './styles.scss';

const propTypeData = PropTypes.arrayOf(
    PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            dummy: PropTypes.string,
        }),
    ]),
);

const propTypes = {
    data: propTypeData,

    keyExtractor: PropTypes.func.isRequired,

    modifier: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: 'Nothing here',
    modifier: undefined,
};

export default class List extends React.PureComponent {
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
            return (modifier(datum, key, i, data));
        }

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
        const {
            data,
        } = this.props;

        const list = data.map(
            (datum, i) => (
                this.getListItem(datum, i)
            ),
        );

        return list;
    }
}

export const ListView = ({
    className,
    data,
    emptyComponent,
    ...otherProps
}) => (
    <div
        className={`${styles['list-view']} list-view ${className}`}
    >
        {
            data.length === 0 ? (
                <p
                    className={`${styles.empty} empty`}
                >
                    { emptyComponent }
                </p>
            ) : (
                <List
                    data={data}
                    {...otherProps}
                />
            )
        }
    </div>
);

ListView.propTypes = {
    className: PropTypes.string,

    data: propTypeData,

    emptyComponent: PropTypes.node,
};

ListView.defaultProps = {
    className: '',
    data: [],
    emptyComponent: 'Nothing here',
};

export { default as ListItem } from './ListItem';
