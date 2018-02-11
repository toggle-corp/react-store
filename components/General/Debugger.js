import React from 'react';
import { findDifferenceInObject } from '../../utils/common';

export default function (name) {
    return WrappedComponent => (
        class extends React.PureComponent {
            componentWillReceiveProps(nextProps) {
                console.warn(`Received change for Component ${name}`);
                const changes = findDifferenceInObject(this.props, nextProps);
                console.info(
                    changes.length === 0
                        ? 'No change found on received props.'
                        : changes,
                );
            }

            render() {
                return <WrappedComponent {...this.props} />;
            }
        }
    );
}
