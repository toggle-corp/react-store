import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FloatingContainer from '../FloatingContainer';
import Option from './Option';
import styles from './styles.scss';

const propTypes = {
    keySelector: PropTypes.func.isRequired,

    labelSelector: PropTypes.func.isRequired,

    multiple: PropTypes.bool,

    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]),
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

    selectedOptionKeys: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    ),

    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    multiple: false,
    options: [],
    onBlur: undefined,
    onOptionClick: undefined,
    parentClientRect: {
        top: 0,
    },
    selectedOptionKey: undefined,
    selectedOptionKeys: [],
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
            multiple,
            selectedOptionKey,
            selectedOptionKeys,
        } = this.props;

        const options = this.props.options.map((option) => {
            const key = keySelector(option);

            if (multiple) {
                const isChecked = selectedOptionKeys.findIndex(d => d === key) !== -1;

                return (
                    <Option
                        checkable
                        key={key}
                        checked={isChecked}
                        onClick={(checked) => {
                            this.handleOptionClick(key, checked);
                        }}
                    >
                        { labelSelector(option) }
                    </Option>
                );
            }

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

    handleOptionClick = (key, checked) => {
        if (this.props.onOptionClick) {
            this.props.onOptionClick(key, checked);
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
                containerId="select-options-container"
                onBlur={onBlur}
                onClose={this.handleContainerClose}
                onDynamicStyleOverride={this.handleDynamicStyling}
                ref={(el) => { this.container = el; }}
                show={show}
                styleName="options"
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

