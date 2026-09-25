import "./route-placeholder.css";

function RoutePlaceholder({
  eyebrow = "COZYCRAM",
  title,
  description,
  children,
}) {
  return (
    <section className="route-placeholder">
      <p className="route-placeholder__eyebrow">
        {eyebrow}
      </p>

      <h1>{title}</h1>

      {description && (
        <p className="route-placeholder__description">
          {description}
        </p>
      )}

      {children && (
        <div className="route-placeholder__actions">
          {children}
        </div>
      )}
    </section>
  );
}

export default RoutePlaceholder;