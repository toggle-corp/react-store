import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import styles from './styles.scss';

/**
 * DropdownBody takes its children and populates in a container attached
 * to the main document instead of its hierarchy
 */
const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    marginTop: PropTypes.number.isRequired,
    onCollapse: PropTypes.func.isRequired,
    position: PropTypes.shape({ right: PropTypes.number, top: PropTypes.number }).isRequired,
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    closeDropdown: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class DropdownBody extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.mountComponent();
    }

    componentDidUpdate() {
        this.mountComponent();
    }

    mountComponent = () => {
        this.container = document.getElementById('dropdown-container');

        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('click', this.handleClick);

        if (this.props.show) {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'dropdown-container';
                document.body.appendChild(this.container);
            }
            this.container.style.right = `${this.props.position.right}px`;
            this.container.style.top = `${this.props.position.top + this.props.marginTop}px`;
            this.container.style.position = 'absolute';

            document.addEventListener('keydown', this.handleKeyPress);
            document.addEventListener('click', this.handleClick);

            this.updateComponent();
        } else if (this.container) {
            this.container.remove();
        }
    }

    handleClick = () => {
        this.close();
    }

    handleKeyPress = (e) => {
        if (e.code === 'Escape') {
            this.close();
        }
    }

    updateComponent = () => {
        ReactDOM.render(
            CSSModules(
                this.renderBodyContent, styles, { allowMultiple: true })(),
            this.container,
        );
    }

    close = () => {
        this.container.remove();
        this.props.onCollapse();
    }

    renderBodyContent = () => (
        <div
            styleName={`dropdown-list ${this.props.show ? 'shown' : ''}`}
        >
            { this.props.children }
        </div>
    )

    render() {
        return null;
    }
}
