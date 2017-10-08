import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { randomString } from '../../utils/common';

const propTypes = {
    /**
     * for styling by styleName
     */
    className: PropTypes.string,

    /**
     * label for the checkbox
     */
    label: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            checked: false,
        };

        this.inputId = randomString();
    }

    handleInputClick = (e) => {
        this.setState({
            checked: e.target.checked,
        });
    }

    render() {
        const { checked } = this.state;
        const {
            label,
            ...otherProps
        } = this.props;

        return (
            <label
                htmlFor={this.inputId}
                styleName={`checkbox ${checked ? 'checked' : ''}`}
                className={this.props.className}
            >
                <span
                    styleName="checkmark"
                    className={`${
                        checked
                            ? 'ion-android-checkbox'
                            : 'ion-android-checkbox-outline-blank'
                    }`}
                />
                <input
                    onClick={this.handleInputClick}
                    styleName="input"
                    type="checkbox"
                    id={this.inputId}
                    {...otherProps}
                />
                <span styleName="label">{ label }</span>
            </label>
        );
    }
}
