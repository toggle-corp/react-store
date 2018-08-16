import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';

import update from '../../../utils/immutable-update';

const propTypes = {
    columns: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    columns: [],
    settings: {},
};

export default (WrappedComponent) => {
    const ColumnWidthComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        render() {
            const {
                columns,
                settings,
                ...otherProps
            } = this.props;

            const { columnWidths } = settings;

            const newColumns = columns.map(column => ({
                ...column,
                width: columnWidths[column.key],
            }));

            console.warn(newColumns);

            return (
                <WrappedComponent
                    columns={newColumns}
                    settings={settings}
                    {...otherProps}
                />
            );
        }
    };

    return hoistNonReactStatics(ColumnWidthComponent, WrappedComponent);
};
