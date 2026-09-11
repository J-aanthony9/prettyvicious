"use client";

/**
 * Last resort. Renders when the root layout itself fails, so it cannot rely
 * on the layout's fonts or styles and carries the palette inline.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0C0A0B",
          color: "#E9DFCE",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <p style={{ letterSpacing: "0.4em", fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>
            Pretty Vicious
          </p>
          <h1 style={{ fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 28, margin: "20px 0" }}>
            Something went dark
          </h1>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#E9DFCE",
              color: "#0C0A0B",
              border: 0,
              padding: "16px 34px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
