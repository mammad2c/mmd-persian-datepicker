import React, { RefObject } from "react";
import MmdPersianDatepicker, {
  defaultOptionsValue,
  IOptions,
} from "mmd-persian-datepicker";

interface Props extends IOptions<MmdPersianDatepicker> {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  customRender?: (
    inputProps: Props["inputProps"],
    ref: (node: RefObject<HTMLInputElement>) => void
  ) => JSX.Element;
}

class ReactComponent extends React.Component<Props> {
  static defaultProps = defaultOptionsValue;
  private instance?: MmdPersianDatepicker;
  private element?: HTMLElement;

  private createInstance = (): void => {
    if (this.element) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inputProps, customRender, ...restProps } = this.props;
      this.instance = new MmdPersianDatepicker(this.element, restProps);
    }
  };

  private destroyInstance = (): void => {
    if (!this.instance) {
      return;
    }

    this.instance.destroy();
  };

  private handleRef = (node: any): void => {
    if (this.element) {
      return;
    }

    this.element = node;

    if (this.instance) {
      this.destroyInstance();
      this.createInstance();
    }
  };

  public componentDidMount(): void {
    this.createInstance();
  }
  public componentDidUpdate(prevProps: Props): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { defaultValue, inputProps, customRender, ...restProps } = this.props;

    if (
      Object.prototype.hasOwnProperty.call(this.props, "defaultValue") &&
      prevProps.defaultValue !== defaultValue &&
      typeof defaultValue !== "boolean"
    ) {
      this.instance?.setDate(defaultValue, false);
    } else if (
      Object.prototype.hasOwnProperty.call(this.props, "defaultValue") &&
      prevProps.defaultValue !== defaultValue &&
      !defaultValue
    ) {
      if (defaultValue === false) {
        this.instance?.setDate([], false);
      }
    }

    this.instance?.setOptions({ ...restProps });
  }

  public componentWillUnmount(): void {
    this.destroyInstance();
  }

  public render(): JSX.Element {
    const { inline, inputProps, customRender } = this.props;

    if (inline) {
      return <div ref={this.handleRef}></div>;
    }

    if (customRender) {
      return customRender(inputProps, this.handleRef);
    }

    return <input {...inputProps} ref={this.handleRef} />;
  }
}

export default ReactComponent;
