import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DropdownBody from './DropdownBody';
import styles from './styles.scss';

/**
 * Iconleft is the name of ionicon in left of title button
 * MarginTop is extra top shift if required
 * showDropdown shows chevron on right of title button
 * */
const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    iconLeft: PropTypes.string,
    marginTop: PropTypes.number,
    showDropdownIcon: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    iconLeft: '',
    marginTop: 0,
    showDropdownIcon: true,
    title: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class DropdownMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            position: { right: 0, top: 0 },
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.calculatePosition);

        this.calculatePosition();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.calculatePosition);
    }

    getReference = (container) => {
        this.container = container;
    };

    dropdownShow= () => {
        this.setState({ show: true });
    };

    dropdownCollapse = () => {
        this.setState({ show: false });
    };

    handleDropdownClick = () => {
        this.setState({ show: !this.state.show });
    };

    // TODO: Better comment required here
    calculatePosition = () => {
        // Client Rect
        const cr = this.container.getBoundingClientRect();

        const position = {
            right: window.innerWidth - (cr.left + cr.width),
            top: cr.top + cr.height,
        };

        this.setState({ position });
    }

    render() {
        const { show } = this.state;
        const { title, iconLeft, showDropdownIcon, marginTop } = this.props;

        return (
            <div
                ref={this.getReference}
                styleName="dropdown"
            >
                <button
                    onClick={this.handleDropdownClick}
                    styleName="dropdown-header"
                >
                    <div>
                        <i
                            className={iconLeft}
                            styleName="item-icon"
                        />
                        {title}
                    </div>
                    { showDropdownIcon &&
                        <i
                            className="ion-chevron-down"
                            styleName={show ? 'rotated' : ''}
                        />
                    }
                </button>
                <DropdownBody
                    marginTop={marginTop}
                    onCollapse={this.dropdownCollapse}
                    onDropdownShow={this.dropdownShow}
                    position={this.state.position}
                    show={show}
                >
                    {this.props.children}
                </DropdownBody>
            </div>
        );
    }
}

export { default as DropdownItem } from './DropdownItem';
export { default as Group } from './Group';
export { default as GroupTitle } from './GroupTitle';
