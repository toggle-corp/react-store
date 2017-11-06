import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import MultiCheckbox from '../MultiCheckbox';
import Checkbox from '../Checkbox';

const propTypes = ({
    className: PropTypes.string,
    options: PropTypes.array.isRequired, // eslint-disable-line
    onChange: PropTypes.func.isRequired,
});

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class MultiCheckboxCollection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            displayMultiCheckboxes: this.props.options,
        };
    }

    handleValueChange = (key, value) => {
        const displayMultiCheckboxes = [...this.state.displayMultiCheckboxes];
        const multiCheckbox = displayMultiCheckboxes.find(d => d.key === key);

        if (multiCheckbox.options) {
            multiCheckbox.options = value;
        } else if (multiCheckbox.isChecked !== undefined) {
            multiCheckbox.isChecked = value;
        }

        this.setState({ displayMultiCheckboxes });
        this.props.onChange(this.state.displayMultiCheckboxes);
    }

    renderCheckbox = (item) => {
        if (item.options === undefined && item.isChecked !== undefined) {
            return (
                <Checkbox
                    key={item.key}
                    label={item.title}
                    styleName="checkbox"
                    initialValue={item.isChecked}
                    onChange={
                        (value) => {
                            this.handleValueChange(item.key, value);
                        }
                    }
                />
            );
        } else if (item.options !== undefined && item.options.length > 0) {
            return (
                <MultiCheckbox
                    key={item.key}
                    title={item.title}
                    onChange={
                        (value) => {
                            this.handleValueChange(item.key, value);
                        }
                    }
                    options={item.options}
                />
            );
        }
        return null;
    }

    render() {
        const { displayMultiCheckboxes } = this.state;

        return (
            <div className={this.props.className}>
                {
                    displayMultiCheckboxes.map(item => this.renderCheckbox(item))
                }
            </div>
        );
    }
}

