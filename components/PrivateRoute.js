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

    render() {
        const { component: Component, authenticated, ...otherProps } = this.props;
        return (
            <Route
                {...otherProps}
                render={props => (
                    authenticated ? (
                        <Component {...props} />
                    ) : (
                        <Redirect
                            to={{
                                pathname: '/login',
                                state: { from: props.location },
                            }}
                        />
                    )
                )}
            />
        );
    }
}
