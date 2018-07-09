import PropTypes from 'prop-types';
import React from 'react';

import HashManager from '../../General/HashManager';
import List from '../List';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.shape({
        dummy: PropTypes.string,
    }),
    onClick: PropTypes.func,
    active: PropTypes.string,
    modifier: PropTypes.func,
    replaceHistory: PropTypes.bool,
    useHash: PropTypes.bool,
    defaultHash: PropTypes.string,
};

const defaultProps = {
    active: undefined,
    className: '',
    tabs: {},
    onClick: () => {},
    modifier: undefined,
    useHash: false,
    replaceHistory: false,
    defaultHash: undefined,
};

export default class VerticalTabs extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            hash: undefined,
        };
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'vertical-tabs',
            styles.verticalTabs,
        ];

        return classNames.join(' ');
    }

    getTabClassName = (isActive) => {
        const classNames = [
            styles.tab,
            'vertical-tab',
        ];

        if (isActive) {
            classNames.push(styles.active);
            classNames.push('active');
        }

        return classNames.join(' ');
    }

    handleHashChange = (hash) => {
        this.setState({ hash });
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

        onClick(key);
    }

    renderTab = (_, data) => {
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
        const content = modifier ? modifier(data, tabs[data]) : tabs[data];

        if (!useHash) {
            const isActive = data === active;
            const className = this.getTabClassName(isActive);

            return (
                <button
                    className={className}
                    key={data}
                    onClick={onClick}
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
        } = this.props;

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
            </div>
        );
    }
}
