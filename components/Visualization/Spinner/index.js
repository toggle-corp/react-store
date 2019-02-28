import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const Spinner = (props) => {
    const {
        loading,
        className,
    } = props;

    return loading ? <div className={_cs(styles.spinner, className)} /> : null;
};

Spinner.propTypes = {
    loading: PropTypes.bool,
    className: PropTypes.string,
};

Spinner.defaultProps = {
    loading: true,
    className: '',
};

export default Spinner;
