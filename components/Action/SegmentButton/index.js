import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { randomString } from '../../../utils/common';

// TODO: @adityakhatri47, Rename property 'onPress' to 'onClick' for consistency
const propTypes = {
    className: PropTypes.string,
    backgroundHighlight: PropTypes.bool,
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
            value: PropTypes.string,
        }).isRequired,
    ).isRequired,
    onPress: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    backgroundHighlight: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class SegmentButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        // NOTE: Appending randomStr in identifiers to avoid conflict in global namespace
        const randomStr = randomString(5);

        const { data, selected } = this.props;
        // NOTE: 'data' cannot not change after initialization
        this.buttonGroupName = `buttonGroup-${randomStr}`;
        this.buttonIdentifiers = data.map((val, i) => `input-${i}-${randomStr}`);

        this.state = {
            selectedValue: selected,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            this.setState({
                selectedValue: nextProps.selected,
            });
        }
    }

    getStyleNameWithStatus = (buttonValue, styleValue) => {
        const style = [styleValue];
        const { selectedValue } = this.state;
        const { backgroundHighlight } = this.props;

        if (backgroundHighlight) {
            style.push('background-highlight');
        }

        if (selectedValue === buttonValue) {
            style.push('active');
        }
        return style.join(' ');
    };

    handleOptionChange = (changeEvent) => {
        const { value } = changeEvent.target;
        this.props.onPress(value);
        this.setState({ selectedValue: value });
    };

    render() {
        const {
            className,
            data,
        } = this.props;
        const { selectedValue } = this.state;

        return (
            <div
                className={`segment-button ${className}`}
                styleName="segment-container"
            >
                {
                    data.map((button, i) => (
                        <label
                            htmlFor={this.buttonIdentifiers[i]}
                            key={button.value}
                            className={this.getStyleNameWithStatus(button.value, 'button')}
                            styleName={this.getStyleNameWithStatus(button.value, 'segment-label')}
                        >
                            <input
                                checked={selectedValue === button.value}
                                className="input"
                                id={this.buttonIdentifiers[i]}
                                name={this.buttonGroupName}
                                onChange={this.handleOptionChange}
                                type="radio"
                                value={button.value}
                            />
                            <p
                                className="label"
                                styleName="segment-name"
                            >
                                {button.label}
                            </p>
                        </label>
                    ))
                }
            </div>
        );
    }
}
