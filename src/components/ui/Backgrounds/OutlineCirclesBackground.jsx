export default function OutlineCirclesBackground() {
  const circles = [
    "left-[-120px] top-[-150px] h-[280px] w-[280px] md:h-[360px] md:w-[360px]",
    "left-1/2 top-[-220px] h-[320px] w-[320px] -translate-x-1/2 md:top-[-260px] md:h-[430px] md:w-[430px]",
    "right-[10%] top-[-170px] h-[260px] w-[260px] md:h-[340px] md:w-[340px]",
    "right-[-120px] top-[-90px] h-[220px] w-[220px] md:h-[300px] md:w-[300px]",

    "left-[-150px] top-[170px] h-[320px] w-[320px] md:h-[400px] md:w-[400px]",
    "left-[18%] top-[10px] h-[420px] w-[420px] md:h-[560px] md:w-[560px]",
    "left-[24%] top-[220px] h-[430px] w-[430px] md:h-[620px] md:w-[620px]",
    "right-[-180px] top-[180px] h-[420px] w-[420px] md:h-[600px] md:w-[600px]",

    "left-[38%] bottom-[-170px] h-[240px] w-[240px] md:h-[340px] md:w-[340px]",
    "right-[2%] bottom-[-150px] h-[260px] w-[260px] md:h-[380px] md:w-[380px]",
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {circles.map((circle, index) => (
        <span
          key={index}
          className={`absolute rounded-full border border-black/13 ${circle}`}
        />
      ))}
    </div>
  );
}