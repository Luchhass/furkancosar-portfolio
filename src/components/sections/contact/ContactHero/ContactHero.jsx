import Hero from "@/components/ui/Hero/Hero";

export default function ContactHero() {
  return (
    <Hero
      titleLines={[
        { text: "Let's" },
        { text: "Shape Your" },
        { text: "Next Build", gradient: true },
      ]}
      copyLines={[
        "Share the idea, goal or interface you want to build. I'll help",
        "turn it into a clean, responsive and polished frontend experience.",
      ]}
      copyClassName="justify-self-center"
    />
  );
}