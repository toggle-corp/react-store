import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    /**
     * required for style override
     */
    className: PropTypes.string,

    /**
     * unique name for the radio input
     */
    name: PropTypes.string.isRequired,

    /**
     * list of options
     */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ).isRequired,

    onChange: PropTypes.func,

    /**
     * key for selected option
     */
    value: PropTypes.string,
};

const defaultProps = {
    className: '',
    onChange: undefined,
    value: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class RadioInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const selectedOption = this.props.value &&
            this.props.options.find(d => d.key === this.props.value);
        this.state = {
            selectedOption,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.value !== nextProps.value ||
            this.props.options !== nextProps.options
        ) {
            const selectedOption = nextProps.value &&
                nextProps.options.find(d => d.key === nextProps.value);
            this.setState({
                selectedOption,
            });
        }
    }

    getValue = () => (this.state.selectedOption.key)

    handleOptionClick = (key) => {
        const option = this.props.options.find(d => d.key === key);

        this.setState({
            selectedOption: option,
        });

        if (this.props.onChange) {
            this.props.onChange(option.key);
        }
    }

    render() {
        const {
            className,
            name,
        } = this.props;
        const { selectedOption } = this.state;

        return (
            <div
                className={`radio-input ${className}`}
                styleName="radio-input"
            >
                {
                    this.props.options.map(option => (
                        <Option
                            key={option.key}
                            label={option.label}
                            name={name}
                            checked={selectedOption && option.key === selectedOption.key}
                            onClick={() => this.handleOptionClick(option.key)}
                        />
                    ))
                }
            </div>
        );
    }
}
