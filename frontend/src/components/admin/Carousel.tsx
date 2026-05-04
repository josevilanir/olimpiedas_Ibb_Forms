import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../../pages/AdminDashboard.module.css";

interface CarouselProps {
  children: React.ReactNode[];
  title: string;
  icon?: string;
}

export function Carousel({ children, title, icon }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const updateWidths = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        updateScrollButtons();
      }
    };

    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, [children]);

  const updateScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, offsetWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - offsetWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = containerWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.carouselSection}>
      <div className={styles.carouselHeader}>
        <div className={styles.carouselTitleGroup}>
          {icon && <span className={styles.carouselIcon}>{icon}</span>}
          <h3 className={styles.carouselTitle}>{title}</h3>
          <span className={styles.carouselBadge}>{children.length} modalidade{children.length !== 1 ? "s" : ""}</span>
        </div>
        <div className={styles.carouselControls}>
          <button
            className={`${styles.carouselBtn} ${!canScrollLeft ? styles.carouselBtnDisabled : ""}`}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`${styles.carouselBtn} ${!canScrollRight ? styles.carouselBtnDisabled : ""}`}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Próximo"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={styles.carouselContainer}
        onScroll={updateScrollButtons}
      >
        <div className={styles.carouselTrack}>
          {children.map((child, i) => (
            <div key={i} className={styles.carouselItem}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
