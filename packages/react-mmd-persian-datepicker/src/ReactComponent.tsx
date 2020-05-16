import React, { RefObject, ComponentType } from "react";
import MmdPersianDatepicker from "mmd-persian-datepicker/src/components/Datepicker";
import { defaultOptionsValue } from "mmd-persian-datepicker/src/configs/defaultOptionsValue";
import { IOptions } from "mmd-persian-datepicker/src/models/general";

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
      this.instance = new MmdPersianDatepicker(isElementExist, this.props);
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
