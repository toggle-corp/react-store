import PropTypes from 'prop-types';
import React from 'react';

import { _cs } from '@togglecorp/fujs';

import List from '../List';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    views: PropTypes.shape(PropTypes.Node),
    activeClassName: PropTypes.string,
    containerClassName: PropTypes.string,
    useHash: PropTypes.bool,
    active: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    active: undefined,
    className: undefined,
    views: {},
    activeClassName: styles.active,
    containerClassName: undefined,
    useHash: false,
};

export default class MultiViewContainer extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            hash: props.useHash
                ? this.getHash()
                : undefined,
        };

        this.lazyContainers = {};
    }

    componentDidMount() {
        const { useHash } = this.props;

        if (useHash) {
            window.addEventListener('hashchange', this.handleHashChange);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { useHash: newUseHash } = nextProps;
        const { useHash: oldUseHash } = this.props;

        if (newUseHash !== oldUseHash) {
            if (newUseHash) {
                this.setState({ hash: this.getHash() });
                window.addEventListener('hashchange', this.handleHashChange);
            } else {
                window.removeEventListener('hashchange', this.handleHashChange);
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange);
    }

    getHash = () => (
        window.location.hash.substr(2)
    )

    handleHashChange = () => {
        this.setState({ hash: this.getHash() });
    }

    renderContainer = (p) => {
        const {
            view,
            isActive,

            activeClassName,
            containerClassName,

            ...otherProps
        } = p;

        const Component = view.component;

        if (view.wrapContainer) {
            const className = _cs(
                containerClassName,
                styles.container,
                isActive && activeClassName,
            );

            return (
                <div className={className}>
                    <Component
                        {...otherProps}
                    />
                </div>
            );
        }

        const className = _cs(
            isActive && activeClassName,
        );

        return (
            <Component
                className={className}
                {...otherProps}
            />
        );
    }

    renderView = (k, data) => {
        const {
            views,
            active,
            useHash,
        } = this.props;

        const key = data;
        let isActive;

        if (useHash) {
            const {
                hash,
            } = this.state;

            isActive = hash === String(key);
        } else {
            isActive = String(active) === String(key);
        }

        const view = views[data];
        const Container = this.renderContainer;
        const { lazyMount } = view;

        if (!view.mount && !isActive) {
            return null;
        }

        if (lazyMount) {
            let LazyContainer = this.lazyContainers[key];
            if (!LazyContainer) {
                if (!isActive) {
                    return null;
                }

                this.lazyContainers[key] = p => <Container {...p} />;
                LazyContainer = this.lazyContainers[key];
            }

            const params = view.rendererParams ? view.rendererParams() : {};
            return (
                <LazyContainer
                    key={key}
                    view={view}
                    isActive={isActive}
                    {...params}
                />
            );
        }

        const params = view.rendererParams ? view.rendererParams() : {};
        return (
            <Container
                key={key}
                view={view}
                isActive={isActive}
                {...params}
            />
        );
    }

    render() {
        const { views } = this.props;

        // FIXME: memoize this
        const viewList = Object.keys(views);

        return (
            <List
                data={viewList}
                modifier={this.renderView}
            />
        );
    }
}
