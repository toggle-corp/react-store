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

    initialValue: PropTypes.bool,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func,

    /**
     * label for the checkbox
     */
    label: PropTypes.node.isRequired,
};

const defaultProps = {
    className: '',
    initialValue: false,
    onChange: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.initialValue,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ checked: nextProps.initialValue });
    }

    handleInputClick = (e) => {
        const checked = e.target.checked;

        this.setState({ checked });

        if (this.props.onChange && checked !== this.state.checked) {
            this.props.onChange(checked);
        }
    }

    render() {
        const { checked } = this.state;
        const {
            label,
            onChange, // eslint-disable-line
            initialValue, // eslint-disable-line
            className,
            ...otherProps
        } = this.props;

        return (
            <label
                htmlFor={this.inputId}
                styleName={`checkbox ${checked ? 'checked' : ''}`}
                className={className}
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
                    defaultChecked={checked}
                    id={this.inputId}
                    {...otherProps}
                />
                <span styleName="label">{ label }</span>
            </label>
        );
    }
}
