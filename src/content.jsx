import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const CONTAINER_ID = "crx-react-root";
const TARGET_SELECTORS = [
  'div[role="tabpanel"][id="Timeline"]',
  ".timeline",
  "app-student-timeline",
  "#Timeline",
];

function findInjectionTarget() {
  for (const selector of TARGET_SELECTORS) {
    const found = document.querySelector(selector);
    if (found) {
      return found;
    }
  }
  return null;
}

function createContainer(target) {
  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  container.className = "extension-dashboard-root";
  container.style.width = "100%";
  container.style.display = "block";
  container.style.position = "static";
  container.style.minWidth = "0";
  target.insertAdjacentElement("beforebegin", container);
  return container;
}

function mountApp(container) {
  ReactDOM.createRoot(container).render(<App />);
}

function tryInject() {
  if (document.getElementById(CONTAINER_ID)) {
    return true;
  }

  const target = findInjectionTarget();
  if (!target) {
    return false;
  }

  const container = createContainer(target);
  mountApp(container);
  return true;
}

const observer = new MutationObserver(() => {
  if (tryInject()) {
    observer.disconnect();
  }
});

observer.observe(document.documentElement || document.body, {
  childList: true,
  subtree: true,
});

tryInject();
