import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FormContext from './FormContext';

// FIXME: rename elementType to faramElementType

const propTypes = {
    faramElementName: PropTypes.string,
    faramElementIndex: PropTypes.number,
    faramElement: PropTypes.bool,
    faramInfo: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    faramElementName: undefined,
    faramElementIndex: undefined,
    faramElement: false,
    faramInfo: undefined,
};

export default elementType => (WrappedComponent) => {
    // NOTE: FormElement must not be a PureComponent?
    // FIXME: Why?
    class FormElement extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        static calculateProps = (api, props) => {
            const {
                faramElement,
                faramElementName,
                faramElementIndex,
                faramInfo,
                ...otherProps
            } = props;

            const faramIdentifier = faramElementName || faramElementIndex;

            const shouldInject = api && api.shouldInject({
                faramElement,
                faramIdentifier,
                faramInfo,
            });
            if (!shouldInject) {
                return otherProps;
            }

            const newProps = api.getCalculatedProps({
                faramIdentifier,
                elementType,
                faramInfo,
            });

            // FIXME: should otherProps override newProps?
            return {
                ...newProps,
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
