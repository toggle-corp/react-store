import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '../../General/Icon';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function Spinner(props: Props) {
    const { className } = props;

    return (
        <Icon
            name="loading"
            className={_cs(styles.spinner, 'spinner', className)}
        />
    );
}

Spinner.defaultProps = {
    className: '',
};

export default Spinner;
