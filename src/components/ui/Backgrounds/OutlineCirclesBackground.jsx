export default function OutlineCirclesBackground() {
  const circles = [
    {
      className:
        "left-[-120px] top-[-150px] h-[280px] w-[280px] md:h-[360px] md:w-[360px]",
      opacity: 0.05,
    },
    {
      className:
        "left-1/2 top-[-220px] h-[320px] w-[320px] -translate-x-1/2 md:top-[-260px] md:h-[430px] md:w-[430px]",
      opacity: 0.065,
    },
    {
      className:
        "right-[10%] top-[-170px] h-[260px] w-[260px] md:h-[340px] md:w-[340px]",
      opacity: 0.045,
    },
    {
      className:
        "right-[-120px] top-[-90px] h-[220px] w-[220px] md:h-[300px] md:w-[300px]",
      opacity: 0.055,
    },

    {
      className:
        "left-[-150px] top-[170px] h-[320px] w-[320px] md:h-[400px] md:w-[400px]",
      opacity: 0.04,
    },
    {
      className:
        "left-[18%] top-[10px] h-[420px] w-[420px] md:h-[560px] md:w-[560px]",
      opacity: 0.075,
    },
    {
      className:
        "left-[24%] top-[220px] h-[430px] w-[430px] md:h-[620px] md:w-[620px]",
      opacity: 0.055,
    },
    {
      className:
        "right-[-180px] top-[180px] h-[420px] w-[420px] md:h-[600px] md:w-[600px]",
      opacity: 0.06,
    },

    {
      className:
        "left-[38%] bottom-[-170px] h-[240px] w-[240px] md:h-[340px] md:w-[340px]",
      opacity: 0.045,
    },
    {
      className:
        "right-[2%] bottom-[-150px] h-[260px] w-[260px] md:h-[380px] md:w-[380px]",
      opacity: 0.07,
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {circles.map((circle, index) => (
        <span
          key={index}
          className={`absolute rounded-full border ${circle.className}`}
          style={{ borderColor: `rgba(0,0,0,${circle.opacity})` }}
        />
      ))}
    </div>
  );
}
