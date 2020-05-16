import React from "react";
import MmdPersianDatepicker from "mmd-persian-datepicker/src/components/Datepicker";
import { defaultOptionsValue } from "mmd-persian-datepicker/src/configs/defaultOptionsValue";
import { IOptions } from "mmd-persian-datepicker/src/models/general";

interface Props extends IOptions<MmdPersianDatepicker> {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

class ReactComponent extends React.Component<Props> {
  static defaultProps = defaultOptionsValue;

  public componentDidMount(): void {
    console.log("hi react component");
  }

  public render(): JSX.Element {
    const { inputProps } = this.props;

    return (
      <div>
        <input {...inputProps} />
      </div>
    );
  }
}

export default ReactComponent;
