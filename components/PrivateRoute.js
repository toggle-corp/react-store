import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Route,
    Redirect,
} from 'react-router-dom';


const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});


@connect(mapStateToProps)
export default class PrivateRoute extends React.PureComponent {
    static propTypes = {
        component: PropTypes.func.isRequired,
        authenticated: PropTypes.bool.isRequired,
        location: PropTypes.object.isRequired,
    };

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
