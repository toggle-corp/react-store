import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { pick } from '@togglecorp/fujs';

const emptyObject = {};

const propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.objectOf(PropTypes.shape({
        selected: PropTypes.oneOf([true, false, 'fuzzy']),
        nodes: PropTypes.objectOf(PropTypes.object),
    })),
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
    value: {},
};

const mergeDataValue = (data = {}, value = {}) => {
    const newValue = {
        ...data,
        selected: value.selected || false,
    };

    if (newValue.nodes) {
        newValue.nodes = newValue.nodes.map(datum => mergeDataValue(
            datum,
            (value.nodes || emptyObject)[datum.key],
        ));
    }

    return newValue;
};


const pickRecursive = (obj, keys) => {
    const pickedData = pick(obj, keys);
    if (pickedData.nodes) {
        pickedData.nodes = pickedData.nodes.reduce((acc, d) => ({
            ...acc,
            [d.key]: pickRecursive(d, keys),
        }), {});
    }
    return pickedData;
};

export default (WrappedComponent) => {
    class SeparatedComponent extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        handleChange = (value) => {
            const { onChange } = this.props;
            const newValue = value.reduce((acc, d) => ({
                ...acc,
                [d.key]: pickRecursive(d, ['selected', 'nodes']),
            }), {});
            onChange(newValue);
        }

        calcProps = () => {
            const { value, data, ...otherProps } = this.props;

            const newValue = data.map(datum => mergeDataValue(
                datum,
                (value || emptyObject)[datum.key],
            ));

            return {
                ...otherProps,
                value: newValue,
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
