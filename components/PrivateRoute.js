import PropTypes from 'prop-types';
import React from 'react';

import {
    Route,
    Redirect,
} from 'react-router-dom';


export default class PrivateRoute extends React.PureComponent {
    static propTypes = {
        component: PropTypes.func.isRequired,
        authenticated: PropTypes.bool.isRequired,
        location: PropTypes.shape({
            pathname: PropTypes.string.isRequired,
        }),
    };

    static defaultProps = {
        location: {
            pathname: '/',
        },
    }

    // NOTE: this could be optimized
    renderFn = (props) => {
        const { component: Component, authenticated } = this.props;

        if (authenticated) {
            return <Component {...props} />;
        }

        return (
            <Redirect
                to={{
                    pathname: '/login/',
                    from: props.location,
                }}
            />
        );
    }

    render() {
        const {
            // NOTE: Professional stuff, don't try to alter these
            component, // eslint-disable-line
            authenticated, // eslint-disable-line

            ...otherProps
        } = this.props;

        return (
            <Route
                {...otherProps}
                render={this.renderFn}
            />
        );
    }
}
