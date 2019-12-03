import React from 'react';

const findDifferenceInObject = (o, n) => {
    const allKeys = new Set([
        ...Object.keys(o),
        ...Object.keys(n),
    ]);

    const changes = [];
    allKeys.forEach((key) => {
        if (o[key] !== n[key]) {
            changes.push({ key, old: o[key], new: n[key] });
        }
    });
    return changes;
};

export default function (name) {
    return WrappedComponent => (
        class extends React.PureComponent {
            UNSAFE_componentWillReceiveProps(nextProps) {
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
