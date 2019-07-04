import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import MapContext from './context';


export default (ChildComponent) => {
    class ExtendedChildComponent extends React.PureComponent {
        renderChild = (injectedProps) => {
            const { map } = injectedProps;
            if (!map) {
                return null;
            }

            return (
                <ChildComponent
                    {...injectedProps}
                    {...this.props}
                />
            );
        }

        render() {
            return (
                <MapContext.Consumer>
                    {this.renderChild}
                </MapContext.Consumer>
            );
        }
    }

    return hoistNonReactStatics(
        ExtendedChildComponent,
        ChildComponent,
    );
};
