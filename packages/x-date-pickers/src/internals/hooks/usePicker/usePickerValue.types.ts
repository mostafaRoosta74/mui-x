import * as React from 'react';
import { FieldChangeHandlerContext, UseFieldInternalProps } from '../useField';
import { Validator } from '../../../validation';
import { PickerVariant } from '../../models/common';
import {
  TimezoneProps,
  MuiPickersAdapter,
  PickersTimezone,
  PickerChangeHandlerContext,
  PickerValidDate,
  OnErrorProps,
  InferError,
  PickerValueType,
} from '../../../models';
import { GetDefaultReferenceDateProps } from '../../utils/getDefaultReferenceDate';
import {
  PickerShortcutChangeImportance,
  PickersShortcutsItemContext,
} from '../../../PickersShortcuts';
import { InferNonNullablePickerValue, PickerValidValue } from '../../models';

export interface PickerValueManager<TValue extends PickerValidValue, TError> {
  /**
   * Determines if two values are equal.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {MuiPickersAdapter} utils The adapter.
   * @param {TValue} valueLeft The first value to compare.
   * @param {TValue} valueRight The second value to compare.
   * @returns {boolean} A boolean indicating if the two values are equal.
   */
  areValuesEqual: (utils: MuiPickersAdapter, valueLeft: TValue, valueRight: TValue) => boolean;
  /**
   * Value to set when clicking the "Clear" button.
   */
  emptyValue: TValue;
  /**
   * Method returning the value to set when clicking the "Today" button
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {MuiPickersAdapter} utils The adapter.
   * @param {PickersTimezone} timezone The current timezone.
   * @param {PickerValueType} valueType The type of the value being edited.
   * @returns {TValue} The value to set when clicking the "Today" button.
   */
  getTodayValue: (
    utils: MuiPickersAdapter,
    timezone: PickersTimezone,
    valueType: PickerValueType,
  ) => TValue;
  /**
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * Method returning the reference value to use when mounting the component.
   * @param {object} params The params of the method.
   * @param {PickerValidDate | undefined} params.referenceDate The referenceDate provided by the user.
   * @param {TValue} params.value The value provided by the user.
   * @param {GetDefaultReferenceDateProps} params.props The validation props needed to compute the reference value.
   * @param {MuiPickersAdapter} params.utils The adapter.
   * @param {number} params.granularity The granularity of the selection possible on this component.
   * @param {PickersTimezone} params.timezone The current timezone.
   * @param {() => PickerValidDate} params.getTodayDate The reference date to use if no reference date is passed to the component.
   * @returns {TValue} The reference value to use for non-provided dates.
   */
  getInitialReferenceValue: (params: {
    referenceDate: PickerValidDate | undefined;
    value: TValue;
    props: GetDefaultReferenceDateProps;
    utils: MuiPickersAdapter;
    granularity: number;
    timezone: PickersTimezone;
    getTodayDate?: () => PickerValidDate;
  }) => InferNonNullablePickerValue<TValue>;
  /**
   * Method parsing the input value to replace all invalid dates by `null`.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {MuiPickersAdapter} utils The adapter.
   * @param {TValue} value The value to parse.
   * @returns {TValue} The value without invalid date.
   */
  cleanValue: (utils: MuiPickersAdapter, value: TValue) => TValue;
  /**
   * Generates the new value, given the previous value and the new proposed value.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {MuiPickersAdapter} utils The adapter.
   * @param {TValue} lastValidDateValue The last valid value.
   * @param {TValue} value The proposed value.
   * @returns {TValue} The new value.
   */
  valueReducer?: (utils: MuiPickersAdapter, lastValidDateValue: TValue, value: TValue) => TValue;
  /**
   * Compare two errors to know if they are equal.
   * @template TError
   * @param {TError} error The new error
   * @param {TError | null} prevError The previous error
   * @returns {boolean} `true` if the new error is different from the previous one.
   */
  isSameError: (error: TError, prevError: TError | null) => boolean;
  /**
   * Checks if the current error is empty or not.
   * @template TError
   * @param {TError} error The current error.
   * @returns {boolean} `true` if the current error is not empty.
   */
  hasError: (error: TError) => boolean;
  /**
   * The value identifying no error, used to initialise the error state.
   */
  defaultErrorState: TError;
  /**
   * Return the timezone of the date inside a value.
   * Throw an error on range picker if both values don't have the same timezone.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   @param {MuiPickersAdapter} utils The utils to manipulate the date.
   @param {TValue} value The current value.
   @returns {string | null} The timezone of the current value.
   */
  getTimezone: (utils: MuiPickersAdapter, value: TValue) => string | null;
  /**
   * Change the timezone of the dates inside a value.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   @param {MuiPickersAdapter} utils The utils to manipulate the date.
   @param {PickersTimezone} timezone The current timezone.
   @param {TValue} value The value to convert.
   @returns {TValue} The value with the new dates in the new timezone.
   */
  setTimezone: (utils: MuiPickersAdapter, timezone: PickersTimezone, value: TValue) => TValue;
}

export type PickerSelectionState = 'partial' | 'shallow' | 'finish';

export interface UsePickerValueState<TValue extends PickerValidValue> {
  /**
   * Date displayed on the views and the field.
   * It is updated whenever the user modifies something.
   */
  draft: TValue;
  /**
   * Last value published (the last value for which `shouldPublishValue` returned `true`).
   * If `onChange` is defined, it's the value that was passed on the last call to this callback.
   */
  lastPublishedValue: TValue;
  /**
   * Last value committed (the last value for which `shouldCommitValue` returned `true`).
   * If `onAccept` is defined, it's the value that was passed on the last call to this callback.
   */
  lastCommittedValue: TValue;
  /**
   * Last value passed to `props.value`.
   * Used to update the `draft` value whenever the `value` prop changes.
   */
  lastControlledValue: TValue | undefined;
  /**
   * If we never modified the value since the mount of the component,
   * Then we might want to apply some custom logic.
   *
   * For example, when the component is not controlled and `defaultValue` is defined.
   * Then clicking on "Accept", "Today" or "Clear" should fire `onAccept` with `defaultValue`, but clicking on "Cancel" or dismissing the picker should not.
   */
  hasBeenModifiedSinceMount: boolean;
}

export interface PickerValueUpdaterParams<TValue extends PickerValidValue, TError> {
  action: PickerValueUpdateAction<TValue, TError>;
  dateState: UsePickerValueState<TValue>;
  /**
   * Check if the new draft value has changed compared to some given value.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} comparisonValue The value to compare the new draft value with.
   * @returns {boolean} `true` if the new draft value is equal to the comparison value.
   */
  hasChanged: (comparisonValue: TValue) => boolean;
  isControlled: boolean;
  closeOnSelect: boolean;
}

export type PickerValueUpdateAction<TValue extends PickerValidValue, TError> =
  | {
      name: 'setValueFromView';
      value: TValue;
      selectionState: PickerSelectionState;
    }
  | {
      name: 'setValueFromField';
      value: TValue;
      context: FieldChangeHandlerContext<TError>;
    }
  | {
      name: 'setValueFromAction';
      value: TValue;
      pickerAction: 'accept' | 'today' | 'cancel' | 'dismiss' | 'clear';
    }
  | {
      name: 'setValueFromShortcut';
      value: TValue;
      changeImportance: PickerShortcutChangeImportance;
      shortcut: PickersShortcutsItemContext;
    };

/**
 * Props used to handle the value that are common to all pickers.
 */
export interface UsePickerValueBaseProps<TValue extends PickerValidValue, TError>
  extends OnErrorProps<TValue, TError> {
  /**
   * The selected value.
   * Used when the component is controlled.
   */
  value?: TValue;
  /**
   * The default value.
   * Used when the component is not controlled.
   */
  defaultValue?: TValue;
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The new value.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onChange?: (value: TValue, context: PickerChangeHandlerContext<TError>) => void;
  /**
   * Callback fired when the value is accepted.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The value that was just accepted.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onAccept?: (value: TValue, context: PickerChangeHandlerContext<TError>) => void;
}

/**
 * Props used to handle the value of non-static pickers.
 */
export interface UsePickerValueNonStaticProps {
  /**
   * If `true`, the popover or modal will close after submitting the full date.
   * @default `true` for desktop, `false` for mobile (based on the chosen wrapper and `desktopModeMediaQuery` prop).
   */
  closeOnSelect?: boolean;
  /**
   * Control the popup or dialog open state.
   * @default false
   */
  open?: boolean;
  /**
   * Callback fired when the popup requests to be closed.
   * Use in controlled mode (see `open`).
   */
  onClose?: () => void;
  /**
   * Callback fired when the popup requests to be opened.
   * Use in controlled mode (see `open`).
   */
  onOpen?: () => void;
}

/**
 * Props used to handle the value of the pickers.
 */
export interface UsePickerValueProps<TValue extends PickerValidValue, TError>
  extends UsePickerValueBaseProps<TValue, TError>,
    UsePickerValueNonStaticProps,
    TimezoneProps {
  // We don't add JSDoc here because we want the `referenceDate` JSDoc to be the one from the view which has more context.
  referenceDate?: PickerValidDate;
}

export interface UsePickerValueParams<
  TValue extends PickerValidValue,
  TExternalProps extends UsePickerValueProps<TValue, any>,
> {
  props: TExternalProps;
  valueManager: PickerValueManager<TValue, InferError<TExternalProps>>;
  valueType: PickerValueType;
  variant: PickerVariant;
  validator: Validator<TValue, InferError<TExternalProps>, TExternalProps>;
}

export type UsePickerValueFieldResponse<TValue extends PickerValidValue, TError> = Required<
  Pick<UseFieldInternalProps<TValue, any, TError>, 'value' | 'onChange'>
>;

/**
 * Props passed to `usePickerViews`.
 */
export interface UsePickerValueViewsResponse<TValue extends PickerValidValue> {
  value: TValue;
  onChange: (value: TValue, selectionState?: PickerSelectionState) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Props passed to `usePickerLayoutProps`.
 */
export interface UsePickerValueLayoutResponse<TValue extends PickerValidValue> {
  value: TValue;
  onChange: (newValue: TValue) => void;
  onSelectShortcut: (
    newValue: TValue,
    changeImportance: PickerShortcutChangeImportance,
    shortcut: PickersShortcutsItemContext,
  ) => void;
  isValid: (value: TValue) => boolean;
}

/**
 * Params passed to `usePickerProvider`.
 */
export interface UsePickerValueProviderParams<TValue extends PickerValidValue> {
  value: TValue;
  contextValue: UsePickerValueContextValue;
  actionsContextValue: UsePickerValueActionsContextValue;
  privateContextValue: UsePickerValuePrivateContextValue;
}

export interface UsePickerValueResponse<TValue extends PickerValidValue, TError> {
  viewProps: UsePickerValueViewsResponse<TValue>;
  fieldProps: UsePickerValueFieldResponse<TValue, TError>;
  layoutProps: UsePickerValueLayoutResponse<TValue>;
  provider: UsePickerValueProviderParams<TValue>;
}

export interface UsePickerValueContextValue extends UsePickerValueActionsContextValue {
  /**
   * `true` if the picker is open, `false` otherwise.
   */
  open: boolean;
}

export interface UsePickerValueActionsContextValue {
  /**
   * Set the current open state of the Picker.
   * ```ts
   * setOpen(true); // Opens the picker.
   * setOpen(false); // Closes the picker.
   * setOpen((prevOpen) => !prevOpen); // Toggles the open state.
   * ```
   * @param {React.SetStateAction<boolean>} action The new open state of the Picker.
   * It can be a function that will receive the current open state.
   */
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * Set the current value of the picker to be empty.
   * The value will be `null` on single pickers and `[null, null]` on range pickers.
   */
  clearValue: () => void;
  /**
   * Set the current value of the picker to be the current date.
   * The value will be `today` on single pickers and `[today, today]` on range pickers.
   * With `today` being the current date, with its time set to `00:00:00` on Date Pickers and its time set to the current time on Time and Date Pickers.
   */
  setValueToToday: () => void;
  /**
   * Accept the current value of the picker.
   * Will call `onAccept` if defined.
   * If the picker is re-opened, this value will be the one used to initialize the views.
   */
  acceptValueChanges: () => void;
  /**
   * Cancel the changes made to the current value of the picker.
   * The value will be reset to the last accepted value.
   */
  cancelValueChanges: () => void;
}

export interface UsePickerValuePrivateContextValue {
  /**
   * Closes the picker and accepts the current value if it is not equal to the last accepted value.
   */
  dismissViews: () => void;
}
