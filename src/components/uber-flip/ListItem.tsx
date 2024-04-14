import { useEffect, useLayoutEffect, useRef, type FC } from "react";
import car from "./car.jpg";

const transitionValues = {
  easing: `var(--power-1-out)`,
  duration: 175,
};

const transition = `transform ${transitionValues.duration}ms ${transitionValues.easing}`;
const transformReset = `translate(0,0) scale(1)`;

const ListItem: FC<{
  title: string;
  subtitle: string;
  price: string;
  faster?: boolean;
  onClick: () => void;
  openId: number;
  id: number;
}> = ({ id, onClick, openId, title, subtitle, price, faster }) => {
  const containerRef = useRef<HTMLLIElement>();
  const currentRectContainer = useRef<DOMRect>();
  const innerRef = useRef<HTMLDivElement>();
  const currentRectInner = useRef<DOMRect>();
  const currentRectRedBox = useRef<DOMRect>();
  const redBoxRef = useRef<HTMLDivElement>();
  const currentRectText = useRef<DOMRect>();
  const textRef = useRef<HTMLDivElement>();
  const currentRectPrice = useRef<DOMRect>();
  const priceRef = useRef<HTMLDivElement>();
  const isOpen = openId === id;

  useEffect(() => {
    currentRectContainer.current = containerRef.current.getBoundingClientRect();
    currentRectRedBox.current = redBoxRef.current.getBoundingClientRect();
    currentRectText.current = textRef.current.getBoundingClientRect();
    currentRectPrice.current = priceRef.current.getBoundingClientRect();
    currentRectInner.current = innerRef.current.getBoundingClientRect();
    containerRef.current.style.transition = transition;
  }, []);

  useLayoutEffect(() => {
    const oldBounds = currentRectContainer.current;
    const newBounds = containerRef.current.getBoundingClientRect();
    const oldBoundsRedBox = currentRectRedBox.current;
    const newBoundsRedBox = redBoxRef.current.getBoundingClientRect();
    const oldBoundsText = currentRectText.current;
    const newBoundsText = textRef.current.getBoundingClientRect();
    const oldBoundsPrice = currentRectPrice.current;
    const newBoundsPrice = priceRef.current.getBoundingClientRect();
    if (!oldBounds || !newBounds) return;
    const shouldChangeLayout = newBounds.height !== oldBounds.height;
    const isOpening = id === openId;

    if (shouldChangeLayout) {
      requestAnimationFrame(() => {
        const redBoxDelta = {
          scale: oldBoundsRedBox.height / newBoundsRedBox.height,
          x: oldBoundsRedBox.left - newBoundsRedBox.left,
          y: oldBoundsRedBox.top - newBoundsRedBox.top,
        };
        const textDelta = {
          x: oldBoundsText.left - newBoundsText.left,
          y: oldBoundsText.top - newBoundsText.top,
        };
        const priceDelta = { y: oldBoundsPrice.top - newBoundsPrice.top };
        const containerDelta = {
          y: oldBounds.top - newBounds.top,
          scale: oldBounds.height / newBounds.height,
        };

        // TODO: Where does this magic 60px come from?
        const TODO_MAGIC = isOpening ? 60 : -60;
        containerRef.current.style.transition = "none";
        innerRef.current.style.transition = "none";
        redBoxRef.current.style.transition = "none";
        textRef.current.style.transition = "none";
        priceRef.current.style.transition = "none";
        containerRef.current.style.transform = `translateY(${containerDelta.y}px) scaleY(${containerDelta.scale})`;
        innerRef.current.style.transform = `scaleY(${1 / containerDelta.scale}) translateY(${TODO_MAGIC}px)`;
        redBoxRef.current.style.transform = `translate(${redBoxDelta.x}px, ${redBoxDelta.y}px) scale(${redBoxDelta.scale})`;
        textRef.current.style.transform = `translate(${textDelta.x}px, ${textDelta.y}px)`;
        priceRef.current.style.transform = `translateY(${priceDelta.y}px)`;
        requestAnimationFrame(() => {
          containerRef.current.style.transition = transition;
          innerRef.current.style.transition = transition;
          redBoxRef.current.style.transition = transition;
          textRef.current.style.transition = transition;
          priceRef.current.style.transition = transition;
          containerRef.current.style.transform = transformReset;
          innerRef.current.style.transform = transformReset;
          redBoxRef.current.style.transform = transformReset;
          textRef.current.style.transform = transformReset;
          priceRef.current.style.transform = transformReset;
        });
      });
    } else {
      containerRef.current.style.transition = "none";
      containerRef.current.style.transform = `translateY(${oldBounds.top - newBounds.top}px)`;
      requestAnimationFrame(() => {
        containerRef.current.style.transition = transition;
        containerRef.current.style.transform = transformReset;
      });
    }
    currentRectContainer.current = newBounds;
    currentRectRedBox.current = newBoundsRedBox;
    currentRectText.current = newBoundsText;
    currentRectPrice.current = newBoundsPrice;
  }, [openId, containerRef, id]);

  if (isOpen) {
    return (
      <li ref={containerRef} className="origin-top relative">
        <button
          onClick={onClick}
          className="p-4 rounded-lg cursor-pointer gap-4 overflow-visible w-full bg-white ring-2 ring-black"
        >
          <div ref={innerRef} className="inner flex w-full flex-col">
            <div
              ref={redBoxRef}
              className="w-32 h-[102px] m-auto aspect-square origin-top-left"
            >
              <img alt="" src={car.src} className="mix-blend-multiply" />
            </div>
            <div className="w-full flex">
              <div
                className="flex flex-col justify-start items-start"
                ref={textRef}
              >
                <p className="text-base font-semibold">{title}</p>
                <p className="text-slate-700 mb-[4px] text-sm">{subtitle}</p>
                {faster && (
                  <div className="bg-blue-500 text-white rounded-sm py-[3px] px-[6px] text-[12px] font-semibold">
                    Faster
                  </div>
                )}
              </div>
              <div
                ref={priceRef}
                className="justify-end self-start grow text-right font-semibold text-sm"
              >
                {price}
              </div>
            </div>
          </div>
        </button>
      </li>
    );
  }
  return (
    <li ref={containerRef} className="origin-top relative">
      <button
        onClick={onClick}
        className="cursor-pointer overflow-visible w-full bg-white p-4"
      >
        <div ref={innerRef} className="inner flex gap-4 w-full items-center">
          <div
            ref={redBoxRef}
            className="w-20 h-16 aspect-square origin-top-left flex items-center justify-center"
          >
            <img alt="" src={car.src} className="mix-blend-multiply" />
          </div>
          <div
            className="flex flex-col justify-start items-start leading-4"
            ref={textRef}
          >
            <p className="text-base font-semibold">{title}</p>
            <p className="text-slate-700 mb-[4px] text-sm">{subtitle}</p>
            {faster && (
              <div className="bg-blue-500 text-white rounded-sm py-[3px] px-[6px] text-[12px] font-semibold">
                Faster
              </div>
            )}
          </div>
          <div
            ref={priceRef}
            className="justify-end self-start grow text-right font-semibold text-sm"
          >
            {price}
          </div>
        </div>
      </button>
    </li>
  );
};

export default ListItem;
