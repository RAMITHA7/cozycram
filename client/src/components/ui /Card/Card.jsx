import "./Card.css";

function Card({
  children,
  interactive = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  const classes = [
    "ui-card",
    interactive ? "ui-card--interactive" : "",
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

export default Card;