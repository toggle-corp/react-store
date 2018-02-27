/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    errors: PropTypes.arrayOf(
        PropTypes.string,
    ),
};

const defaultProps = {
    className: '',
    errors: [],
};

@CSSModules(styles, { allowMultiple: true })
export default class NonFieldErrors extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            errors,
            className,
        } = this.props;

        let errorComponents;
        if (errors && errors.length > 0) {
            errorComponents = errors.map(error => (
                <div
                    className={`${styles.error} error`}
                    key={error}
                >
                    { error }
                </div>
            ));
        } else {
            errorComponents = (
                <div className={`${styles.error} ${styles.empty}`}>
                    -
                </div>
            );
        }

        return (
            <div className={`${styles['non-field-errors']} ${className}`}>
                { errorComponents }
            </div>
        );
    }
}

