import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FormContext from './FormContext';
import { isFalsy } from '../../../utils/common';

// FIXME: remove usage of faramAction
// FIXME: rename elementType to faramElementType

const propTypes = {
    faramElementName: PropTypes.string,
    faramElementIndex: PropTypes.number,
    faramAction: PropTypes.string,
    faramElement: PropTypes.bool,
    faramInfo: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    faramElementName: undefined,
    faramElementIndex: undefined,
    faramAction: undefined,
    faramElement: false,
    faramInfo: undefined,
};

export default elementType => (WrappedComponent) => {
    // NOTE: FormElement must not be a PureComponent?
    // FIXME: Why?
    class FormElement extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        calculateProps = (api) => {
            const {
                faramElement,
                faramElementName,
                faramElementIndex,
                faramAction,
                faramInfo,
                ...otherProps
            } = this.props;

            const faramIdentifier = faramElementName || faramElementIndex;

            if (!api || (!faramElement && isFalsy(faramIdentifier) && isFalsy(faramAction))) {
                return otherProps;
            }

            const newProps = api.getCalculatedProps({
                faramIdentifier,
                elementType,
                faramAction,
                faramInfo,
            });

            // FIXME: should otherProps override newProps?
            return {
                ...newProps,
                ...otherProps,
            };
        }

        renderWrappedComponent = ({ api } = {}) => {
            const newProps = this.calculateProps(api);

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
