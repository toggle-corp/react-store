import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../utils/common';
import styles from './styles.scss';

const propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
};

const defaultProps = {
    checked: false,
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    render() {
        const {
            checked,
            className,
            label,
            ...otherProps
        } = this.props;

        return (
            <label
                htmlFor={this.inputId}
                styleName={`option ${checked ? 'checked' : ''}`}
                className={`radio-option ${className}`}
            >
                <input
                    className="input"
                    defaultChecked={checked}
                    id={this.inputId}
                    styleName="input"
                    type="radio"
                    {...otherProps}
                />
                <span
                    styleName="radio"
                    className={`
                        radio
                        ${checked ? 'ion-android-radio-button-on' : 'ion-android-radio-button-off'}
                    `}
                />
                <span
                    className="label"
                    styleName="label"
                >
                    { label }
                </span>
            </label>
        );
    }
}
