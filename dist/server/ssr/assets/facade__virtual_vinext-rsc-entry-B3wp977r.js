import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { createElement, forwardRef, useState, useRef, useEffect, useCallback, createContext, Fragment as Fragment$1 } from "react";
import { u as usePathname, g as getLayoutSegmentContext, t as toRscUrl, a as getPrefetchedUrls, s as storePrefetchResponse, b as useRouter } from "../index.js";
import "../__vite_rsc_assets_manifest.js";
import "react-dom";
import "react-dom/server.edge";
import "node:async_hooks";
class ErrorBoundary extends React__default.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    if (error && typeof error === "object" && "digest" in error) {
      const digest = String(error.digest);
      if (digest === "NEXT_NOT_FOUND" || // legacy compat
      digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;") || digest.startsWith("NEXT_REDIRECT;")) {
        throw error;
      }
    }
    return { error };
  }
  reset = () => {
    this.setState({ error: null });
  };
  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback;
      return jsx(FallbackComponent, { error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}
class NotFoundBoundaryInner extends React__default.Component {
  constructor(props) {
    super(props);
    this.state = { notFound: false, previousPathname: props.pathname };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.pathname !== state.previousPathname && state.notFound) {
      return { notFound: false, previousPathname: props.pathname };
    }
    return { notFound: state.notFound, previousPathname: props.pathname };
  }
  static getDerivedStateFromError(error) {
    if (error && typeof error === "object" && "digest" in error) {
      const digest = String(error.digest);
      if (digest === "NEXT_NOT_FOUND" || digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")) {
        return { notFound: true };
      }
    }
    throw error;
  }
  render() {
    if (this.state.notFound) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
function NotFoundBoundary({ fallback, children }) {
  const pathname = usePathname();
  return jsx(NotFoundBoundaryInner, { pathname, fallback, children });
}
function LayoutSegmentProvider({ depth, children }) {
  const ctx = getLayoutSegmentContext();
  if (!ctx) {
    return children;
  }
  return createElement(ctx.Provider, { value: depth }, children);
}
const DANGEROUS_SCHEME_RE = /^[\s\u200B\uFEFF]*(javascript|data|vbscript)\s*:/i;
function isDangerousScheme(url) {
  return DANGEROUS_SCHEME_RE.test(url);
}
const LinkStatusContext = createContext({ pending: false });
function resolveHref(href) {
  if (typeof href === "string")
    return href;
  let url = href.pathname ?? "/";
  if (href.query) {
    const params = new URLSearchParams(href.query);
    url += `?${params.toString()}`;
  }
  return url;
}
function withBasePath(path) {
  {
    return path;
  }
}
function isHashOnlyChange(href) {
  if (href.startsWith("#"))
    return true;
  try {
    const current = new URL(window.location.href);
    const next = new URL(href, window.location.href);
    return current.pathname === next.pathname && current.search === next.search && next.hash !== "";
  } catch {
    return false;
  }
}
function resolveRelativeHref(href) {
  if (typeof window === "undefined")
    return href;
  if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
    return href;
  }
  try {
    const resolved = new URL(href, window.location.href);
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return href;
  }
}
function scrollToHash(hash) {
  if (!hash || hash === "#") {
    window.scrollTo(0, 0);
    return;
  }
  const id = hash.slice(1);
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "auto" });
  }
}
function prefetchUrl(href) {
  if (typeof window === "undefined")
    return;
  const fullHref = withBasePath(href);
  if (fullHref.startsWith("http://") || fullHref.startsWith("https://") || fullHref.startsWith("//"))
    return;
  const rscUrl = toRscUrl(fullHref);
  const prefetched = getPrefetchedUrls();
  if (prefetched.has(rscUrl))
    return;
  prefetched.add(rscUrl);
  const schedule = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 100));
  schedule(() => {
    const win = window;
    if (typeof win.__VINEXT_RSC_NAVIGATE__ === "function") {
      fetch(rscUrl, {
        headers: { Accept: "text/x-component" },
        credentials: "include",
        priority: "low",
        // @ts-expect-error — purpose is a valid fetch option in some browsers
        purpose: "prefetch"
      }).then((response) => {
        if (response.ok) {
          storePrefetchResponse(rscUrl, response);
        } else {
          prefetched.delete(rscUrl);
        }
      }).catch(() => {
        prefetched.delete(rscUrl);
      });
    } else if (win.__NEXT_DATA__?.__vinext?.pageModuleUrl) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = fullHref;
      link.as = "document";
      document.head.appendChild(link);
    }
  });
}
let sharedObserver = null;
const observerCallbacks = /* @__PURE__ */ new WeakMap();
function getSharedObserver() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined")
    return null;
  if (sharedObserver)
    return sharedObserver;
  sharedObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const callback = observerCallbacks.get(entry.target);
        if (callback) {
          callback();
          sharedObserver?.unobserve(entry.target);
          observerCallbacks.delete(entry.target);
        }
      }
    }
  }, {
    // Start prefetching when the link is within 250px of the viewport.
    // This gives the browser a head start before the user scrolls to it.
    rootMargin: "250px"
  });
  return sharedObserver;
}
function getDefaultLocale() {
  if (typeof window !== "undefined") {
    return window.__VINEXT_DEFAULT_LOCALE__;
  }
  return globalThis.__VINEXT_DEFAULT_LOCALE__;
}
function applyLocaleToHref(href, locale) {
  if (locale === false) {
    return href;
  }
  if (locale === void 0) {
    return href;
  }
  const defaultLocale = getDefaultLocale();
  if (locale === defaultLocale) {
    return href;
  }
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
    return href;
  }
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}
const Link = forwardRef(function Link2({ href, as, replace = false, prefetch: prefetchProp, scroll = true, children, onClick, onNavigate, ...rest }, forwardedRef) {
  const { locale, ...restWithoutLocale } = rest;
  const resolvedHref = as ?? resolveHref(href);
  if (typeof resolvedHref === "string" && isDangerousScheme(resolvedHref)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Link> blocked dangerous href: ${resolvedHref}`);
    }
    const { passHref: _p2, ...safeProps } = restWithoutLocale;
    return jsx("a", { ...safeProps, children });
  }
  const localizedHref = applyLocaleToHref(resolvedHref, locale);
  const fullHref = withBasePath(localizedHref);
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const internalRef = useRef(null);
  const shouldPrefetch = prefetchProp !== false;
  const setRefs = useCallback((node) => {
    internalRef.current = node;
    if (typeof forwardedRef === "function")
      forwardedRef(node);
    else if (forwardedRef)
      forwardedRef.current = node;
  }, [forwardedRef]);
  useEffect(() => {
    if (!shouldPrefetch || typeof window === "undefined")
      return;
    const node = internalRef.current;
    if (!node)
      return;
    if (localizedHref.startsWith("http://") || localizedHref.startsWith("https://") || localizedHref.startsWith("//"))
      return;
    const observer = getSharedObserver();
    if (!observer)
      return;
    observerCallbacks.set(node, () => prefetchUrl(localizedHref));
    observer.observe(node);
    return () => {
      observer.unobserve(node);
      observerCallbacks.delete(node);
    };
  }, [shouldPrefetch, localizedHref]);
  const handleClick = async (e) => {
    if (onClick)
      onClick(e);
    if (e.defaultPrevented)
      return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    if (e.currentTarget.target && e.currentTarget.target !== "_self") {
      return;
    }
    if (resolvedHref.startsWith("http://") || resolvedHref.startsWith("https://") || resolvedHref.startsWith("//")) {
      return;
    }
    e.preventDefault();
    if (onNavigate) {
      try {
        const navUrl = new URL(resolvedHref, window.location.origin);
        let prevented = false;
        const navEvent = {
          url: navUrl,
          preventDefault() {
            prevented = true;
          },
          get defaultPrevented() {
            return prevented;
          }
        };
        onNavigate(navEvent);
        if (navEvent.defaultPrevented) {
          return;
        }
      } catch {
      }
    }
    if (!replace) {
      const state = window.history.state ?? {};
      window.history.replaceState({ ...state, __vinext_scrollX: window.scrollX, __vinext_scrollY: window.scrollY }, "");
    }
    const absoluteHref = resolveRelativeHref(resolvedHref);
    const absoluteFullHref = withBasePath(absoluteHref);
    if (typeof window !== "undefined" && isHashOnlyChange(absoluteFullHref)) {
      const hash2 = absoluteFullHref.includes("#") ? absoluteFullHref.slice(absoluteFullHref.indexOf("#")) : "";
      if (replace) {
        window.history.replaceState(null, "", absoluteFullHref);
      } else {
        window.history.pushState(null, "", absoluteFullHref);
      }
      if (scroll) {
        scrollToHash(hash2);
      }
      return;
    }
    const hashIdx = absoluteFullHref.indexOf("#");
    const hash = hashIdx !== -1 ? absoluteFullHref.slice(hashIdx) : "";
    const win = window;
    if (typeof win.__VINEXT_RSC_NAVIGATE__ === "function") {
      if (replace) {
        window.history.replaceState(null, "", absoluteFullHref);
      } else {
        window.history.pushState(null, "", absoluteFullHref);
      }
      setPending(true);
      try {
        await win.__VINEXT_RSC_NAVIGATE__(absoluteFullHref);
      } finally {
        if (mountedRef.current)
          setPending(false);
      }
    } else {
      try {
        const routerModule = await import("./router-Byo2jdDs.js");
        const Router = routerModule.default;
        if (replace) {
          await Router.replace(absoluteHref, void 0, { scroll });
        } else {
          await Router.push(absoluteHref, void 0, { scroll });
        }
      } catch {
        if (replace) {
          window.history.replaceState({}, "", absoluteFullHref);
        } else {
          window.history.pushState({}, "", absoluteFullHref);
        }
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
    if (scroll) {
      if (hash) {
        scrollToHash(hash);
      } else {
        window.scrollTo(0, 0);
      }
    }
  };
  const { passHref: _p, ...anchorProps } = restWithoutLocale;
  const linkStatusValue = React__default.useMemo(() => ({ pending }), [pending]);
  return jsx(LinkStatusContext.Provider, { value: linkStatusValue, children: jsx("a", { ref: setRefs, href: fullHref, onClick: handleClick, ...anchorProps, children }) });
});
const loadedScripts = /* @__PURE__ */ new Set();
function Script(props) {
  const { src, id, strategy = "afterInteractive", onLoad, onReady, onError, children, dangerouslySetInnerHTML, ...rest } = props;
  const hasMounted = useRef(false);
  if (typeof window === "undefined") {
    if (strategy === "beforeInteractive") {
      const scriptProps = { ...rest };
      if (src)
        scriptProps.src = src;
      if (id)
        scriptProps.id = id;
      if (dangerouslySetInnerHTML) {
        scriptProps.dangerouslySetInnerHTML = dangerouslySetInnerHTML;
      }
      return React__default.createElement("script", scriptProps, children);
    }
    return null;
  }
  const key = id ?? src ?? "";
  useEffect(() => {
    if (hasMounted.current)
      return;
    hasMounted.current = true;
    if (key && loadedScripts.has(key)) {
      onReady?.();
      return;
    }
    const load = () => {
      if (key && loadedScripts.has(key)) {
        onReady?.();
        return;
      }
      const el = document.createElement("script");
      if (src)
        el.src = src;
      if (id)
        el.id = id;
      for (const [attr, value] of Object.entries(rest)) {
        if (attr === "className") {
          el.setAttribute("class", String(value));
        } else if (typeof value === "string") {
          el.setAttribute(attr, value);
        } else if (typeof value === "boolean" && value) {
          el.setAttribute(attr, "");
        }
      }
      if (strategy === "worker") {
        el.setAttribute("type", "text/partytown");
      }
      if (dangerouslySetInnerHTML?.__html) {
        el.innerHTML = dangerouslySetInnerHTML.__html;
      } else if (children && typeof children === "string") {
        el.textContent = children;
      }
      el.addEventListener("load", (e) => {
        if (key)
          loadedScripts.add(key);
        onLoad?.(e);
        onReady?.();
      });
      if (onError) {
        el.addEventListener("error", onError);
      }
      document.body.appendChild(el);
    };
    if (strategy === "lazyOnload") {
      if (document.readyState === "complete") {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(load);
        } else {
          setTimeout(load, 1);
        }
      } else {
        window.addEventListener("load", () => {
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(load);
          } else {
            setTimeout(load, 1);
          }
        });
      }
    } else {
      load();
    }
  }, [src, id, strategy, onLoad, onReady, onError, children, dangerouslySetInnerHTML, key, rest]);
  return null;
}
const container = "_container_1jz6q_1";
const content$1 = "_content_1jz6q_7";
const search_container = "_search_container_1jz6q_19";
const search = "_search_1jz6q_19";
const matches = "_matches_1jz6q_53";
const selected = "_selected_1jz6q_72";
const highlight = "_highlight_1jz6q_79";
const over = "_over_1jz6q_82";
const table = "_table_1jz6q_86";
const styles$3 = {
  container,
  content: content$1,
  search_container,
  search,
  matches,
  selected,
  highlight,
  over,
  table
};
const Calendar = ({ events }) => {
  const [selected2, setSelected] = useState(0);
  const [search2, setSearch] = useState("");
  const [matches2, setMatches] = useState([]);
  const rowRefs = useRef({});
  useEffect(() => {
    if (!search2) {
      setMatches([]);
      setSelected(0);
      return;
    }
    const lower = search2.toLowerCase();
    const found = [];
    Object.entries(events).forEach(([month, monthEvents]) => {
      monthEvents.forEach((event, index) => {
        if (event.activity.toLowerCase().includes(lower) || event.date.includes(lower)) {
          found.push({ month, index });
        }
      });
    });
    setMatches(found);
    setSelected(0);
  }, [search2]);
  useEffect(() => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    let closest = null;
    for (const [month, monthEvents] of Object.entries(events)) {
      for (let index = 0; index < monthEvents.length; index++) {
        const event = monthEvents[index];
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const diff = Math.abs(eventDate.getTime() - today.getTime());
        if (!closest || diff < closest.diff) {
          closest = { month, index, diff };
        }
      }
    }
    if (!closest) return;
    const key = `${closest.month}-${closest.index}`;
    const el = rowRefs.current[key];
    if (!el) return;
    if (typeof window === "undefined") return;
    const top2 = window.scrollY + el.getBoundingClientRect().top + 150;
    window.scrollTo({ top: top2, behavior: "smooth" });
  }, []);
  const scrollToIndex = (i) => {
    if (i < 0 || i >= matches2.length) return;
    setSelected(i);
    const { month, index } = matches2[i];
    const key = `${month}-${index}`;
    const el = rowRefs.current[key];
    if (!el) return;
    if (typeof window === "undefined") return;
    const offset = -200;
    const top2 = window.scrollY + el.getBoundingClientRect().top + offset;
    window.scrollTo({ top: top2, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("div", { className: `${styles$3.container} box`, children: [
    /* @__PURE__ */ jsxs("div", { className: styles$3.search_container, children: [
      /* @__PURE__ */ jsxs("div", { className: styles$3.search, children: [
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-search" }),
        /* @__PURE__ */ jsx("input", { type: "search", id: "search", value: search2, placeholder: "Search an Event", onChange: (e) => setSearch(e.target.value) }),
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-arrow-left", title: "Previous", onClick: () => scrollToIndex(selected2 - 1) }),
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-arrow-right", title: "Next", onClick: () => scrollToIndex(selected2 + 1) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: styles$3.matches, children: matches2.map((m, i) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => scrollToIndex(i),
          className: selected2 === i ? styles$3.selected : "",
          children: events[m.month][m.index].activity
        },
        `${m.month}-${m.index}`
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: styles$3.content, children: Object.entries(events).map(([month, monthEvents]) => /* @__PURE__ */ jsxs("div", { className: styles$3.table, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("section", { children: "Date" }),
        /* @__PURE__ */ jsx("section", { children: "Activity" })
      ] }),
      /* @__PURE__ */ jsx("div", { children: monthEvents.map((event, index) => {
        const key = `${month}-${index}`;
        const isMatch = matches2.some((m) => m.month === month && m.index === index);
        const isSelected = matches2[selected2]?.month === month && matches2[selected2]?.index === index;
        const eventDate = new Date(event.date);
        const today = /* @__PURE__ */ new Date();
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const isOver = eventDate.getTime() < today.getTime();
        return /* @__PURE__ */ jsxs(
          "section",
          {
            ref: (el) => {
              rowRefs.current[key] = el;
            },
            className: `
                                                ${isMatch ? styles$3.highlight : ""}
                                                ${isSelected ? styles$3.selected : ""}
                                                ${isOver ? styles$3.over : ""}
                                            `,
            children: [
              /* @__PURE__ */ jsx("p", { children: eventDate.toDateString() }),
              /* @__PURE__ */ jsx("p", { children: event.activity })
            ]
          },
          index
        );
      }) })
    ] }, month)) })
  ] });
};
let messages = [];
const listeners = /* @__PURE__ */ new Set();
const notify = () => listeners.forEach((l) => l(messages));
const showMessage = (text, type = "error") => {
  const id = Date.now();
  messages = [...messages, { id, text, type }];
  notify();
  setTimeout(() => {
    messages = messages.filter((m) => m.id !== id);
    notify();
  }, 5e3);
};
const login = "_login_1fswr_1";
const video_container = "_video_container_1fswr_8";
const video_main = "_video_main_1fswr_18";
const video_overlay = "_video_overlay_1fswr_25";
const content = "_content_1fswr_35";
const login_instruction = "_login_instruction_1fswr_71";
const tip = "_tip_1fswr_79";
const styles$2 = {
  login,
  video_container,
  video_main,
  video_overlay,
  content,
  login_instruction,
  tip
};
const header = "_header_zxpxy_6";
const topbar = "_topbar_zxpxy_47";
const sub_menu = "_sub_menu_zxpxy_87";
const sidebar_background = "_sidebar_background_zxpxy_121";
const sidebar = "_sidebar_zxpxy_121";
const active = "_active_zxpxy_228";
const styles$1 = {
  header,
  topbar,
  sub_menu,
  sidebar_background,
  sidebar,
  active
};
function IntroVideo({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ref.current) return;
    const src = "/intro_vid/index.m3u8";
    if (ref.current.canPlayType("application/vnd.apple.mpegurl")) {
      ref.current.src = src;
      return;
    }
    import("hls.js/dist/hls.light.js").then((mod) => {
      const Hls = mod.default ?? mod;
      if (!Hls.isSupported()) return;
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(ref.current);
    });
  }, []);
  return /* @__PURE__ */ jsx(
    "video",
    {
      ref,
      autoPlay: true,
      muted: true,
      loop: true,
      playsInline: true,
      className
    }
  );
}
const LogInPage = ({ error }) => {
  const [isMobile, setIsMobile] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (error) showMessage(error);
    const check = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 900);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: styles$2.login, children: [
    /* @__PURE__ */ jsx("div", { className: styles$2.video_container, children: isMobile === null ? null : !isMobile ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(IntroVideo, { className: styles$2.video_main }),
      /* @__PURE__ */ jsx(IntroVideo, { className: styles$2.video_overlay })
    ] }) : /* @__PURE__ */ jsx("img", { src: "/bb-banner-1.webp", alt: "Background Image", width: 150, height: 150 }) }),
    /* @__PURE__ */ jsxs("div", { className: styles$2.content, children: [
      /* @__PURE__ */ jsxs("div", { className: "logo", children: [
        /* @__PURE__ */ jsx("img", { src: "/bb-crest.png", alt: "BB Logo", width: 60, height: 60 }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { children: "The boys' brigade" }),
          /* @__PURE__ */ jsx("span", { children: "21st Singapore Company" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/api/auth/login", children: [
        /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
          /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
          /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
          /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
        ] }),
        "Google"
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/parade_notice", children: [
        "View Parade Notice and Calendar ",
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-arrow-right" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `tip ${styles$2.tip}`, children: "Boys: school email · Others: personal email" }),
      /* @__PURE__ */ jsxs("div", { className: styles$2.login_instruction, children: [
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-info-circle" }),
        "Registered users only. Contact admin for help."
      ] })
    ] })
  ] });
};
const footer = "_footer_fwswm_1";
const logo = "_logo_fwswm_10";
const top = "_top_fwswm_38";
const about = "_about_fwswm_43";
const links = "_links_fwswm_57";
const middle = "_middle_fwswm_77";
const bottom = "_bottom_fwswm_119";
const styles = {
  footer,
  logo,
  top,
  about,
  links,
  middle,
  bottom
};
const Footer = ({ user }) => {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("cookie_banner_value");
    if (stored === "true") setAccepted(true);
    else setAccepted(false);
  }, []);
  return /* @__PURE__ */ jsxs("footer", { className: styles.footer, children: [
    /* @__PURE__ */ jsxs("div", { className: styles.top, children: [
      /* @__PURE__ */ jsxs("div", { className: styles.about, children: [
        /* @__PURE__ */ jsxs("div", { className: styles.logo, translate: "no", children: [
          /* @__PURE__ */ jsx("img", { src: "/bb-crest.png", alt: "BB Logo", width: 60, height: 60 }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { children: "The boys' brigade" }),
            /* @__PURE__ */ jsx("span", { children: "21st Singapore Company" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "BB 21st Portal streamlines repetitive tasks like parade notices, attendance, awards tracking, uniform inspections, and 32A result generation." }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.instagram.com/bb21coy/",
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "Instagram",
            children: /* @__PURE__ */ jsx("i", { className: "fa-brands fa-instagram" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles.links, children: [
        /* @__PURE__ */ jsx("p", { children: "Quick Links" }),
        /* @__PURE__ */ jsx(Link, { href: user?.type ? "/home" : "/login", children: user?.type ? "Dashboard" : "Login" }),
        /* @__PURE__ */ jsx(Link, { href: "/parade_notice", children: "Parade Notice" }),
        /* @__PURE__ */ jsx(Link, { href: "/calendar", children: "Calendar" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles.links, children: [
        /* @__PURE__ */ jsx("p", { children: "Affiliated With" }),
        /* @__PURE__ */ jsx(Link, { href: "https://www.geylangmethodistsec.moe.edu.sg", target: "_blank", children: "Geylang Methodist School (Secondary)" }),
        /* @__PURE__ */ jsx(Link, { href: "https://www.cmch.sg", target: "_blank", children: "Christalite Methodist Chapel" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles.links, children: [
        /* @__PURE__ */ jsx("p", { children: "Associated Websites" }),
        /* @__PURE__ */ jsx(Link, { href: "https://www.bb.org.sg", target: "_blank", children: "BB Singapore" }),
        /* @__PURE__ */ jsx(Link, { href: "https://members.bb.org.sg", target: "_blank", children: "BB Members Portal" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: styles.middle, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { "data-icon": true, style: { "--icon": "'\\f3c5'" }, children: "Location" }),
        /* @__PURE__ */ jsx(Link, { href: "https://maps.app.goo.gl/gNWas7A5sUHMQJsm9", target: "_blank", children: "2 Geylang East Central, Singapore 389705" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { "data-icon": true, style: { "--icon": "'\\f121'" }, children: "Inspired and Developed by" }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx(Link, { href: "https://github.com/BryanL2303", target: "_blank", translate: "no", children: "Bryan Lee," }),
          " ",
          /* @__PURE__ */ jsx(Link, { href: "https://github.com/yaboywf", target: "_blank", translate: "no", children: "Dylan Yeo," }),
          " ",
          /* @__PURE__ */ jsx(Link, { href: "https://github.com/yorhagengyue", target: "_blank", translate: "no", children: "Geng Yue" })
        ] })
      ] }),
      accepted && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { id: "google_translate_element" }),
        /* @__PURE__ */ jsx("span", { children: "Translation accuracy is not guaranteed." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: styles.bottom, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " The Boys' Brigade 21",
          /* @__PURE__ */ jsx("sup", { children: "st" }),
          " Singapore Company. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Version ",
          process.env.NEXT_PUBLIC_GIT_HASH
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { children: [
        "This hope we have as an anchor of the soul, a hope both",
        " ",
        /* @__PURE__ */ jsx("strong", { children: "sure and stedfast" }),
        " and one which enters within the veil where Jesus has entered as a forerunner for us...",
        /* @__PURE__ */ jsx("br", {}),
        "Hebrews 6:19–20a"
      ] }) })
    ] })
  ] });
};
async function api(method = "post", url, body = {}) {
  const options = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json"
    }
  };
  if (body && method != "get") options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return await res.json();
}
const baseTabs = {
  "statistics": {
    "My Attendance": ["/user_attendance", "'\\f4fd'"],
    "My Awards": ["/user_awards", "'\\f559'"],
    "My Inspection Results": ["/user_inspections", "'\\e3c7'"]
  },
  "management": {
    "User Management": ["/user_management", "'\\f0c0'"],
    "Parades & Attendance": ["/attendance_management", "'\\f15b'"],
    "Award Management": ["/award_management", "'\\f5f3'"],
    "Result Generation": ["/generate_result", "'\\f570'"],
    "Uniform Inspection": ["/uniform_inspection", "'\\e3c7'"]
  },
  "others": {
    "Resources": ["/resources", "'\\f02d'"],
    "Help": ["/help", "'\\003f'"],
    "Parade Notice": ["/parade_notice", "'\\f15b'"],
    "Calendar": ["/calendar", "'\\f133'"]
  }
};
const Header = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(pathname);
  const [navigationViewable, setNavigationViewable] = useState(false);
  const [submenuPos, setSubmenuPos] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [tabs, setTabs] = useState(baseTabs);
  useEffect(() => {
    if (!user || typeof user !== "object" || !("type" in user)) return;
    const tabs2 = structuredClone(baseTabs);
    if (!["boy", "admin"].includes(user.type) && tabs2.statistics) {
      delete tabs2.statistics["My Awards"];
      delete tabs2.statistics["My Inspection Results"];
    }
    if (user.type === "boy" && user.appointment && tabs2.management) delete tabs2.management["Uniform Inspection"];
    if (user.type === "boy" && !user.appointment && tabs2.management) delete tabs2.management;
    setTabs(tabs2);
    setCurrentPage(pathname);
  }, [pathname]);
  useEffect(() => {
    console.log(acsiiArt);
  }, []);
  const logout = async () => {
    try {
      await api("post", "/api/auth/logout", { deviceId: localStorage.getItem("deviceId") });
      localStorage.removeItem("deviceId");
      router.replace("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };
  const handleSubmenuClick = (e, menuKey) => {
    if (activeMenu === menuKey) return setActiveMenu(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setSubmenuPos({ x: rect.left, y: rect.bottom });
    setActiveMenu(menuKey);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: styles$1.header, children: [
      /* @__PURE__ */ jsxs("div", { className: "logo", translate: "no", onClick: () => router.push(user ? "/home" : "/login"), children: [
        /* @__PURE__ */ jsx("img", { src: "/bb-crest.png", alt: "BB Logo", width: "60", height: "60" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { children: "The boys' brigade" }),
          /* @__PURE__ */ jsx("span", { children: "21st Singapore Company" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: styles$1.topbar, children: [
        !user ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { onClick: () => router.push("/calendar"), children: "Calendar" }),
          /* @__PURE__ */ jsx("div", { onClick: () => router.push("/parade_notice"), children: "Parade Notice" }),
          /* @__PURE__ */ jsx("div", { onClick: () => router.push("/login"), children: "Login" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { "data-home": true, onClick: () => {
            router.push("/home");
            setActiveMenu(null);
          }, children: "Dashboard" }),
          Object.keys(tabs).map((menuKey) => /* @__PURE__ */ jsx("div", { "data-submenu": true, onClick: (e) => handleSubmenuClick(e, menuKey), children: menuKey.charAt(0).toUpperCase() + menuKey.slice(1) }, menuKey)),
          /* @__PURE__ */ jsx("div", { "data-image": user?.picture || false, style: { background: `url(${user?.picture}) center/cover no-repeat` } }),
          /* @__PURE__ */ jsx("div", { "data-logout": true, onClick: logout, children: "Logout" })
        ] }),
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-bars", onClick: () => setNavigationViewable((prevState) => !prevState) })
      ] })
    ] }),
    activeMenu && /* @__PURE__ */ jsx("div", { className: styles$1.sub_menu, style: { left: submenuPos.x, top: submenuPos.y + 10, height: `${4 + Object.keys(tabs[activeMenu]).length * 10 + Object.keys(tabs[activeMenu]).length * 30}px` }, children: Object.keys(tabs[activeMenu]).map((tab, index) => /* @__PURE__ */ jsx("button", { style: { "--icon": tabs[activeMenu][tab][1] }, onClick: () => router.push(tabs[activeMenu][tab][0]), children: tab }, index)) }),
    /* @__PURE__ */ jsx("div", { className: styles$1.sidebar_background, style: { opacity: navigationViewable ? "1" : "0" } }),
    /* @__PURE__ */ jsxs("div", { className: styles$1.sidebar, style: { right: navigationViewable ? "0" : "-110vw" }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        user && /* @__PURE__ */ jsx("div", { "data-image": user?.picture || false, style: { background: `url('${user?.picture}') center/cover no-repeat` }, onClick: () => router.push("/user_profile") }),
        /* @__PURE__ */ jsx("i", { className: "fa-regular fa-xmark", onClick: () => setNavigationViewable((prevState) => !prevState) })
      ] }),
      /* @__PURE__ */ jsx("div", { children: !user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { onClick: () => router.push("/parade_notice"), style: { "--icon": '"\\f15b"' }, children: "Parade Notice" }),
        /* @__PURE__ */ jsx("button", { onClick: () => router.push("/calendar"), style: { "--icon": '"\\f133"' }, children: "Calendar" }),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx("button", { "data-main-button": true, onClick: () => router.push("/login"), children: "Login" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { onClick: () => router.push("/home"), style: { "--icon": '"\\f015"' }, className: currentPage === "/home" ? styles$1.active : "", children: "Dashboard" }),
        Object.keys(tabs).map((tab, index) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
          /* @__PURE__ */ jsx("p", { children: tab.charAt(0).toUpperCase() + tab.slice(1) }),
          Object.keys(tabs[tab]).map((t, index2) => /* @__PURE__ */ jsx("button", { "data-sub-button": true, className: currentPage === tabs[tab][t][0] ? styles$1.active : "", style: { "--icon": tabs[tab][t][1] }, onClick: () => router.push(tabs[tab][t][0]), children: t }, index2))
        ] }, index)),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx("button", { "data-main-button": true, onClick: logout, children: "Logout" })
      ] }) })
    ] })
  ] });
};
const acsiiArt = `
 mmmmmm    mmmmmm     mmmmm      mmm    
 ##""""##  ##""""##  #""""##m   #"##    
 ##    ##  ##    ##        ##     ##    
 #######   #######       m#"      ##    
 ##    ##  ##    ##    m#"        ##    
 ##mmmm##  ##mmmm##  m##mmmmm  mmm##mmm 
 """""""   """""""   """"""""  """""""" 
`;
const export_f29e6e234fea = {
  ErrorBoundary,
  NotFoundBoundary
};
const export_0deffcb8ffd7 = {
  LayoutSegmentProvider
};
const export_c2747888630f = {
  default: Link
};
const export_60f387d9e0f4 = {
  default: Script
};
const export_957c261005b7 = {
  default: Calendar
};
const export_81098ba4bd29 = {
  default: LogInPage
};
const export_0dce242c6c49 = {
  default: Footer
};
const export_940a5ae8f5fb = {
  default: Header
};
export {
  export_0dce242c6c49,
  export_0deffcb8ffd7,
  export_60f387d9e0f4,
  export_81098ba4bd29,
  export_940a5ae8f5fb,
  export_957c261005b7,
  export_c2747888630f,
  export_f29e6e234fea
};
