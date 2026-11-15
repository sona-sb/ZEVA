// Lightweight hash router (no extra dependency). Swap for React Router if you prefer.
export const ROUTES = [
  ["home", "1 · Landing"],
  ["login", "2 · Log In"],
  ["studio", "3 · Hub"],
  ["fluency", "4 · Fluency"],
  ["conversation", "5 · Conversation"],
  ["presentation", "6 · Presentation"],
  ["profile", "Profile & Growth"],
];

export const go = (r) => { window.location.hash = r; };

export const getRoute = () => {
  const h = window.location.hash.slice(1);
  return ROUTES.some((r) => r[0] === h) ? h : "home";
};
