import "./Surface.css";

function Surface({
  children,
  level = 1,
  bordered = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  const classes = [
    "ui-surface",
    `ui-surface--${level}`,
    bordered ? "ui-surface--bordered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Surface;