import PropTypes from 'prop-types';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';


const propTypes = {
    withRoot: PropTypes.bool,
    rootKey: PropTypes.string,
    rootTitle: PropTypes.string,
    rootSelectedInitial: PropTypes.bool,
    value: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    withRoot: false,
    rootKey: undefined,
    rootTitle: undefined,
    rootSelectedInitial: undefined,
    value: [],
};


export default (WrappedComponent) => {
    class ComponentWithExtraRoot extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            this.lastRootSelectionValue = props.rootSelectedInitial;
        }

        handleChange = (value) => {
            const { onChange } = this.props;
            this.lastRootSelectionValue = value[0].selected;
            onChange(value[0].nodes);
        }

        calcProps = () => {
            const {
                withRoot,
                rootKey,
                rootTitle,
                value,
                ...otherProps
            } = this.props;

            if (!withRoot) {
                return this.props;
            }

            return {
                ...otherProps,
                initialExpandState: { [rootKey]: true },
                value: [{
                    key: rootKey,
                    title: rootTitle,
                    selected: this.lastRootSelectionValue || false,
                    nodes: value,
                    draggable: false,
                }],
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
        ComponentWithExtraRoot,
        WrappedComponent,
    );
};
