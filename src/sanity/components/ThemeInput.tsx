import type { CSSProperties, ReactNode } from "react";
import { PatchEvent, unset, type ObjectInputProps } from "sanity";
import { THEME_FIELD_DEFINITIONS } from "@/lib/site-theme";

type ThemeInputValue = {
  preset?: string | null;
  [key: string]: unknown;
};

type ThemeInputProps = ObjectInputProps<ThemeInputValue> & {
  renderDefault: (props: ObjectInputProps<ThemeInputValue>) => ReactNode;
};

export function ThemeInput(props: ThemeInputProps) {
  const hasOverrides = THEME_FIELD_DEFINITIONS.some(
    (definition) => props.value?.[definition.name] != null
  );

  function handleResetOverrides() {
    if (!hasOverrides) {
      return;
    }

    props.onChange(
      PatchEvent.from(
        THEME_FIELD_DEFINITIONS.map((definition) => unset([definition.name]))
      )
    );
  }

  return (
    <div style={containerStyle}>
      <div style={toolbarStyle}>
        <div style={copyStyle}>
          <p style={titleStyle}>Theme Overrides</p>
          <p style={descriptionStyle}>
            Reset the individual color overrides below while keeping the selected preset palette.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetOverrides}
          disabled={!hasOverrides}
          style={{
            ...buttonStyle,
            ...(hasOverrides ? {} : buttonDisabledStyle),
          }}
        >
          Reset Overrides
        </button>
      </div>
      {props.renderDefault(props)}
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "wrap",
  border: "1px solid var(--card-border-color, rgba(255,255,255,0.08))",
  borderRadius: "0.5rem",
  padding: "0.875rem 1rem",
  background: "var(--card-bg-color, rgba(255,255,255,0.02))",
};

const copyStyle: CSSProperties = {
  display: "grid",
  gap: "0.25rem",
  flex: "1 1 18rem",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  opacity: 0.75,
};

const buttonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "999px",
  background: "transparent",
  color: "inherit",
  fontSize: "0.8125rem",
  fontWeight: 600,
  padding: "0.55rem 0.9rem",
  cursor: "pointer",
};

const buttonDisabledStyle: CSSProperties = {
  opacity: 0.45,
  cursor: "not-allowed",
};
