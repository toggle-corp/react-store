import React from 'react';
import { findDifferenceInObject } from '../../utils/common';

const propTypes = {
};

const defaultProps = {
};

export default function (name) {
    return WrappedComponent => (
        class extends React.PureComponent {
            static propTypes = propTypes;
            static defaultProps = defaultProps;

            componentWillReceiveProps(nextProps) {
                console.warn('Component:', name);
                const changes = findDifferenceInObject(this.props, nextProps);
                if (changes.length === 0) {
                    console.info('No change found');
                } else {
                    console.info(changes);
                }
            }

            render() {
                return (<WrappedComponent {...this.props} />);
            }
        }
    );
}
