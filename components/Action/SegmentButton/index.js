import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '../../../utils/common';
import ListView from '../../View/List/ListView';

import styles from './styles.scss';

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
    // Restrain from using onPress
    onPress: PropTypes.func,
    onChange: PropTypes.func,
    selected: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    onPress: undefined,
    backgroundHighlight: false,
};

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

        this.state = { selectedValue: selected };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            this.setState({ selectedValue: nextProps.selected });
        }
    }

    getClassNameWithStatus = (value) => {
        const style = [
            'button',
            styles.segmentLabel,
            value,
            styles[value],
        ];
        const { selectedValue } = this.state;
        const { backgroundHighlight } = this.props;

        if (backgroundHighlight) {
            style.push('background-highlight');
            style.push(styles.backgroundHighlight);
        }

        if (selectedValue === value) {
            style.push('active');
            style.push(styles.active);
        }
        return style.join(' ');
    };

    handleOptionChange = (changeEvent) => {
        const { value } = changeEvent.target;
        const { onChange, onPress } = this.props;
        if (onChange) {
            onChange(value);
        }
        if (onPress) {
            onPress(value);
        }
        this.setState({ selectedValue: value });
    };

    keyExtractor = button => button.value;

    renderSegment = (key, button, i) => {
        const {
            value,
            label,
        } = button;
        const { selectedValue } = this.state;

        const buttonIdentifier = this.buttonIdentifiers[i];

        return (
            <label
                htmlFor={buttonIdentifier}
                key={key}
                className={this.getClassNameWithStatus(value)}
            >
                <input
                    className="input"
                    type="radio"
                    id={buttonIdentifier}
                    name={this.buttonGroupName}
                    onChange={this.handleOptionChange}
                    value={value}
                    checked={selectedValue === value}
                />
                <p className={`label ${styles.segmentName}`}>
                    {label}
                </p>
            </label>
        );
    }

    render() {
        const {
            className,
            data,
        } = this.props;

        return (
            <ListView
                className={`segment-button ${className} ${styles.segmentContainer}`}
                data={data}
                modifier={this.renderSegment}
                keyExtractor={this.keyExtractor}
            />
        );
    }
}
