import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import hoistNonReactStatics from 'hoist-non-react-statics';

const propTypes = {
    labelSelector: PropTypes.func,
    keySelector: PropTypes.func,
    childrenSelector: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.array,
};

const defaultProps = {
    labelSelector: d => d.label,
    keySelector: d => d.key,
    childrenSelector: d => d.children,
    options: [],
};

export default (WrappedComponent) => {
    const HierarchicalComponent = class extends React.PureComponent {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        static deflateList = (parent, list, ...otherProps) => (
            list.reduce(
                (acc, c) => ([
                    ...acc,
                    ...HierarchicalComponent.deflateObj(parent, c, ...otherProps),
                ]),
                [],
            )
        )

        static deflateObj = (parent, obj, ...otherProps) => {
            const [
                keySelector,
                labelSelector,
                childrenSelector,
            ] = otherProps;


            let label = labelSelector(obj);
            if (parent) {
                const parentLabel = labelSelector(parent);
                label = `${parentLabel} / ${label}`;
            }

            const children = childrenSelector(obj) || [];

            return [
                {
                    key: keySelector(obj),
                    label,
                },
                ...HierarchicalComponent.deflateList(obj, children, ...otherProps),
            ];
        }

        deflate = memoize(HierarchicalComponent.deflateList)

        render() {
            const {
                options,
                keySelector,
                labelSelector,
                childrenSelector,
                ...otherProps
            } = this.props;

            const newOptions = this.deflate(
                undefined,
                options,
                keySelector,
                labelSelector,
                childrenSelector,
            );

            return (
                <WrappedComponent
                    options={newOptions}
                    {...otherProps}
                />
            );
        }
    };
    return hoistNonReactStatics(HierarchicalComponent, WrappedComponent);
};
