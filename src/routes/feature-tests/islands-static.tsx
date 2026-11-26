// Static (server-only) component. Its marker string must never reach client JS.
export function StaticBlurb() {
  const items = ['FT_STATIC_ONLY_MARKER_7c1f', 'rendered on the server', 'ships no JavaScript'];
  return (
    <ul data-testid="static-blurb">
      {items.map(item => (
        <li key={item}>{item.toUpperCase()}</li>
      ))}
    </ul>
  );
}
