import PropTypes from 'prop-types';
import React from 'react';

import { _cs } from '../../../utils/common';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class TextInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        // NOTE: elementRef is pass through prop.
        // So, it doesn't require prop type declaration.

        const {
            className,
            elementRef, // eslint-disable-line react/prop-types
            ...otherProps
        } = this.props;

        return (
            <input
                ref={elementRef}
                className={_cs(
                    className,
                    styles.rawInput,
                    'raw-input',
                )}
                {...otherProps}
            />
        );
    }
}
