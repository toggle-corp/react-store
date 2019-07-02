import PropTypes from 'prop-types';
import React from 'react';

import HashManager from '../../General/HashManager';
import List from '../List';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    activeClassName: PropTypes.string,
    defaultHash: PropTypes.string,
    onClick: PropTypes.func,
    replaceHistory: PropTypes.bool,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    useHash: PropTypes.bool,
    modifier: PropTypes.func,
    onHashChange: PropTypes.func,
    inverted: PropTypes.bool,
};

const defaultProps = {
    active: undefined,
    children: null,
    className: '',
    itemClassName: '',
    activeClassName: '',
    defaultHash: undefined,
    onClick: () => {},
    replaceHistory: false,
    tabs: {},
    useHash: false,
    modifier: undefined,
    inverted: false,
    onHashChange: undefined,
};


// FIXME: deprecate this over ScrollTabs
export default class FixedTabs extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            hash: undefined,
        };
    }

    getClassName = () => {
        const {
            className,
            inverted,
        } = this.props;

        const classNames = [
            className,
            'fixed-tabs',
            styles.fixedTabs,
        ];

        if (inverted) {
            classNames.push('inverted');
            classNames.push(styles.inverted);
        }

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const {
            itemClassName,
            activeClassName,
        } = this.props;

        const classNames = [
            itemClassName,
            styles.tab,
            'fixed-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push(activeClassName);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleHashChange = (hash) => {
        this.setState({ hash });

        const { onHashChange } = this.props;

        if (onHashChange) {
            onHashChange(hash);
        }
    }

    handleTabClick = (key, e) => {
        const {
            onClick,
            useHash,
            replaceHistory,
        } = this.props;

        if (useHash && replaceHistory) {
            window.location.replace(`#/${key}`);
            e.preventDefault();
        }

        onClick(key, e);
    }

    renderTab = (_, data, index) => {
        const {
            active,
            tabs,
            useHash,
            modifier,
        } = this.props;

        if (!tabs[data]) {
            return null;
        }

        const onClick = (e) => { this.handleTabClick(data, e); };
        const content = modifier ? modifier(data, tabs[data], index) : tabs[data];

        if (!useHash) {
            const isActive = data === active;
            const className = this.getTabClassName(isActive);

            return (
                <button
                    onClick={onClick}
                    className={className}
                    key={data}
                    type="button"
                >
                    { content }
                </button>
            );
        }

        const { hash } = this.state;

        const isActive = hash === data;
        const className = this.getTabClassName(isActive);

        return (
            <a
                onClick={onClick}
                href={`#/${data}`}
                className={className}
                key={data}
            >
                { content }
            </a>
        );
    }

    render() {
        const {
            tabs,
            useHash,
            defaultHash,
            children,
        } = this.props;

        // FIXME: generate tabList when tabs change
        const tabList = Object.keys(tabs);
        const className = this.getClassName();
        return (
            <div className={className}>
                <HashManager
                    tabs={tabs}
                    useHash={useHash}
                    defaultHash={defaultHash}
                    onHashChange={this.handleHashChange}
                />
                <List
                    data={tabList}
                    modifier={this.renderTab}
                />
                <div className={styles.blank}>
                    { children }
                </div>
            </div>
        );
    }
}
