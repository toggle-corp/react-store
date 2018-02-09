import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';
import { randomString } from '../../../utils/common';

import styles from './styles.scss';

const propTypes = {
    /**
     * for styling by styleName
     */
    className: PropTypes.string,

    value: PropTypes.bool,

    /**
     * A callback for when the input changes its content
     */
    onChange: PropTypes.func.isRequired,

    /**
     * label for the checkbox
     */
    label: PropTypes.node.isRequired,
};

const defaultProps = {
    className: '',
    value: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.inputId = randomString();
    }

    handleInputChange = (e) => {
        const value = e.target.checked;
        this.props.onChange(value);
    }

    render() {
        const {
            label,
            className,
            value,
            onChange, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        return (
            <label
                htmlFor={this.inputId}
                styleName={`checkbox ${value ? 'checked' : ''}`}
                className={className}
            >
                <span
                    styleName="checkmark"
                    className={`${
                        value ? (
                            iconNames.checkbox
                        ) : (
                            iconNames.checkboxOutlineBlank
                        )
                    } checkmark`}
                />
                <input
                    onChange={this.handleInputChange}
                    styleName="input"
                    className="input"
                    type="checkbox"
                    checked={value}
                    id={this.inputId}
                    {...otherProps}
                />
                <span
                    styleName="label"
                    className="label"
                >
                    { label }
                </span>
            </label>
        );
    }
}
