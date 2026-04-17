import "./wizarding.css";

type NavbarSilhouetteOverlayProps = {
  className?: string;
};

const towerPattern = [
  "short",
  "mid",
  "short",
  "tall",
  "short",
  "mid",
  "short",
  "tall",
  "mid",
  "short",
] as const;

export function NavbarSilhouetteOverlay({ className }: NavbarSilhouetteOverlayProps) {
  return (
    <div
      aria-hidden
      className={["wizarding-navbar-silhouette", className].filter(Boolean).join(" ")}
    >
      <div className="wizarding-navbar-castle">
        <div className="wizarding-navbar-wall" />
        {towerPattern.map((size, index) => (
          <div
            className="wizarding-navbar-tower"
            data-size={size}
            key={`wizarding-navbar-tower-${index}`}
          />
        ))}
        <div className="wizarding-navbar-wall" />
      </div>
    </div>
  );
}
