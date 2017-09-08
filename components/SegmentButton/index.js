import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import { randomString } from '../../utils/common';

class SegmentButton extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedValue: this.props.selected,
        };

        // NOTE: TO aviod conflict name due to khatri
        const randomStr = randomString(5);
        const { data } = this.props;
        this.buttonGroupName = `buttonGroup-${randomStr}`;
        // NOTE: 'this.props.data' must not change after initialization
        this.buttonIdentifiers = data.map((val, i) => `input-${i}-${randomStr}`);
    }

    handleOptionChange = (changeEvent) => {
        this.props.onPress(changeEvent.target.value);
        this.setState({
            selectedValue: changeEvent.target.value,
        });
    };

    render() {
        const { selectedValue } = this.state;
        const { data } = this.props;

        return (
            <div styleName="segment-container">

                {
                    data.map((button, i) => (
                        <label
                            key={button.value}
                            styleName={`segment-label ${selectedValue === button.value ? 'active' : ''}`}
                            htmlFor={this.buttonIdentifiers[i]}
                        >
                            <input
                                name={this.buttonGroupName}
                                id={this.buttonIdentifiers[i]}
                                type="radio"
                                value={button.value}
                                onChange={this.handleOptionChange}
                                checked={selectedValue === button.value}
                            />
                            <p styleName="segment-name">{button.label}</p>
                        </label>
                    ))
                }
            </div>
        );
    }
}

// TODO: @adityakhatri47, Rename property 'onPress' to 'onClick' for consistency
SegmentButton.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
        }).isRequired,
    ).isRequired,
    selected: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
};

export default CSSModules(SegmentButton, styles, { allowMultiple: true });
