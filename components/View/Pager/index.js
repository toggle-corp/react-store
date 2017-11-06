import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';


const propTypes = {
    activePage: PropTypes.number,
    className: PropTypes.string,
    itemsCount: PropTypes.number,
    maxItemsPerPage: PropTypes.number,
    onPageClick: PropTypes.func.isRequired,
};

const defaultProps = {
    activePage: 1,
    className: '',
    itemsCount: 0,
    maxItemsPerPage: 10,
};


@CSSModules(styles, { allowMultiple: true })
export default class Pager extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            activePage,
            className,
            itemsCount,
            maxItemsPerPage,
            onPageClick,
        } = this.props;

        const numPages = Math.ceil(itemsCount / maxItemsPerPage);
        const pages = [];

        if (numPages === 0) {
            return (
                <div
                    className={className}
                    styleName="pager"
                />
            );
        }

        for (let i = 1; i <= numPages; i += 1) {
            const isActive = activePage === i;

            if (isActive) {
                pages.push(
                    <span key={i}>
                        {i}
                    </span>,
                );
            } else {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageClick(i)}
                    >
                        {i}
                    </button>,
                );
            }
        }

        return (
            <div
                className={className}
                styleName="pager"
            >
                <div styleName="page-list">
                    {pages}
                </div>

                <p styleName="info">
                    {'Showing page'}
                    <strong>{activePage}</strong>
                    {'out of'}
                    <strong>{pages.length}</strong>
                </p>
            </div>
        );
    }
}
