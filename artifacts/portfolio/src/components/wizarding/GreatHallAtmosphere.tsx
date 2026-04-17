import "./wizarding.css";

const MIN_CANDLES = 12;

type GreatHallAtmosphereProps = {
  candleCount?: number;
  className?: string;
};

export function GreatHallAtmosphere({
  candleCount = MIN_CANDLES,
  className,
}: GreatHallAtmosphereProps) {
  const totalCandles = Math.max(MIN_CANDLES, candleCount);

  return (
    <div
      aria-hidden
      className={["wizarding-great-hall", className].filter(Boolean).join(" ")}
    >
      <div className="wizarding-gh-overlay wizarding-gh-overlay--vignette" />
      <div className="wizarding-gh-overlay wizarding-gh-overlay--beams" />
      <div className="wizarding-gh-overlay wizarding-gh-overlay--grain" />

      <div className="wizarding-candle-row">
        {Array.from({ length: totalCandles }, (_, index) => (
          <span className="wizarding-candle" key={`wizarding-candle-${index}`}>
            <span className="wizarding-candle-flame" />
          </span>
        ))}
      </div>
    </div>
  );
}
