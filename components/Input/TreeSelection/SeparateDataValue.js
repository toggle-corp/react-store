import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { pick } from '../../../utils/common';

const emptyList = [];

const propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    value: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    value: [],
};

const mergeDataValue = (data, value) => {
    const newValue = {
        ...data,
        ...value,
    };

    if (newValue.nodes) {
        newValue.nodes = newValue.nodes.map((_, i) => mergeDataValue(
            (data.nodes || emptyList)[i],
            (value.nodes || emptyList)[i],
        ));
    }

    return newValue;
};


const pickRecursive = (mergedDataValue, keys) => {
    const pickedData = pick(mergeDataValue, keys);
    if (pickedData.nodes) {
        pickedData.nodes = pickedData.map(d => pickRecursive(d, keys));
    }
    return pickedData;
};

export default (WrappedComponent) => {
    class SeparatedComponent extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        handleChange = (value) => {
            const { onChange } = this.props;
            onChange(pickRecursive(value, ['key', 'selected', 'nodes']));
        }

        calcProps = () => {
            const { value, data, ...otherProps } = this.props;

            return {
                ...otherProps,
                value: { ...data, ...value },
                onChange: this.handleChange,
            };
        }

        render() {
            const props = this.calcProps();
            return (
                <WrappedComponent {...props} />
            );
        }
    }

    return hoistNonReactStatics(
        SeparatedComponent,
        WrappedComponent,
    );
};
