import MmdPersianDatepicker from "../src/components/Datepicker";

const pickerId = "datepicker-input";

const pickerElement = document.createElement("input");
pickerElement.setAttribute("type", "text");
pickerElement.setAttribute("id", pickerId);

document.body.appendChild(pickerElement);

/**
 * Dummy test
 */
describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });

  it("DummyClass is instantiable", () => {
    expect(new MmdPersianDatepicker(`#${pickerId}`)).toBeInstanceOf(
      MmdPersianDatepicker
    );
  });
});
