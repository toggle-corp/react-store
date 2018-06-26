import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
};

export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderHeader = () => {
        const {
            datum,
            data,
            headerModifier,
        } = this.props;
        return headerModifier(datum, data);
    }

    renderContent = () => {
        const {
            datum,
            data,
            contentModifier,
        } = this.props;

        return contentModifier(datum, data);
    }

    render() {
        const {
            className: classNameFromProps,
            layoutSelector,
            datum,
        } = this.props;

        const className = `
            ${classNameFromProps}
            grid-item
            ${styles.gridItem}
        `;

        const Header = this.renderHeader;
        const Content = this.renderContent;
        const layout = layoutSelector(datum);
        const style = {
            width: layout.width,
            height: layout.height,
            transform: `translate(${layout.left}px, ${layout.top}px)`,
        };

        return (
            <div
                className={className}
                style={style}
            >
                <Header />
                <Content />
            </div>
        );
    }
}
