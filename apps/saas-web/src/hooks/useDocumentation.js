import {
  Book,
  Bot,
  Cloud,
  Code2,
  FileCode,
  Layers,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "./useCurrentUser";

export const DOCS_MENU = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", label: "Introduction", icon: Book },
      { id: "sdk-usage", label: "Frontend SDK", icon: Code2 },
      { id: "cloud-usage", label: "Backend & Cloud API", icon: Cloud },
      { id: "ai-skills", label: "AI Assistant Skills", icon: Bot },
    ],
  },
  {
    title: "Guides & Reference",
    items: [
      { id: "methodology", label: "Methodology", icon: Layers },
      { id: "troubleshooting", label: "Troubleshooting", icon: Wrench },
      { id: "api-ref", label: "API Reference", icon: FileCode },
    ],
  },
];

const VALID_SECTIONS = [
  "introduction",
  "sdk-usage",
  "cloud-usage",
  "ai-skills",
  "methodology",
  "troubleshooting",
  "api-ref",
];

export function useDocumentation() {
  const [activePage, setActivePage] = useState("introduction");
  const { user } = useCurrentUser();
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get("section") || hash;
    if (section && VALID_SECTIONS.includes(section)) {
      setActivePage(section);
    }
  }, [location]);

  const scrollToTop = () => {
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTopicChange = (id) => {
    setActivePage(id);
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", `#${id}`);
    }
    scrollToTop();
  };

  const flatItems = DOCS_MENU.flatMap((g) => g.items);
  const currentIndex = flatItems.findIndex((i) => i.id === activePage);
  const prevItem = flatItems[currentIndex - 1];
  const nextItem = flatItems[currentIndex + 1];
  const currentItem = flatItems[currentIndex] || flatItems[0];

  return {
    activePage,
    setActivePage,
    user,
    menu: DOCS_MENU,
    currentItem,
    prevItem,
    nextItem,
    topicDropdownOpen,
    setTopicDropdownOpen,
    handleTopicChange,
  };
}
