import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';


const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(
            PropTypes.node,
        ),
        PropTypes.node,
    ]).isRequired,

    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        console.log('Create listitem');
    }

    render() {
        console.log('Rendering listitem');

        return (
            <div
                className={this.props.className}
                styleName="list-item"
            >
                { this.props.children }
            </div>
        );
    }
}
