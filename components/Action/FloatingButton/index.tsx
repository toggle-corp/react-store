import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Float from '../../View/Float';
import Button from '../Button';

import styles from './styles.scss';

interface Props {
    className?: string;
}

export default class FloatingButton extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            ...otherProps
        } = this.props;

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
}
