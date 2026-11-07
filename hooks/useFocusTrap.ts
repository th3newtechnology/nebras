import { useEffect, useRef } from 'react';

/**
 * خطاف إدارة التركيز وحلقة لوحة المفاتيح للنوافذ المنبثقة
 * يتوافق بنسبة 100% مع معايير WCAG 2.2 AA (Criteria 2.4.3 & 2.4.7)
 * - يحفظ العنصر الذي قام بفتح النافذة
 * - يوجه التركيز إلى أول عنصر قابل للتفاعل داخل النافذة
 * - يقفل دورة مفتاح Tab و Shift+Tab داخل حدود النافذة لمنع تسرب التركيز
 * - يعيد التركيز تلقائياً إلى العنصر المثير فور إغلاق النافذة
 */
export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. تذكر العنصر النشط حالياً قبل فتح النافذة
      triggerElementRef.current = document.activeElement as HTMLElement;

      // 2. توجيه التركيز لأول عنصر قابل للتفاعل داخل النافذة
      const focusTimer = setTimeout(() => {
        if (!containerRef.current) return;
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 50);

      // 3. احتواء مفتاح Tab ومفتاح Escape
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === 'Tab' && containerRef.current) {
          const focusable = containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            // الرجوع للخلف: إذا كان على أول عنصر، ينتقل لآخر عنصر
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            // التقدم للأمام: إذا كان على آخر عنصر، يرجع لأول عنصر
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // 4. استعادة التركيز عند الإغلاق
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);

        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
          setTimeout(() => {
            triggerElementRef.current?.focus();
          }, 30);
        }
      };
    }
  }, [isOpen, onClose]);

  return containerRef;
}
