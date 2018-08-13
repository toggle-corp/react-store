import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

import FaramContext from './FaramContext';
import { isFalsy } from '../../../utils/common';


/*
 * FaramElementHOC
 *
 * Transforms a component that has `onChange` and `value`
 * props to a consumer of FaramContext and auto connect the
 * input `faramElementName` field of the form data.
 */


const propTypes = {
    faramElementName: PropTypes.string,
    faramElementIndex: PropTypes.number,
    faramAction: PropTypes.string,
    faramElement: PropTypes.bool,
    faramInfo: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    faramFoldKey: PropTypes.string,
    faramFold: PropTypes.func,
    faramUnfold: PropTypes.func,
};

const defaultProps = {
    faramElementName: undefined,
    faramElementIndex: undefined,
    faramAction: undefined,
    faramElement: false,
    faramInfo: undefined,
    faramFoldKey: undefined,
    faramFold: undefined,
    faramUnfold: undefined,
};

const FaramElement = elementType => (WrappedComponent) => {
    // NOTE: FaramElementHOC must not be a PureComponent
    class FaramElementHOC extends React.Component {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        calculateProps = (api) => {
            const {
                faramElement,
                faramElementName,
                faramElementIndex,
                faramAction,
                faramInfo,
                faramFoldKey,
                faramFold,
                faramUnfold,
                ...otherProps
            } = this.props;

            const faramIdentifier = faramElementName || faramElementIndex;

            if (!api || (!faramElement && isFalsy(faramIdentifier) && isFalsy(faramAction))) {
                return otherProps;
            }

            const foldInfo = {
                key: faramFoldKey,
                fold: faramFold,
                unfold: faramUnfold,
            };
            const newProps = api.getCalculatedProps({
                faramIdentifier,
                elementType,
                faramAction,
                faramInfo,
                foldInfo,
            });

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
                <FaramContext.Consumer>
                    {this.renderWrappedComponent}
                </FaramContext.Consumer>
            );
        }
    }

    return hoistNonReactStatics(
        FaramElementHOC,
        WrappedComponent,
    );
};

export default FaramElement;
