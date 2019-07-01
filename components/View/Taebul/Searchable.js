import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import memoize from 'memoize-one';
import { isFalsy } from '@togglecorp/fujs';

const propTypes = {
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    settings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    searchFunction: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
    settings: {},
};

export default (WrappedComponent) => {
    const SearchedComponent = class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = defaultProps;

        searchData = memoize((data, searchFunction, searchTerm) => {
            if (isFalsy(searchTerm, [''])) {
                return data;
            }
            return data.filter(datum => searchFunction(datum, searchTerm));
        })

        render() {
            const {
                data,
                settings,
                searchFunction,
                ...otherProps
            } = this.props;

            const newData = this.searchData(
                data,
                searchFunction,
                settings.searchTerm,
            );

            return (
                <WrappedComponent
                    data={newData}
                    settings={settings}
                    {...otherProps}
                />
            );
        }
    };
    return hoistNonReactStatics(SearchedComponent, WrappedComponent);
};
