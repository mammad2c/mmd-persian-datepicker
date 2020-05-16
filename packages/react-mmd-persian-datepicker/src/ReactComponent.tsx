import React from "react";
import MmdPersianDatepicker from "mmd-persian-datepicker/src/Datepicker";
import { IOptions } from "mmd-persian-datepicker/src/types";

interface Props extends IOptions<MmdPersianDatepicker> {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

class ReactComponent extends React.Component<Props> {
  public render() {
    const { inline, inputProps } = this.props;

    return (
      <div>
        <input {...inputProps} />
      </div>
    );
  }
}

export default ReactComponent;
