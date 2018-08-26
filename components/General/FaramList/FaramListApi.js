import FaramGroupApi from '../FaramGroup/FaramGroupApi';

const emptyArray = [];

export default class FaramListApi extends FaramGroupApi {
    onClickMemory = {}

    constructor(props) {
        super(props);
        this.handlers = this.getHandler();
    }

    getHandler() {
        return {
            ...super.getHandler(),
            action: {
                getPropsFromApi: ({ faramElementName, faramAction, ...otherProps }) => ({
                    apiProps: faramElementName !== undefined && faramAction
                        ? { faramElementName, faramAction }
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: ({ faramElementName, faramAction }) => ({
                    disabled: this.isDisabled() || this.isReadOnly(),
                    changeDelay: this.getChangeDelay(),
                    onClick: this.getOnClick(faramElementName, faramAction),
                }),
            },
            list: {
                getPropsFromApi: ({ faramElement, ...otherProps }) => ({
                    apiProps: faramElement
                        ? {}
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: () => ({
                    data: this.props.value,
                    keyExtractor: this.props.keySelector,
                }),
            },
            sortableList: {
                getPropsFromApi: ({ faramElement, ...otherProps }) => ({
                    apiProps: faramElement
                        ? {}
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: () => ({
                    data: this.props.value,
                    onChange: this.props.onChange,
                    keyExtractor: this.props.keySelector,
                }),
            },
        };
    }

    // override FaramGroupApi
    getNewValue = (key, oldValue, newValue) => {
        const result = [...oldValue];
        result[key] = newValue;
        return result;
    }

    getError = (faramElementName) => {
        const val = this.getValue(faramElementName);
        const index = val ? this.props.keySelector(val) : undefined;
        return this.props.error
            ? this.props.error[index]
            : undefined;
    }

    // NOTE: memoized
    // NOTE: faramAction shouldn't change
    getOnClick = (faramElementName, faramAction) => {
        if (this.onClickMemory[faramElementName]) {
            return this.onClickMemory[faramElementName];
        }

        const newOnClick = () => {
            const newValue = faramAction(this.props.value || emptyArray, faramElementName);
            // Button doesn't have children, so no need to propagate faramInfo
            this.props.onChange(newValue);
        };
        this.onClickMemory[faramElementName] = newOnClick;
        return newOnClick;
    }
}
