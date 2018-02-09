import React from 'react';

import PrivateRoute from './PrivateRoute';

/*
 * ExclusivelyPublicRoute has inverted behavior to PrivateRoute
 * When user is authenticated, this route is inaccessible
 * And the user is redirect to 'redirectLink'
 */
const ExclusivelyPublicRoute = props => <PrivateRoute invertBehavior {...props} />;
export default ExclusivelyPublicRoute;
