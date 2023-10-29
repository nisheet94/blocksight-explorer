import { useEffect, useReducer, useRef } from 'react';

import cx from 'classnames';

import { ArrowIcon } from '@/components/shared/icons';

import { DropdownAnimation } from '@/utils/constants/animation';

import { Styles } from '@/types/styles';

const styles: Styles = {
  componentContainer: `relative w-full`,
  dropdownLabel: `absolute left-[15px] sm:left-4 lg:left-6 transform truncate text-lg leading-normal origin-top-left tracking-[0.04em] pointer-events-none select-none smooth-transition`,
  dropdownLabelFocused: `top-1 scale-[0.75] sm:scale-[0.8]`,
  dropdownLabelUnfocused: `top-1/2 -translate-y-1/2`,
  dropdownButton: `group font-display text-secondary/60 px-4 text-left h-[56px] sm:h-[66px] w-full pt-[20px] pb-[4px] px-3 sm:px-4 sm:pt-[24px] sm:pb-[8px] lg:px-6 sm:text-lg dark:bg-secondary/[8%] border-t-[1.5px] dark:border-secondary/[5%] rounded-lg 2md:rounded-xl smooth-transition disabled:opacity-60 disabled:cursor-not-allowed truncate text-ellipsis`,
  dropdownFocused: `focus-within:ring-4 dark:focus-within:ring-secondary/[4%]`,
  dropdownArrow: `absolute top-1/2 right-3 sm:right-4 lg:right-6 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 smooth-transition`,
  dropdownContainer: `z-10 absolute w-full mt-2 flex flex-col h-min bg-dropdown backdrop-blur-xl border-[.5px] border-secondary/[10%] rounded-xl`,
  dropdownOption: `group flex items-center justify-between gap-2 px-4 py-3 w-full smooth-transition`,
  dropdownOptionLabel: `text-start tracking-[0.02em] pointer-events-none capitalize`,
  dropdownOptionSelected: `text-secondary/20 cursor-not-allowed`,
  dropdownOptionUnselected: `text-secondary/40 hover:text-secondary/60`,
};

export const enum DropdownActions {
  TOGGLE_DROPDOWN = 'toggle-dropdown',
  CLOSE_DROPDOWN = 'close-dropdown',
}

export interface DropdownState {
  isOpen: boolean;
  dropdownAnimation: DropdownAnimation;
}

export interface DropdownAction {
  type: DropdownActions;
  // payload?: string | null;
}

/**
 * Reducer function for managing the state and animations of the dropdown component.
 *
 * @param dropdownState - The current state of the dropdown component.
 * @param dropdownAction - The action to be performed on the state.
 * @returns The updated dropdown component state.
 */
export function dropdownReducer(
  dropdownState: DropdownState,
  dropdownAction: DropdownAction
): DropdownState {
  const { type } = dropdownAction;

  switch (type) {
    case DropdownActions.TOGGLE_DROPDOWN:
      if (dropdownState.isOpen) {
        return {
          ...dropdownState,
          dropdownAnimation: DropdownAnimation.Exit,
        };
      } else {
        return {
          ...dropdownState,
          isOpen: true,
          dropdownAnimation: DropdownAnimation.Enter,
        };
      }

    case DropdownActions.CLOSE_DROPDOWN:
      return { ...dropdownState, isOpen: false };

    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

interface DropdownProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  classNames?: {
    container?: string;
    // label?: {
    //   className?: string;
    //   focused?: string;
    //   default?: string;
    // };
    // button?: string;
    // dropdown?: string;
    // option?: string;
  };
  value: string;
  onSelect: (selected: { value: string }) => void;
  disabled?: boolean;
}

const initialState = {
  isOpen: false,
  dropdownAnimation: DropdownAnimation.Default,
};

export default function Dropdown({
  label = 'Select an option',
  options,
  classNames,
  value,
  onSelect,
  disabled,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownState, dropdownDispatch] = useReducer(
    dropdownReducer,
    initialState
  );

  const { isOpen, dropdownAnimation } = dropdownState;

  const isFocused = isOpen && dropdownAnimation === DropdownAnimation.Enter;
  const focusedClass = isFocused ? 'text-secondary/60' : 'text-secondary/40';

  const getSelectedOptionLabel = (value: string) => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption?.label || '';
  };

  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    dropdownDispatch({ type: DropdownActions.TOGGLE_DROPDOWN });

    const target = e.target as HTMLButtonElement;
    if (value !== target.value) {
      onSelect({ value: target.value });
    }
  };

  const handleDropdownAnimationEnd = () => {
    if (dropdownAnimation === DropdownAnimation.Exit) {
      dropdownDispatch({ type: DropdownActions.CLOSE_DROPDOWN });
    }
  };

  useEffect(() => {
    if (dropdownAnimation !== DropdownAnimation.Enter) return;

    function handleClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdownDispatch({ type: DropdownActions.TOGGLE_DROPDOWN });
      }
    }
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [dropdownAnimation]);

  return (
    <div
      ref={dropdownRef}
      className={cx(styles.componentContainer, classNames?.container)}
    >
      <span
        className={cx(styles.dropdownLabel, focusedClass, {
          [styles.dropdownLabelFocused]: isFocused || value,
          [styles.dropdownLabelUnfocused]: !isFocused && !value,
        })}
      >
        {label}
      </span>

      <button
        type="button"
        aria-label={`toggle dropdown menu`}
        onClick={() =>
          dropdownDispatch({ type: DropdownActions.TOGGLE_DROPDOWN })
        }
        className={cx(styles.dropdownButton, {
          [styles.dropdownFocused]: isFocused,
        })}
        disabled={disabled}
      >
        {value && (
          <span className="animate-fade-in capitalize">
            {getSelectedOptionLabel(value)}
          </span>
        )}

        <ArrowIcon
          className={cx(styles.dropdownArrow, focusedClass, {
            '-rotate-90': isFocused,
            'rotate-90': !isFocused,
          })}
        />
      </button>

      {isOpen && (
        <ul
          className={cx(styles.dropdownContainer, dropdownAnimation)}
          onAnimationEnd={handleDropdownAnimationEnd}
        >
          {options.map((option, index) => (
            <li key={index}>
              <button
                disabled={value === option.value}
                value={option.value}
                type="button"
                className={cx(styles.dropdownOption, {
                  [styles.dropdownOptionSelected]: value === option.value,
                  [styles.dropdownOptionUnselected]: value !== option.value,
                  'cursor-auto': dropdownAnimation === DropdownAnimation.Exit,
                })}
                onClick={handleSelect}
                aria-label={`Select ${option}`}
              >
                <span className={styles.dropdownOptionLabel}>
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
