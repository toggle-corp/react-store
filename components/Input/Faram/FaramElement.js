import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FaramContext from './FaramContext';
import { isTruthy } from '../../../utils/common';


/*
 * FaramElementHOC
 *
 * Transforms a component that has `onChange` and `value`
 * props to a consumer of FaramContext and auto connect the
 * input `faramElementName` field of the form data.
 */


const propTypes = {
    faramElementName: PropTypes.string,
    forwardedRef: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    faramElementName: undefined,
    forwardedRef: undefined,
};

const FaramElement = elementType => (WrappedComponent) => {
    class FaramElementHOC extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        renderWrappedComponent = (api) => {
            const { faramElementName, forwardedRef, ...props } = this.props;

            const newProps = (api && isTruthy(faramElementName))
                ? { ...api.getCalculatedProps(faramElementName, elementType), ...props }
                : props;

            return (
                <WrappedComponent
                    ref={forwardedRef}
                    {...newProps}
                />
            );
        }

        render() {
            return (
                <FaramContext.Consumer>
                    {this.renderWrappedComponent}
                </FaramContext.Consumer>
            );
        }
    }

    return hoistNonReactStatics(
        React.forwardRef((props, ref) => (
            <FaramElementHOC {...props} forwardedRef={ref} />
        )),
        WrappedComponent,
    );
};

export default FaramElement;
