"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";

export type SellerSelectOption = {
  description?: string;
  label: string;
  value: string;
};

type SellerSelectProps = {
  ariaLabel: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  dropdownDirection?: "down" | "up";
  name: string;
  onValueChange?: (value: string) => void;
  options: readonly SellerSelectOption[];
  value?: string;
};

export function SellerSelect({
  ariaLabel,
  className = "",
  defaultValue,
  disabled = false,
  dropdownDirection = "down",
  name,
  onValueChange,
  options,
  value,
}: SellerSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedValue = value ?? internalValue;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  const selectedOption = options[selectedIndex] ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
  }, [isOpen, selectedIndex]);

  function open() {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setIsOpen(false);
  }

  function moveActive(direction: 1 | -1) {
    if (options.length === 0) return;
    const nextIndex = (activeIndex + direction + options.length) % options.length;
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open();
    }
  }

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = options.length - 1;
      setActiveIndex(lastIndex);
      optionRefs.current[lastIndex]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>("[data-select-trigger]")?.focus();
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        data-select-trigger
        disabled={disabled}
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          if (isOpen) setIsOpen(false);
          else open();
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-3 text-left ${className}`}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? "Pilih opsi"}</span>
        <Icon
          icon="lucide:chevron-down"
          width={15}
          height={15}
          className={`mr-0.5 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          className={`absolute left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-[9px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] p-1.5 shadow-[0_16px_38px_rgb(15_23_42_/_0.16)] ${
            dropdownDirection === "up"
              ? "bottom-[calc(100%+6px)]"
              : "top-[calc(100%+6px)]"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => choose(option.value)}
                onKeyDown={handleOptionKeyDown}
                onFocus={() => setActiveIndex(index)}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-[7px] px-3 py-2 text-left text-[12px] transition-colors ${
                  isSelected
                    ? "bg-[var(--seller-brand)] font-semibold text-white"
                    : "text-[var(--seller-ink)] hover:bg-[var(--seller-brand-soft)] hover:text-[var(--seller-brand)]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block">{option.label}</span>
                  {option.description ? (
                    <span className={`mt-0.5 block text-[10px] leading-relaxed ${
                      isSelected ? "text-white/75" : "text-[var(--seller-muted)]"
                    }`}>
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <Icon icon="lucide:check" width={14} height={14} className="shrink-0" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
