import { isTruthy } from '../../../utils/common';

import FaramGroupApi from '../FaramGroup/FaramGroupApi';

const noOp = () => {};

export default class FaramListApi extends FaramGroupApi {
    // PRIVATE
    getNewValue = (oldValue, key, val) => {
        const newValue = [...oldValue];
        newValue[key] = val;
        return newValue;
    }

    getError = (faramIdentifier) => {
        const val = this.getValue(faramIdentifier);
        const index = val ? this.props.keySelector(val) : undefined;

        return this.props.error
            ? this.props.error[index]
            : undefined;
    }

    // PRIVATE
    add = (faramInfo = {}) => {
        let { newElement } = faramInfo;
        if (newElement && typeof newElement === 'function') {
            newElement = newElement(this.props.value);
        }
        const newValue = [...this.props.value, newElement];

        this.props.onChange(newValue);

        const { callback } = faramInfo;
        if (callback) {
            callback(newElement, newValue);
        }
    }

    // PRIVATE
    remove = (index, faramInfo = {}) => {
        const newValue = [...this.props.value];
        newValue.splice(index, 1);

        this.props.onChange(newValue);

        const { callback } = faramInfo;
        if (callback) {
            callback(index, newValue);
        }
    }

    // PRIVATE
    change = (value) => {
        const newValue = value;

        // NOTE:
        // return new sorted value
        // clear error for all children
        // return faramInfo as is
        this.props.onChange(newValue, this.props.info);
    }

    // PRIVATE
    getOnClick = ({ faramIdentifier, faramInfo }) => {
        switch (faramInfo.action) {
            case 'add':
                return () => this.add(faramInfo);
            case 'remove':
                return () => this.remove(faramIdentifier, faramInfo);
            default:
                return noOp;
        }
    }

    // Handlers

    actionHandler = ({ faramIdentifier, faramInfo }) => {
        const calculatedProps = {
            disabled: this.isDisabled(),
            onClick: this.getOnClick({ faramIdentifier, faramInfo }),
            changeDelay: this.getChangeDelay(),
        };
        return calculatedProps;
    }

    listHandler = () => {
        const calculatedProps = {
            data: this.props.value,
            keyExtractor: this.props.keySelector,
        };
        return calculatedProps;
    }

    sortableListHandler = () => {
        const calculatedProps = {
            data: this.props.value,
            onChange: this.change,
            keyExtractor: this.props.keySelector,
        };
        return calculatedProps;
    }
}
