import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import { parseUrlParams } from '@togglecorp/react-rest-request';

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

    static defaultLocation = { pathname: '/' };

    static shouldRedirect = (authenticated, invertBehavior) => (
        (!invertBehavior && !authenticated) || (invertBehavior && authenticated)
    )

    renderComponent= (props) => {
        const {
            authenticated,
            component: Component,
            invertBehavior,
            redirectLink,
        } = this.props;

        // NOTE: props contain params to be sent to child only

        if (PrivateRoute.shouldRedirect(authenticated, invertBehavior)) {
            const from = props.location || PrivateRoute.defaultLocation;
            let search;

            if (authenticated) {
                // We are authenticated and redirecting from a login page.
                // In this case, check if there is a `next` param in url
                // and redirect to `next` if there is.

                const searchString = from.search.replace('?', '');
                const queryParams = parseUrlParams(searchString);
                if (queryParams.next) {
                    const params = {
                        pathname: queryParams.next,
                        from,
                    };
                    return <Redirect to={params} />;
                }
            } else {
                // We are not authenticated and redirecting to a login page.
                // In this case, add `next` param to the login url so that
                // user can come back to current page.
                search = `?next=${from.pathname}`;
            }

            const params = {
                pathname: redirectLink,
                search,
                from,
            };
            return <Redirect to={params} />;
        }

        return <Component {...props} />;
    }

    render() {
        const {
            /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
            authenticated,
            component,
            invertBehavior,
            redirectLink,
            /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

            // NOTE: Passing all other props to Route component
            ...otherProps
        } = this.props;

        return (
            <Route
                {...otherProps}
                render={this.renderComponent}
            />
        );
    }
}
