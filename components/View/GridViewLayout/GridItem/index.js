import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    headerModifier: PropTypes.func.isRequired,
    contentModifier: PropTypes.func.isRequired,
    layoutSelector: PropTypes.func.isRequired,
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
            headerModifier,
        } = this.props;
        return headerModifier(datum);
    }

    renderContent = () => {
        const {
            datum,
            contentModifier,
        } = this.props;

        return contentModifier(datum);
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
