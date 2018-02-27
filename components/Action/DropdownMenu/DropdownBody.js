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
    onCollapse: PropTypes.func.isRequired,
    dimension: PropTypes.shape({
        right: PropTypes.string,
        top: PropTypes.string,
        width: PropTypes.string,
    }).isRequired,
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    closeDropdown: false,
};

export default class DropdownBody extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        this.mountComponent();
    }

    componentDidUpdate() {
        this.mountComponent();
    }

    componentWillUnmount() {
        // Close dropdown children
        if (this.container) {
            this.container.remove();
        }

        // Remove any listener
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('click', this.handleClick);
    }

    mountComponent = () => {
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('click', this.handleClick);

        this.container = document.getElementById('dropdown-container');
        if (this.props.show) {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'dropdown-container';
                document.body.appendChild(this.container);
            }
            const { dimension } = this.props;
            this.container.style.left = dimension.left;
            this.container.style.top = dimension.top;
            this.container.style.width = dimension.width;
            this.container.style.position = 'absolute';

            document.addEventListener('keydown', this.handleKeyPress);
            document.addEventListener('click', this.handleClick);

            this.updateComponent();
        } else if (this.container) {
            // NOTE: no this.props.onCollapse() here
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
        const BodyContent = this.renderBodyContent;
            BodyContent,
            styles,
            { allowMultiple: true },
        )();

        ReactDOM.render(BodyContentWithCss, this.container);
    }

    close = () => {
        // Call a callback
        this.props.onCollapse();
        // Remove the dropdown child
        this.container.remove();
    }

    renderBodyContent = () => (
        <div className={`${styles['dropdown-list']} ${this.props.show ? styles.shown : ''}`} >
            { this.props.children }
        </div>
    )

    render() {
        return null;
    }
}
