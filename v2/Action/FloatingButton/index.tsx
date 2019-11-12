import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../../View/Float';
import Button, { Props, ButtonType } from '../Button';

import styles from './styles.scss';

function FloatingButton<T>(props: Props<T>) {
    const {
        className,
        ...otherProps
    } = props;

    return (
        <Float>
            <Button
                className={_cs(
                    styles.floatingButton,
                    className,
                )}
                {...otherProps}
            />
        </Float>
    );
}
FloatingButton.defaultProps = {
    buttonType: 'button-default' as ButtonType,
    disabled: false,
    pending: false,
    smallHorizontalPadding: false,
    smallVerticalPadding: false,
    transparent: false,
    type: 'button',
};

export default FloatingButton;
