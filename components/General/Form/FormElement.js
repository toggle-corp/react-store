import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FormContext from './FormContext';

const propTypes = {
};

const defaultProps = {
};

export default elementType => (WrappedComponent) => {
    class FormElement extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static calculateProps = (api, props) => {
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

        renderWrappedComponent = ({ api } = {}) => {
            const newProps = FormElement.calculateProps(api, this.props);

            return <WrappedComponent {...newProps} />;
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
