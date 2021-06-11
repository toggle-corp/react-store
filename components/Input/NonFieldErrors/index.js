/**
* @author frozenhelium <fren.ankit@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramErrorMessageElement } from '@togglecorp/faram';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    errors: PropTypes.oneOf([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
    ]),
    persistent: PropTypes.bool,
};

const defaultProps = {
    className: '',
    errors: [],
    persistent: true,
};

class NonFieldErrors extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            errors,
            className,
            persistent,
        } = this.props;

        let errorComponents;
        if (typeof errors === 'string') {
            errorComponents = (
                <div className={_cs(styles.error, 'error')}>
                    {errors}
                </div>
            );
        } else if (errors && errors.length > 0) {
            errorComponents = errors.map(error => (
                <div
                    className={_cs(styles.error, 'error')}
                    key={error}
                >
                    { error }
                </div>
            ));
        } else {
            errorComponents = (
                <div
                    className={_cs(
                        styles.error,
                        styles.empty,
                        !persistent && styles.remove,
                    )}
                >
                    -
                </div>
            );
        }

        return (
            <div className={_cs(styles.nonFieldErrors, className)}>
                { errorComponents }
            </div>
        );
    }
}

export default FaramErrorMessageElement(NonFieldErrors);
