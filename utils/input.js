import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

// XXX: Remove this file after using Faram

/*
 * InputAPI
 *
 * Instance of this is passed with InputContext
 * and is used by context provider to control all
 * input children.
 */

export class InputAPI {
    constructor(props) {
        this.props = props;
    }

    setValue = (inputName, value) => {
        if (this.props.onChange) {
            const newValue = {
                ...this.props.value,
                [inputName]: value,
            };
            this.props.onChange(newValue);
        }
    }

    getValue = inputName => this.props.value[inputName];
    getError = inputName => this.props.error[inputName];
    isDisabled = () => this.props.disabled;

    getProps = inputName => ({
        value: this.getValue(inputName),
        error: this.getError(inputName),
        onChange: v => this.setValue(inputName, v),
        disabled: this.isDisabled(),
    })
}

/*
 * InputContext
 *
 * A react context to pass InputAPI
 */

export const InputContext = React.createContext(undefined);


/*
 * Input HOC
 *
 * Transforms a component that has `onChange` and `value`
 * props to a consumer of InputContext and auto connect the
 * input `inputName` field of the form data.
 */


const propTypes = {
    inputName: PropTypes.string,
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    inputName: undefined,
    forwardedRef: undefined,
};

const Input = (WrappedComponent) => {
    class InputHOC extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        render() {
            const { inputName, forwardedRef, ...props } = this.props;

            return (
                <InputContext.Consumer>
                    {api => ((api && inputName) ? (
                        <WrappedComponent
                            ref={forwardedRef}
                            {...api.getProps(inputName)}
                            {...props}
                        />
                    ) : (
                        <WrappedComponent {...this.props} />
                    ))}
                </InputContext.Consumer>
            );
        }
    }

    return hoistNonReactStatics(React.forwardRef((props, ref) => (
        <InputHOC {...props} forwardedRef={ref} />
    )), WrappedComponent);
};

export default Input;
