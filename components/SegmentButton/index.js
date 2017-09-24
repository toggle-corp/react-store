import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { randomString } from '../../utils/common';

// TODO: @adityakhatri47, Rename property 'onPress' to 'onClick' for consistency
const propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
    ).isRequired,
    onPress: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class SegmentButton extends React.PureComponent {
    static propTypes = propTypes;

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

    handleOptionChange = (changeEvent) => {
        const { value } = changeEvent.target;
        this.props.onPress(value);
        this.setState({ selectedValue: value });
    };

    render() {
        const { data } = this.props;
        const { selectedValue } = this.state;

        return (
            <div styleName="segment-container">
                {
                    data.map((button, i) => (
                        <label
                            htmlFor={this.buttonIdentifiers[i]}
                            key={button.value}
                            styleName={`segment-label ${selectedValue === button.value ? 'active' : ''}`}
                        >
                            <input
                                checked={selectedValue === button.value}
                                id={this.buttonIdentifiers[i]}
                                name={this.buttonGroupName}
                                onChange={this.handleOptionChange}
                                type="radio"
                                value={button.value}
                            />
                            <p styleName="segment-name">
                                {button.label}
                            </p>
                        </label>
                    ))
                }
            </div>
        );
    }
}
