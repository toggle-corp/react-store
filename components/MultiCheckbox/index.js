import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { TransparentButton } from '../Button';
import styles from './styles.scss';
import Checkbox from '../Checkbox';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.node.isRequired,

    options: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            title: PropTypes.node.isRequired,
            isChecked: PropTypes.bool.isRequired,
        }).isRequired,
    ).isRequired,

    onChange: PropTypes.func.isRequired,

    showDropdownArrow: PropTypes.bool,
};

const defaultProps = {
    className: '',
    showDropdownArrow: true,
};

@CSSModules(styles, { allowMultiple: true })
export default class MultiCheckbox extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        let allChecked = true;
        let allUnChecked = true;

        this.props.options.forEach((item) => {
            if (item.isChecked) {
                allUnChecked = false;
            } else {
                allChecked = false;
            }
        });

        this.state = {
            initialCheck: true,
            allChecked,
            allUnChecked,
            showOptions: false,
            displayOptions: this.props.options,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ displayOptions: nextProps.options });
    }

    onButtonClick = () => {
        const { allChecked } = this.state;
        let displayOptions = [...this.state.displayOptions];

        let newState;
        if (!allChecked) {
            displayOptions = displayOptions.map(option => ({
                ...option,
                isChecked: true,
            }));
            newState = {
                displayOptions,
                allChecked: true,
                allUnChecked: false,
            };
        } else {
            displayOptions = displayOptions.map(option => ({
                ...option,
                isChecked: false,
            }));
            newState = {
                displayOptions,
                allChecked: false,
                allUnChecked: true,
            };
        }
        this.setState(newState, () => this.props.onChange(displayOptions));
    }

    onClickShowButton = () => {
        this.setState({ showOptions: !this.state.showOptions });
    }

    getButtonStyle = (allChecked, allUnChecked) => {
        if (allChecked) {
            return 'ion-android-checkbox';
        } else if (allUnChecked) {
            return 'ion-android-checkbox-outline-blank';
        }

        return 'ion-android-checkbox-blank';
    }

    handleOptionChange = (key, value) => {
        let allChecked = true;
        let allUnChecked = true;

        const displayOptions = [...this.state.displayOptions];
        console.log(displayOptions);

        const option = displayOptions.find(d => d.key === key);
        option.isChecked = value;

        if (allChecked || allUnChecked) {
            this.setState({
                allChecked: false,
                allUnChecked: false,
            });
        }

        displayOptions.forEach((item) => {
            if (item.isChecked) {
                allUnChecked = false;
            } else {
                allChecked = false;
            }
        });

        this.setState({
            allChecked,
            allUnChecked,
            displayOptions,
        });

        // Callback is called after an option is changed
        this.props.onChange(this.state.displayOptions);
    }


    render() {
        const {
            className,
            title,
            showDropdownArrow,
        } = this.props;
        const {
            allChecked,
            allUnChecked,
            displayOptions,
            showOptions,
        } = this.state;

        return (
            <div
                className={`multicheck ${className}`}
                styleName="multicheck"
            >
                <div
                    className="parent-container"
                    styleName="parent-container"
                >
                    <div
                        className="parent-check"
                        styleName="parent-check"
                        onClick={this.onButtonClick}
                        role="presentation"
                    >
                        <span
                            styleName={allUnChecked ? 'icon unchecked' : 'icon'}
                            className={`checkbox-icon ${this.getButtonStyle(allChecked, allUnChecked)}`}
                        />
                    </div>
                    <div
                        onClick={this.onClickShowButton}
                        className="button-title"
                        styleName="title"
                        role="presentation"
                    >
                        {title}
                    </div>
                    {showDropdownArrow &&
                        <div
                            onClick={this.onClickShowButton}
                            className="dropdown-arrow"
                            styleName="arrow"
                            role="presentation"
                        >
                            <span
                                className={`ion-chevron-down ${showOptions ? 'chevron show' : 'chevron'}`}
                                styleName={showOptions ? 'chevron show' : 'chevron'}
                            />
                        </div>
                    }
                </div>
                <div
                    styleName={showOptions ? 'options-container show' : 'options-container'}
                >
                    {
                        displayOptions.map(option => (
                            <Checkbox
                                key={option.key}
                                label={option.title}
                                className="checkbox-indent"
                                styleName="checkbox-indent"
                                initialValue={option.isChecked}
                                onChange={
                                    (value) => {
                                        this.handleOptionChange(option.key, value);
                                    }
                                }
                            />
                        ))
                    }
                </div>
            </div>
        );
    }
}
