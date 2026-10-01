// Dev-only demo switch: ?demo turns in-memory sample data on, ?demo=off turns
// it off. Kept apart from the sample data so checking it costs nothing in
// production builds, where it is always off.
function demoEnabled() {
  try {
    const param = new URLSearchParams(location.search).get('demo');
    if (param === 'off') sessionStorage.removeItem('ilovec-demo');
    else if (param !== null) sessionStorage.setItem('ilovec-demo', '1');
    return sessionStorage.getItem('ilovec-demo') === '1';
  } catch {
    return false;
  }
}

export const demoMode = import.meta.env.DEV && demoEnabled();
