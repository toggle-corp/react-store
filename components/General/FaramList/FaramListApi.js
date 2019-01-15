import FaramGroupApi from '../FaramGroup/FaramGroupApi';
import { isFalsy } from '../../../utils/common';

const emptyArray = [];

export default class FaramListApi extends FaramGroupApi {
    constructor(props) {
        super(props);
        this.handlers = this.getHandler();
    }

    getHandler() {
        return {
            ...super.getHandler(),
            list: {
                getPropsFromApi: ({ faramElement, ...otherProps }) => ({
                    apiProps: faramElement
                        ? {}
                        : undefined,
                    otherProps,
                }),
                calculateElementProps: () => ({
                    data: this.props.value,
                    keySelector: this.props.keySelector,
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
                    keySelector: this.props.keySelector,
                }),
            },
        };
    }

    getEmptyElement = () => emptyArray;

    // override FaramGroupApi
    getNewValue = (key, oldValue, newValue) => {
        const result = [...oldValue];
        result[key] = newValue;
        return result;
    }

    getError = (faramElementName) => {
        const val = this.getValue(faramElementName);
        const index = !isFalsy(val) ? this.props.keySelector(val) : undefined;
        return this.props.error
            ? this.props.error[index]
            : undefined;
    }
}
