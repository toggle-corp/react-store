import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';


const selectors = {
    labelSelector: 'title',
    keySelector: 'key',
    nodesSelector: 'nodes',
};

export default (WrappedComponent) => {
    class SelectedComponent extends React.PureComponent {
        static propTypes = {
            data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
        }

        static defaultProps = {
            data: [],
        }

        static calcNewData = (data, props) => {
            const newData = Object.keys(selectors)
                .filter(s => props[s])
                .reduce((acc, selector) => ({
                    ...acc,
                    [selectors[selector]]: props[selector](data),
                }), { ...data });

            if (newData.nodes) {
                newData.nodes = newData.nodes.map(d => SelectedComponent.calcNewData(d, props));
            }

            return newData;
        }

        calcProps = () => {
            const { data } = this.props;
            const newData = data
                && data.map(datum => SelectedComponent.calcNewData(datum, this.props));

            return {
                ...this.props,
                data: newData,
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
        SelectedComponent,
        WrappedComponent,
    );
};
