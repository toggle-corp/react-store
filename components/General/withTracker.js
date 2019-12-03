/**
 * From ReactGA Community Wiki Page https://github.com/react-ga/react-ga/wiki/React-Router-v4-withTracker
 */

import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import React, { Component } from 'react';

const trackPage = (page, gaOptions) => {
    if (window.ga && window.ga.create) {
        ReactGA.set({
            page,
            ...gaOptions,
        });
        ReactGA.pageview(page);
    }
};

export default function withTracker(WrappedComponent, options = {}) {
    const propTypes = {
        location: PropTypes.shape({
            pathname: PropTypes.string,
        }).isRequired,
    };
    return class extends Component {
        static propTypes = propTypes;

        componentDidMount() {
            const {
                location,
            } = this.props;
            const page = location.pathname;
            trackPage(page, options);
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            const {
                location,
            } = this.props;
            const currentPage = location.pathname;
            const nextPage = nextProps.location.pathname;

            if (currentPage !== nextPage) {
                trackPage(nextPage, options);
            }
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };
}
