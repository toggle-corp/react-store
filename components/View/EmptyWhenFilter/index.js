import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import Message from '../Message';
import styles from './styles.scss';

const EmptyWhenFilter = ({
    className,
    message,
}) => (
    <div
        className={_cs(
            className,
            styles.empty,
            'empty-filter',
        )}
    >
        <Message className={styles.message} >
            <Icon
                name="noSearchResults"
                className={styles.icon}
            />
            {message}
        </Message>
    </div>
);

EmptyWhenFilter.propTypes = {
    className: PropTypes.string,
    message: PropTypes.node,
};

EmptyWhenFilter.defaultProps = {
    className: '',
    message: (
        <span>
            There are no items that match your filtering criteria.
        </span>
    ),
};

export default EmptyWhenFilter;
