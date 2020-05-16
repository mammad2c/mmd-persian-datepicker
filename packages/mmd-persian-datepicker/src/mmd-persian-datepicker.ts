import Datepicker from "./Datepicker";

// styles
import "./styles/variables.scss";
import "./styles/mixin.scss";
import "./styles/Datepicker.scss";

export {
  IElemPosition,
  IOptions,
  ISelectedDateItem,
  ISelectedDates,
  disabledDates,
  mode,
} from "./types";
export { defaultOptionsValue } from "./configs/defaultOptionsValue";
export default Datepicker;
