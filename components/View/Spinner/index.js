import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import styles from './styles.scss';

const Spinner = (props) => {
    const { className } = props;

    return (
        <Icon
            name="loading"
            className={_cs(styles.spinner, 'spinner', className)}
        />
    );
};

Spinner.propTypes = {
    className: PropTypes.string,
};

Spinner.defaultProps = {
    className: '',
};

export default Spinner;
