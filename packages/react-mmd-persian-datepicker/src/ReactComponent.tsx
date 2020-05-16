import React from "react";
import MmdPersianDatepicker, {
  IOptions,
  defaultOptionsValue,
} from "mmd-persian-datepicker/src/mmd-persian-datepicker";

console.log("defaultOptionsValue: ");

interface Props extends IOptions {
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

class ReactComponent extends React.Component<Props> {
  public componentDidMount() {}

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
