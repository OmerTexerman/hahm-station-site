export const HOME_INTRO_STORAGE_KEY = "hahm-station:home-intro-played";
export const HOME_INTRO_FLAG_VALUE = "true";
export const HOME_SPOTLIGHT_STYLE_STORAGE_KEY =
  "hahm-station:home-spotlight-style";
export const HOME_INTRO_SESSION_STYLE_ID = "home-scene-session-style";
export const HOME_SPOTLIGHT_BOOTSTRAP_STYLE_ID =
  "home-scene-spotlight-bootstrap-style";

export function getHomeIntroBootstrapScript() {
  return `
    (function() {
      if (window.location.pathname !== "/") return;

      function readSessionItem(key) {
        try {
          return window.sessionStorage.getItem(key);
        } catch (_error) {
          return null;
        }
      }

      var introPlayed = readSessionItem(${JSON.stringify(HOME_INTRO_STORAGE_KEY)}) === ${JSON.stringify(HOME_INTRO_FLAG_VALUE)};
      if (!introPlayed) return;

      var sessionCss =
        ".home-scene .animate-slide-left,.home-scene .animate-slide-right,.home-scene .animate-slide-up{animation:none;}" +
        ".home-scene .scene-spotlight .scene-spotlight__shadow{animation:none;opacity:0;}" +
        ".home-scene .scene-spotlight .scene-spotlight__cutout,.home-scene .scene-spotlight .scene-spotlight__circle{animation:none;opacity:1;}" +
        ".home-scene .wall-art-piece__inner{" +
          "opacity:1 !important;" +
          "transform:rotate(var(--wall-art-rotation,0deg)) !important;" +
          "box-shadow:0 10px 24px rgba(0,0,0,0.3) !important;" +
          "transform-origin:var(--wall-art-transform-origin,50% 0%) !important;" +
          "transition:none !important;" +
        "}";

      var rawStyle = readSessionItem(${JSON.stringify(HOME_SPOTLIGHT_STYLE_STORAGE_KEY)});
      var spotlightCss = "";
      var cssValuePattern = /^\\d+(\\.\\d+)?px$/;

      try {
        var style = JSON.parse(rawStyle);
        if (style && cssValuePattern.test(style.left) && cssValuePattern.test(style.top) && cssValuePattern.test(style.size)) {
          var offsetX = typeof style.offsetX === "number" && isFinite(style.offsetX) ? style.offsetX : 0;
          var offsetY = typeof style.offsetY === "number" && isFinite(style.offsetY) ? style.offsetY : 0;
          spotlightCss =
            ".home-scene .scene-spotlight{--spotlight-left:" + style.left + ";--spotlight-top:" + style.top + ";--spotlight-size:" + style.size + ";}" +
            ".home-scene .scene-spotlight{--spotlight-offset-x:" + offsetX + "px;--spotlight-offset-y:" + offsetY + "px;}";
        }
      } catch (_error) {}

      var sessionStyleTag = document.getElementById(${JSON.stringify(HOME_INTRO_SESSION_STYLE_ID)}) || document.createElement("style");
      sessionStyleTag.id = ${JSON.stringify(HOME_INTRO_SESSION_STYLE_ID)};
      sessionStyleTag.textContent = sessionCss;
      document.head.appendChild(sessionStyleTag);

      if (!spotlightCss) return;

      var spotlightStyleTag = document.getElementById(${JSON.stringify(HOME_SPOTLIGHT_BOOTSTRAP_STYLE_ID)}) || document.createElement("style");
      spotlightStyleTag.id = ${JSON.stringify(HOME_SPOTLIGHT_BOOTSTRAP_STYLE_ID)};
      spotlightStyleTag.textContent = spotlightCss;
      document.head.appendChild(spotlightStyleTag);
    })();
  `;
}
