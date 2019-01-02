import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

// TODO: move to utils
// eslint-disable-next-line no-underscore-dangle
const _cs = (...props) => props.filter(c => !!c).join(' ');

const propTypes = {
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    mainContentClassName: PropTypes.string,
    sidebarClassName: PropTypes.string,
    footerClassName: PropTypes.string,
    header: PropTypes.node,
    mainContent: PropTypes.node,
    sidebar: PropTypes.node,
    footer: PropTypes.node,
};

const defaultProps = {
    className: '',
    headerClassName: '',
    mainContentClassName: '',
    sidebarClassName: '',
    footerClassName: '',
    header: null,
    mainContent: null,
    sidebar: null,
    footer: null,
};

export default class Page extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            header,
            headerClassName,
            mainContent,
            mainContentClassName,
            sidebar,
            sidebarClassName,
            footer,
            footerClassName,
            containerRef,
        } = this.props;

        if (sidebar) {
            return (
                <div
                    className={_cs(className, styles.pageWithSidebar)}
                    ref={containerRef}
                >
                    <aside className={_cs(sidebarClassName, styles.sidebar)}>
                        { sidebar }
                    </aside>
                    <div className={styles.content}>
                        { header && (
                            <header className={_cs(headerClassName, styles.header)}>
                                { header }
                            </header>
                        )}
                        { mainContent && (
                            <main className={_cs(mainContentClassName, styles.mainContent)}>
                                { mainContent }
                            </main>
                        )}
                        { footer && (
                            <footer className={_cs(footerClassName, styles.footer)}>
                                { footer }
                            </footer>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div
                className={_cs(className, styles.page)}
                ref={containerRef}
            >
                { header && (
                    <header className={_cs(headerClassName, styles.header)}>
                        { header }
                    </header>
                )}
                { mainContent && (
                    <main className={_cs(mainContentClassName, styles.mainContent)}>
                        { mainContent }
                    </main>
                )}
                { footer && (
                    <footer className={_cs(footerClassName, styles.footer)}>
                        { footer }
                    </footer>
                )}
            </div>
        );
    }
}
