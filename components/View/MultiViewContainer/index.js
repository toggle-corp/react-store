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

    renderView = (key, data) => {
        const {
            views,
            active,
        } = this.props;

        const isActive = active === data;
        const view = views[data];
        const Container = this.renderContainer;

        if (!view.mount && !isActive) {
            return null;
        }

        return (
            <Container
                key={data}
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
