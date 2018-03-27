import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    views: PropTypes.shape(PropTypes.Node),
    activeClassName: PropTypes.string,
    containerClassName: PropTypes.string,
    active: PropTypes.string,
};

const defaultProps = {
    active: undefined,
    className: '',
    views: {},
    activeClassName: styles.active,
    containerClassName: '',
};

export default class MultiContentView extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.lazyContainers = {};
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'multi-content-view',
        ];

        return classNames.join(' ');
    }

    getContainerClassName = (isActive) => {
        const {
            containerClassName,
            activeClassName,
        } = this.props;

        const classNames = [
            containerClassName,
            styles.container,
        ];

        if (isActive) {
            classNames.push(activeClassName);
        }

        return classNames.join(' ');
    }

    getContentClassName = (isActive) => {
        const { activeClassName } = this.props;
        const classNames = [];

        if (isActive) {
            classNames.push(activeClassName);
        }
    }

    renderContainer = (p) => {
        const {
            view,
            isActive,
        } = p;

        const Component = view.component;

        if (view.wrapContainer) {
            const className = this.getContainerClassName(isActive);

            return (
                <div className={className}>
                    <Component />
                </div>
            );
        }

        const className = this.getContentClassName(isActive);
        return <Component className={className} />;
    }

    renderView = (k, data) => {
        const {
            views,
            active,
        } = this.props;

        const key = data;
        const isActive = active === key;
        const view = views[data];
        const Container = this.renderContainer;
        const { lazyMount } = view;

        if (!view.mount && !isActive) {
            return null;
        }

        if (lazyMount) {
            let LazyContainer = this.lazyContainers[key] || null;

            if (!LazyContainer) {
                if (!isActive) {
                    return null;
                }

                this.lazyContainers[key] = p => <Container {...p} />;
                LazyContainer = this.lazyContainers[key];
            }

            return (
                <LazyContainer
                    key={key}
                    view={view}
                    isActive={isActive}
                />
            );
        }

        return (
            <Container
                key={key}
                view={view}
                isActive={isActive}
            />
        );
    }

    render() {
        const { views } = this.props;
        const viewList = Object.keys(views);

        return (
            <List
                data={viewList}
                modifier={this.renderView}
            />
        );
    }
}
