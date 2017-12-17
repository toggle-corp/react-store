import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const propTypes = {
    /*
     * any react child component
     */
    component: PropTypes.func.isRequired,
    /*
     * identifies if the session is authenticated or not
     */
    authenticated: PropTypes.bool.isRequired,
    /*
     * if invertBehavior is true then route is inaccessible
     * when session is authenticated
     */
    invertBehavior: PropTypes.bool,
    /*
     * link to be redirected to
     */
    redirectLink: PropTypes.string,
};

const defaultProps = {
    invertBehavior: false,
    redirectLink: '/login/',
};

/*
 * When session is not authenticated, this route is inaccessible
 * And route is redirected to 'redirectLink'
 */
export default class PrivateRoute extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    shouldRedirect = (authenticated, invertBehavior) => (
        (!invertBehavior && !authenticated) || (invertBehavior && authenticated)
    )

    renderFn = (props) => {
        const {
            component: Component,
            redirectLink,

            authenticated,
            invertBehavior,
        } = this.props;

        if (this.shouldRedirect(authenticated, invertBehavior)) {
            return (
                <Redirect
                    to={{
                        pathname: redirectLink,
                        from: props.location || { pathname: '/' },
                    }}
                />
            );
        }

        return <Component {...props} />;
    }

    render() {
        const {
            /* eslint-disable no-unused-vars */
            authenticated,
            component,
            invertBehavior,
            redirectLink,
            /* eslint-enable no-unused-vars */

            // NOTE: Passing all other props to Route component
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
 * ExclusivelyPublicRoute has inverted behavior to PrivateRoute
 * When user is authenticated, this route is inaccessible
 * And the user is redirect to 'redirectLink'
 */
export const ExclusivelyPublicRoute = props => <PrivateRoute invertBehavior {...props} />;
