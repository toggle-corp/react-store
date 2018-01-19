/**
 * From ReactGA Community Wiki Page https://github.com/react-ga/react-ga/wiki/React-Router-v4-withTracker
 */

import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import React, { Component } from 'react';

const trackPage = (page, options) => {
    if (window.ga && window.ga.create) {
        ReactGA.set({
            page,
            ...options,
        });
        ReactGA.pageview(page);
    }
};

const propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
};

export default function withTracker(WrappedComponent, options = {}) {
    // XXX: Maybe make pure component
    const HOC = class extends Component {
        static propTypes = propTypes;

        componentDidMount() {
            const page = this.props.location.pathname;
            trackPage(page, options);
        }

        componentWillReceiveProps(nextProps) {
            const currentPage = this.props.location.pathname;
            const nextPage = nextProps.location.pathname;

            if (currentPage !== nextPage) {
                trackPage(nextPage, options);
            }
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

    return HOC;
}
