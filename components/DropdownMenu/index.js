import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import DropdownBody from './DropdownBody';

const propTypes = {
    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    title: PropTypes.string,
    iconLeft: PropTypes.string,
    showDropdown: PropTypes.bool,
    marginTop: PropTypes.number,
};

const defaultProps = {
    title: '',
    iconLeft: '',
    showDropdown: true,
    marginTop: 0,
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
    }

    calculatePosition = () => {
    // Client Rect
        const cr = this.container.getBoundingClientRect();

        const pos = {
            right: window.innerWidth - (cr.left + cr.width),
            top: cr.top + cr.height,
        };

        this.setState({
            position: pos,
        });
    }

    handleDropdownClick = () => {
        this.calculatePosition();

        this.setState({
            show: !this.state.show,
        });
    };

    dropdownShow= () => {
        this.setState({
            show: true,
        });
    };

    dropdownCollapse = () => {
        this.setState({
            show: false,
        });
    };

    render() {
        const { show } = this.state;
        const { title, iconLeft, showDropdown, marginTop } = this.props;

        return (
            <div styleName="dropdown" ref={(container) => { this.container = container; }}>
                <button
                    styleName="dropdown-header"
                    onClick={this.handleDropdownClick}
                >
                    <div>
                        <i
                            styleName="item-icon"
                            className={iconLeft}
                        />
                        {title}
                    </div>
                    {showDropdown &&
                        <i
                            styleName={show ? 'rotated' : ''}
                            className="ion-chevron-down"
                        />
                    }
                </button>
                <DropdownBody
                    show={show}
                    onCollapse={this.dropdownCollapse}
                    onDropdownShow={this.dropdownShow}
                    position={this.state.position}
                    marginTop={marginTop}
                >
                    {this.props.children}
                </DropdownBody>
            </div>
        );
    }
}

export { default as DropdownItem } from './DropdownItem';
export { default as GroupTitle } from './GroupTitle';
export { default as Group } from './Group';
