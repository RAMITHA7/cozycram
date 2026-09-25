import "./IconButton.css";

function IconButton({
  children,
  label,
  size = "medium",
  variant = "ghost",
  className = "",
  ...props
}) {
  if (!label) {
    console.warn(
      "IconButton requires a `label` prop for accessibility."
    );
  }

  const classes = [
    "ui-icon-button",
    `ui-icon-button--${size}`,
    `ui-icon-button--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

export default IconButton;