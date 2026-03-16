export function buildTheme(dark) {
  return {
    bg:          dark ? "#0F172A"  : "#F8FAFC",
    surface:     dark ? "#1E293B"  : "#FFFFFF",
    surfaceHov:  dark ? "#2d3f55"  : "#EEF2FF",
    border:      dark ? "#334155"  : "#F1F5F9",
    borderMed:   dark ? "#475569"  : "#E2E8F0",
    text:        dark ? "#F1F5F9"  : "#0F172A",
    textMuted:   dark ? "#94A3B8"  : "#64748B",
    textFaint:   dark ? "#475569"  : "#94A3B8",
    inputBg:     dark ? "#0F172A"  : "#F8FAFC",
    rowAlt:      dark ? "#1a2740"  : "#FAFBFC",
    accent:      "#6366F1",
    danger:      "#EF4444",
    dangerBg:    dark ? "#3f0a0a"  : "#FEF2F2",
    dangerBdr:   dark ? "#7f1d1d"  : "#FCA5A5",
    success:     "#10B981",
    successBg:   dark ? "#052e16"  : "#ECFDF5",
    gold:        "#F59E0B",
    dark,
  };
}
