import PropTypes from 'prop-types';
import React from 'react';

import FaramElement from '../../../Input/Faram/FaramElement';
import { NormalList } from '../index';
import styles from './styles.scss';

const defaultEmptyComponent = () => {
    const classNames = [
        'empty',
        styles.empty,
    ];

    return (
        <p className={classNames.join(' ')}>
            Nothing Here
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
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: defaultEmptyComponent,
};

// eslint-disable-next-line react/prefer-stateless-function
export class NormalListView extends React.Component {
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
                        <NormalList
                            data={data}
                            {...otherProps}
                        />
                    )
                }
            </div>
        );
    }
}

export default FaramElement('list')(NormalListView);
