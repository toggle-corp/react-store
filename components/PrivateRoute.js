import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const propTypes = {
    /*
     * the child component 
     */
    component: PropTypes.func.isRequired,
    /*
     * identifies if the user is authenticated or not
     */
    authenticated: PropTypes.bool.isRequired,
    /*
     * if behavior is inverted then redirect occurs if user is authenticated
     */
    invertBehavior: PropTypes.bool,
    /*
     * link to be redirected, if the redirection occurs
     */
    redirectLink: PropTypes.string,
};

const defaultProps = {
    invertBehavior: false,
    redirectLink: '/login/',
};

/*
 * When user is not authenticated, this route is inaccessible
 * And the user is redirect to 'redirectLink'
 */
export default class PrivateRoute extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderFn = (props) => {
        const {
            authenticated,
            component: Component,
            invertBehavior,
            redirectLink,
        } = this.props;

        // return child component when normal behavior and authenticated
        // or inverted behavior and non-authenticated
        if ((!invertBehavior && authenticated) || (invertBehavior && !authenticated)) {
            return <Component {...props} />;
        }

        // else redirect
        return (
            <Redirect
                to={{
                    pathname: redirectLink,
                    from: props.location || { pathname: '/' },
                }}
            />
        );
    }

    render() {
        const {
            // NOTE: Professional stuff, don't try to alter these
            authenticated, // eslint-disable-line
            component, // eslint-disable-line
            invertBehavior, // eslint-disable-line
            redirectLink, // eslint-disable-line

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

/*
 * PublicRoute is the opposite of PrivateRoute
 * When user is authenticated, this route is inaccessible
 * And the user is redirect to 'redirectLink'
 */
export const PublicRoute = props => <PrivateRoute invertBehavior {...props} />;
