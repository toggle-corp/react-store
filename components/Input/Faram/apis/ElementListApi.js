/*
 * ElementListApi
 *
 * Instance of this is passed with FaramContext
 * and is used by context provider to control all
 * input children.
 */

export default class ElementListApi {
    constructor(props) {
        this.setProps(props);
    }

    setProps = (props) => {
        this.props = props;
    }

    getValue = faramElementIndex => this.props.value[faramElementIndex];

    getError = faramElementIndex => this.props.error[faramElementIndex];

    getInternalError = () => this.props.error.$internal;

    isDisabled = () => this.props.disabled;

    getOnChange = faramElementIndex => (value, error) => {
        if (!this.props.onChange) {
            return;
        }

        const newValue = [...this.props.value];
        newValue[faramElementIndex] = value;

        const newError = {
            ...this.props.error,
            $internal: undefined,
            [faramElementIndex]: error,
        };

        this.props.onChange(newValue, newError);
    }

    getOnClick = (add, remove, faramElementIndex) => (
        (add && this.add) ||
        (remove && this.createRemoveHandler(faramElementIndex))
    )

    getCalculatedProps = (faramElementIndex, elementType, add, remove) => {
        switch (elementType) {
            case 'input': {
                const calculatedProps = {
                    value: this.getValue(faramElementIndex),
                    error: this.getError(faramElementIndex),
                    onChange: this.getOnChange(faramElementIndex),
                    disabled: this.isDisabled(),
                };
                return calculatedProps;
            } case 'errorMessage': {
                const calculatedProps = {
                    errors: this.getInternalError(),
                };
                return calculatedProps;
            } case 'action': {
                const calculatedProps = {
                    disabled: this.isDisabled(),
                    onClick: this.getOnClick(add, remove, faramElementIndex),
                };
                return calculatedProps;
            } default:
                console.warn(`Unidentified element type '${elementType}'`);
                return {};
        }
    }

    createRemoveHandler = index => () => this.remove(index);

    add = () => {
        const newValue = [...this.props.value, undefined];
        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        this.props.onChange(newValue, newError);
    }

    remove = (index) => {
        const newValue = [...this.props.value];
        newValue.splice(index, 1);

        const newError = {
            ...this.props.error,
            $internal: undefined,
        };

        delete newError[index];
        for (let i = index + 1; i < this.props.value.length; i += 1) {
            newError[i - 1] = newError[i];
        }

        this.props.onChange(newValue, newError);
    }
}
