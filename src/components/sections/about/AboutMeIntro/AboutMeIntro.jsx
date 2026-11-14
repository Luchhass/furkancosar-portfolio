"use client";
import ReadingText from "@/components/ui/ReadingText";
import MiniTitleText from "@/components/ui/MiniTitleText";
import TitleLine from "@/components/ui/TitleLine";

function Highlight({ children }) {
  return <span data-about-highlight className="gradient-text-flow relative inline-block">{children}</span>;
}

export default function AboutMeIntro() {
  return (
    <section data-header-theme="light" data-scroll-reveal="sequence" className="ui-screen ui-screen-scroll about-now relative overflow-hidden bg-white ui-section text-black" aria-labelledby="about-intro-title">
      <div className="ui-section-grid">
        <p data-reveal-part="kicker" className="ui-section-label text-black/55"><MiniTitleText>NOW</MiniTitleText></p>
        <div className="ui-section-body ui-section-stack">
          <h2 id="about-intro-title" data-reveal-part="title" className="ui-section-title flex flex-col"><TitleLine>What I&apos;m</TitleLine><TitleLine className="gradient-text-flow">Doing</TitleLine></h2>
          <div className="grid max-w-2xl gap-3">
            <ReadingText className="ui-section-copy text-black/65">I&apos;m a <Highlight>Frontend Developer</Highlight> and final-year Web Design student at Istanbul University. Through internships, <Highlight>freelance projects</Highlight> and startup work, I&apos;ve gained hands-on experience turning ideas into responsive, user-focused interfaces. I combine design, code and thoughtful motion to create digital experiences that feel clear and polished across every screen. Alongside my studies, I continue to develop my skills through real projects, exploring new technologies and paying close attention to the details that make an interface enjoyable to use.</ReadingText>
          </div>
        </div>
      </div>
      <span className="about-curious-badge" data-reveal-order="4" aria-hidden="true"><TitleLine fromRight staggerChildren={.12} className="text-right"><span className="block">Stay</span><span className="block">curious</span></TitleLine></span>
    </section>
  );
}
