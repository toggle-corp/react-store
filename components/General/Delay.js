import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

const propTypes = {
    value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    changeDelay: PropTypes.number,
};

const defaultProps = {
    value: undefined,
    onChange: () => {},
    changeDelay: 100,
};

export default (WrappedComponent) => {
    const DelayedComponent = class extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            const { value } = props;

            this.pendingChange = false;
            this.lastValue = value;
            this.state = {
                value,
            };
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            const { value } = this.props;
            if (value !== nextProps.value) {
                if (!this.pendingChange) {
                    this.lastValue = nextProps.value;
                    this.setState({
                        value: nextProps.value,
                    });
                } else {
                    console.warn('DELAYER: Not sending new value due to pending change.');
                }
            }
        }

        componentWillUnmount() {
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
        }

        handleChange = (value, error, info) => {
            const {
                onChange,
                changeDelay,
            } = this.props;

            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }

            this.pendingChange = true;
            this.setState({ value });

            this.changeTimeout = setTimeout(
                () => {
                    this.pendingChange = false;
                    // this.setState({ value: this.lastValue });
                    onChange(value, error, info);
                },
                changeDelay,
            );
        }

        render() {
            const {
                onChange, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
                value, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                changeDelay,
                ...otherProps
            } = this.props;
            const { value: stateValue } = this.state;

            return (
                <WrappedComponent
                    value={stateValue}
                    onChange={this.handleChange}
                    {...otherProps}
                />
            );
        }
    };

    return hoistNonReactStatics(DelayedComponent, WrappedComponent);
};
