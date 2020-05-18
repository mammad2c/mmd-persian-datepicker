import React, { RefObject, ComponentType } from "react";
import MmdPersianDatepicker, {
  defaultOptionsValue,
  IOptions,
} from "mmd-persian-datepicker/src";

interface Props extends IOptions<MmdPersianDatepicker> {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  InputComponent?: ComponentType;
}

class ReactComponent extends React.Component<Props> {
  static defaultProps = defaultOptionsValue;
  private instance?: MmdPersianDatepicker;
  private element = React.createRef<HTMLElement>();

  private createInstance = (): void => {
    const isElementExist = this.element.current;

    if (isElementExist) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inputProps, InputComponent, ...restProps } = this.props;
      this.instance = new MmdPersianDatepicker(isElementExist, restProps);
    }
  };

  private destroyInstance = (): void => {
    if (!this.instance) {
      return;
    }

    this.instance.destroy();
  };

  public componentDidMount(): void {
    this.createInstance();
  }

  public componentDidUpdate(prevProps: Props): void {
    const { defaultValue, mode, multiple } = this.props;

    if (
      prevProps.defaultValue === defaultValue ||
      typeof defaultValue === "boolean"
    ) {
      return;
    }
    this.instance?.setDate(defaultValue, false);
  }

  public componentWillUnmount(): void {
    this.destroyInstance();
  }

  public render(): JSX.Element {
    const { inline, inputProps, InputComponent } = this.props;

    if (inline) {
      return <div ref={this.element as RefObject<HTMLDivElement>}></div>;
    }

    if (InputComponent) {
      return <InputComponent />;
    }

    return (
      <input
        {...inputProps}
        ref={this.element as RefObject<HTMLInputElement>}
      />
    );
  }
}

export default ReactComponent;
