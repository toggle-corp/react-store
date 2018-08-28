import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import FormContext from './FormContext';

const propTypes = {
    faramInboundTransform: PropTypes.func,
    faramOutboundTransform: PropTypes.func,
};

const defaultProps = {
    faramInboundTransform: undefined,
    faramOutboundTransform: undefined,
};

export default elementType => (WrappedComponent) => {
    class FormElement extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static calculateProps = (api, originalProps) => {
            const {
                faramInboundTransform, // eslint-disable-line no-unused-vars
                faramOutboundTransform, // eslint-disable-line no-unused-vars
                ...props
            } = originalProps;

            if (!api) {
                return props;
            }

            const {
                injectedProps,
                otherProps,
            } = api.getCalculatedProps(elementType, props);

            if (!injectedProps) {
                return props;
            }

            // NOTE: user can still override the calculated props, if need be
            return {
                ...injectedProps,
                ...otherProps,
            };
        }

        calculateValue = (value) => {
            const { faramInboundTransform } = this.props;
            if (!faramInboundTransform) {
                return value;
            }
            return faramInboundTransform(value);
        }

        calculateOnChange = memoize(onChange => onChange && (
            (value, info) => {
                const {
                    faramOutboundTransform,
                    value: oldValue, // eslint-disable-line react/prop-types
                } = this.props;

                if (!faramOutboundTransform) {
                    onChange(value, info);
                    return;
                }

                onChange(faramOutboundTransform(value, oldValue), info);
            }))

        renderWrappedComponent = ({ api } = {}) => {
            const newProps = FormElement.calculateProps(api, this.props);

            if ('onChange' in newProps) {
                newProps.onChange = this.calculateOnChange(newProps.onChange);
            }
            if ('value' in newProps) {
                newProps.value = this.calculateValue(newProps.value);
            }

            return (
                <WrappedComponent {...newProps} />
            );
        }

        render() {
            return (
                <FormContext.Consumer>
                    {this.renderWrappedComponent}
                </FormContext.Consumer>
            );
        }
    }

    return hoistNonReactStatics(
        FormElement,
        WrappedComponent,
    );
};
