import PropTypes from 'prop-types';
import React from 'react';

import List from '../List';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    onClick: PropTypes.func,
    active: PropTypes.string,
};

const defaultProps = {
    active: undefined,
    className: '',
    tabs: [],
    onClick: () => {},
};

export default class ScrollTabs extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'fixed-tabs',
            styles['fixed-tabs'],
        ];

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const classNames = [
            styles.tab,
            'fixed-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleTabClick = (key) => {
        const { onClick } = this.props;
        onClick(key);
    }

    renderTab = (key, data) => {
        const {
            active,
            tabs,
        } = this.props;
        const isActive = data === active;
        const className = this.getTabClassName(isActive);
        const onClick = () => { this.handleTabClick(data); };

        return (
            <button
                onClick={onClick}
                className={className}
                key={data}
            >
                { tabs[data] }
            </button>
        );
    }

    render() {
        const {
            tabs,
        } = this.props;

        const tabList = Object.keys(tabs);
        const className = this.getClassName();
        return (
            <div className={className}>
                <List
                    data={tabList}
                    modifier={this.renderTab}
                />
                <div className={styles.void} />
            </div>
        );
    }
}
