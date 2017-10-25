import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    keySelector: PropTypes.func.isRequired,

    labelSelector: PropTypes.func.isRequired,

    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ),

    onBlur: PropTypes.func,

    onOptionClick: PropTypes.func,

    parentClientRect: PropTypes.shape({
        top: PropTypes.number,
    }),

    selectedOptionKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),

    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    options: [],
    onBlur: undefined,
    onOptionClick: undefined,
    parentClientRect: {
        top: 0,
    },
    selectedOptionKey: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class Options extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            containerStyle: {},
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show,
        });
    }

    getOptions = () => {
        const {
            keySelector,
            labelSelector,
            selectedOptionKey,
        } = this.props;

        const options = this.props.options.map((option) => {
            const key = keySelector(option);

            return (
                <Option
                    key={key}
                    selected={key === selectedOptionKey}
                    onClick={() => {
                        this.handleOptionClick(key);
                    }}
                >
                    { labelSelector(option) }
                </Option>
            );
        });

        return options;
    }

    handleDynamicStyling = (optionContainer) => {
        const {
            parentClientRect,
        } = this.props;

        const newStyle = {
            top: `${parentClientRect.top + parentClientRect.height}px`,
            left: `${parentClientRect.left}px`,
            width: `${parentClientRect.width}px`,
        };

        const optionRect = optionContainer.getBoundingClientRect();

        const pageOffset = window.innerHeight;
        const containerOffset = parentClientRect.top + optionRect.height + parentClientRect.height;

        if (pageOffset < containerOffset) {
            newStyle.top = `${(parentClientRect.top + window.scrollY) - optionRect.height}px`;
        }

        return newStyle;
    }

    handleContainerClose = () => {
        this.setState({
            show: false,
        });
    }

    handleContainerBlur = () => {
        this.setState({
            show: false,
        });
    }

    handleOptionClick = (key) => {
        if (this.props.onOptionClick) {
            this.props.onOptionClick(key);
        }
    }

    handleContainerClose = () => {
        // console.log('options closed');
    }

    render() {
        const {
            show,
        } = this.state;

        const {
            onBlur,
        } = this.props;

        return (
            <FloatingContainer
                show={show}
                containerId="select-options-container"
                ref={(el) => { this.container = el; }}
                styleName="options"
                onBlur={onBlur}
                onClose={this.handleContainerClose}
                onDynamicStyleOverride={this.handleDynamicStyling}
            >
                { this.getOptions() }
                {
                    this.props.options.length <= 0 &&
                        <div styleName="empty">
                            No option available
                        </div>
                }
            </FloatingContainer>
        );
    }
}

