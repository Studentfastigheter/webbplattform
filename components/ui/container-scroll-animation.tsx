"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
  disableAnimation = false,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  disableAnimation?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isLargeScreen, setIsLargeScreen] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1130);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scaleDimensions = () => {
    return isLargeScreen ? [1.05, 1] : [0.9, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-auto md:h-[80rem] flex items-center justify-center relative p-6 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
          disableAnimation={disableAnimation}
        />
        {isLargeScreen && (
          <Card
            rotate={rotate}
            translate={translate}
            scale={scale}
            disableAnimation={disableAnimation}
          >
            {children}
          </Card>
        )}
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
  disableAnimation = false,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
  disableAnimation?: boolean;
}) => {
  if (disableAnimation) {
    return <div className="div max-w-5xl mx-auto text-center">{titleComponent}</div>;
  }

  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  disableAnimation = false,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  disableAnimation?: boolean;
  children: React.ReactNode;
}) => {
  if (disableAnimation) {
    return (
      <div className="max-w-5xl md:-mt-12 mx-auto h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl">
        <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 ">
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl md:-mt-12 mx-auto h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 ">
        {children}
      </div>
    </motion.div>
  );
};
