import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { iconNames } from '../../../constants';
import { randomString } from '../../../utils/common';

const propTypes = {
    /**
     * for styling by styleName
     */
    className: PropTypes.string,

    value: PropTypes.bool,

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
    value: false,
    onChange: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.value,
        };

        this.inputId = randomString();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ checked: nextProps.value });
    }

    handleInputChange = (e) => {
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
            value, // eslint-disable-line
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
                        checked ? (
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
                    checked={checked}
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
