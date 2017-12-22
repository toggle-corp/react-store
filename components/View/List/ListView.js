import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import List from './List';
import styles from './styles.scss';

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
    emptyComponent: PropTypes.node,
};

const defaultProps = {
    className: '',
    data: [],
    emptyComponent: 'Nothing here',
};

@CSSModules(styles, { allowMultiple: true })
export default class ListView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
            emptyComponent,

            ...otherProps
        } = this.props;
        return (
            <div
                className={`${styles['list-view']} list-view ${className}`}
            >
                {
                    data.length === 0 ? (
                        <p className={`${styles.empty} empty`} >
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
    }
}
