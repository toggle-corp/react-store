import PropTypes from 'prop-types';
import React from 'react';

import List from '../index';
import styles from './styles.scss';

const defaultEmptyComponent = () => {
    const classNames = [
        'empty',
        styles.empty,
    ];

    return (
        <p className={classNames.join(' ')}>
            Nothing here
        </p>
    );
};

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
    className: PropTypes.string,
    /* data to be iterated and shown as list */
    data: propTypeData,
    /* Component to show when data is empty */
    emptyComponent: PropTypes.func,

    renderer: PropTypes.func,
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: defaultEmptyComponent,
    renderer: undefined,
};

export default class ListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
            emptyComponent: EmptyComponent,

            ...otherProps
        } = this.props;

        return (
            <div className={`${styles.listView} list-view ${className}`}>
                {
                    data.length === 0 ? (
                        <EmptyComponent />
                    ) : (
                        <List
                            data={data}
                            {...otherProps}
                        />
                    )
                }
            </div>
        );
    }
}
