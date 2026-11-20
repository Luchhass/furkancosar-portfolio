from pathlib import Path
import math
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


PAGE_W, PAGE_H = A4
INK = colors.HexColor("#17171A")
MUTED = colors.HexColor("#66666D")
FAINT = colors.HexColor("#8A8A91")
PRIMARY = colors.HexColor("#EB5E28")
PALE = colors.HexColor("#E7E7EB")
BLACK = colors.HexColor("#101012")
WHITE = colors.white


def register_fonts():
    font_dir = Path("C:/Windows/Fonts")
    regular = font_dir / "arial.ttf"
    bold = font_dir / "arialbd.ttf"
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("CV-Regular", str(regular)))
        pdfmetrics.registerFont(TTFont("CV-Bold", str(bold)))
        return "CV-Regular", "CV-Bold"
    return "Helvetica", "Helvetica-Bold"


REGULAR, BOLD = register_fonts()


def primary_rule(pdf, x, y, width, height=1.4):
    pdf.setFillColor(PRIMARY)
    pdf.rect(x, y, width, height, fill=1, stroke=0)


def draw_hero_geometry(pdf, x, y, width, height):
    """Draw the hero's static, dark hex-cell field without pointer lighting."""
    cell_w = max(42, min(65, width * 0.0375)) * math.sqrt(2)
    cell_h = cell_w * 1.15
    x_step = cell_w * 1.01
    y_step = cell_h * 0.758
    columns = math.ceil(width / x_step) + 4
    rows = math.ceil(height / y_step) + 4
    offset_x = -cell_w * 1.35
    offset_y = -cell_h * 1.25

    pdf.saveState()
    clip = pdf.beginPath()
    clip.rect(x, y, width, height)
    pdf.clipPath(clip, stroke=0, fill=0)
    for row in range(rows):
        row_offset = 0 if row % 2 == 0 else x_step * 0.5
        for column in range(columns):
            noise_value = math.sin((row + 1) * 127.1 + (column + 1) * 311.7)
            noise = noise_value - math.floor(noise_value)
            shade = 4 + math.floor(noise * 24)
            face = min(44, shade + 12)
            edge = min(39, shade + 5)
            center_x = x + offset_x + column * x_step + row_offset + cell_w * 0.5
            center_y = y + height - (offset_y + row * y_step + cell_h * 0.5)
            half_w = cell_w * 0.982 * 0.5
            half_h = cell_h * 0.982 * 0.5
            points = [
                (center_x, center_y + half_h),
                (center_x + half_w, center_y + half_h * 0.5),
                (center_x + half_w, center_y - half_h * 0.5),
                (center_x, center_y - half_h),
                (center_x - half_w, center_y - half_h * 0.5),
                (center_x - half_w, center_y + half_h * 0.5),
            ]
            path = pdf.beginPath()
            path.moveTo(*points[0])
            for point in points[1:]:
                path.lineTo(*point)
            path.close()
            pdf.setFillColorRGB(face / 255, face / 255, min(1, (face + 2) / 255))
            pdf.setStrokeColorRGB(edge / 255, edge / 255, min(1, (edge + 2) / 255))
            pdf.setLineWidth(0.35)
            pdf.drawPath(path, fill=1, stroke=1)
    pdf.restoreState()


def wrap_lines(text, font, size, width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and pdfmetrics.stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def paragraph(pdf, text, x, y, width, size=8.6, leading=12.4, color=MUTED, font=None):
    font = font or REGULAR
    pdf.setFillColor(color)
    pdf.setFont(font, size)
    lines = wrap_lines(text, font, size, width)
    for line in lines:
        pdf.drawString(x, y, line)
        y -= leading
    return y


def section_heading(pdf, title, x, y, width):
    pdf.setFillColor(PRIMARY)
    pdf.circle(x + 2.2, y + 2.8, 2.2, fill=1, stroke=0)
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 9.2)
    pdf.drawString(x + 11, y, title.upper())
    primary_rule(pdf, x, y - 8, width, 1.15)


def small_label(pdf, title, x, y):
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 7.6)
    pdf.drawString(x, y, title.upper())


def draw_cv(output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output_path), pagesize=A4, pageCompression=1)
    pdf.setTitle("Furkan Cosar | Frontend Developer")
    pdf.setAuthor("Furkan Cosar")
    pdf.setSubject("Frontend development CV")

    left = 40
    col_gap = 26
    left_w = 326
    right_x = left + left_w + col_gap
    right_w = PAGE_W - 40 - right_x

    # Header: a restrained nod to the portfolio's dark hero and primary accents.
    header_h = 132
    pdf.setFillColor(BLACK)
    pdf.rect(0, PAGE_H - header_h, PAGE_W, header_h, fill=1, stroke=0)
    draw_hero_geometry(pdf, 0, PAGE_H - header_h, PAGE_W, header_h)
    primary_rule(pdf, 0, PAGE_H - header_h, PAGE_W, 3.2)

    pdf.setFillColor(WHITE)
    pdf.setFont(BOLD, 27)
    pdf.drawString(40, 783, "FURKAN COSAR")
    pdf.setFillColor(colors.HexColor("#F3F3F5"))
    pdf.setFont(BOLD, 9)
    pdf.drawString(42, 758, "FRONTEND DEVELOPER")

    contact_x = right_x
    pdf.setFillColor(PRIMARY)
    pdf.setFont(BOLD, 7.1)
    pdf.drawString(contact_x, 808, "CONTACT")
    contacts = [
        ("Atasehir, Istanbul", "#FFFFFF"),
        ("furkancosar2005@gmail.com", "#FFFFFF"),
        ("+90 506 139 32 20", "#FFFFFF"),
        ("furkancosar.com", "#FFFFFF"),
    ]
    pdf.setFont(REGULAR, 8.2)
    for index, (value, _) in enumerate(contacts):
        y = 791 - index * 15
        pdf.setFillColor(colors.HexColor("#D8D8DE"))
        pdf.drawString(contact_x, y, value)
    pdf.linkURL("mailto:furkancosar2005@gmail.com", (contact_x, 772, PAGE_W - 36, 789), relative=0)
    pdf.linkURL("tel:+905061393220", (contact_x, 757, PAGE_W - 36, 774), relative=0)
    pdf.linkURL("https://www.furkancosar.com", (contact_x, 742, PAGE_W - 36, 759), relative=0)

    full_w = PAGE_W - 80
    section_heading(pdf, "Profile", left, 682, full_w)
    profile = (
        "Final-year Web Design and Programming student at Istanbul University and frontend developer. "
        "I build responsive React and Next.js interfaces, using GSAP for interaction and motion. "
        "My recent work includes freelance projects and co-founding a small digital services team."
    )
    paragraph(pdf, profile, left, 658, full_w, size=9, leading=13.2, color=colors.HexColor("#4F4F56"))

    column_top = 603
    section_heading(pdf, "Experience", left, column_top, left_w)

    # Current startup work.
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 9.25)
    pdf.drawString(left, 574, "CO-FOUNDER & FRONTEND DEVELOPER")
    pdf.setFillColor(PRIMARY)
    pdf.setFont(BOLD, 7.5)
    pdf.drawRightString(left + left_w, 574, "2025 - PRESENT")
    pdf.setFillColor(MUTED)
    pdf.setFont(BOLD, 8.1)
    pdf.drawString(left, 559, "Appivar A.S.")
    y = paragraph(
        pdf,
        "Co-founded a small digital services team. Build responsive websites and app interfaces, and contribute to mobile work, lightweight PHP tools, SEO and digital campaigns.",
        left, 542, left_w, size=8.25, leading=11.5,
    )

    # Independent work.
    role_y = y - 15
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 9.25)
    pdf.drawString(left, role_y, "FREELANCE FRONTEND DEVELOPER")
    pdf.setFillColor(PRIMARY)
    pdf.setFont(BOLD, 7.5)
    pdf.drawRightString(left + left_w, role_y, "2024 - PRESENT")
    pdf.setFillColor(MUTED)
    pdf.setFont(BOLD, 8.1)
    pdf.drawString(left, role_y - 15, "Independent Projects")
    y = paragraph(
        pdf,
        "Build responsive websites and interfaces for independent and client work, from reusable React components and motion to cross-device polish.",
        left, role_y - 32, left_w, size=8.25, leading=11.5,
    )

    # Relevant early experience, described without inventing employers or dates.
    early_y = y - 20
    section_heading(pdf, "Earlier experience", left, early_y, left_w)
    y = paragraph(
        pdf,
        "Software-related summer internships in high school introduced me to office routines and development teams. I practiced with HTML, CSS and JavaScript, then began exploring React Native and mobile apps.",
        left, early_y - 24, left_w, size=8.25, leading=11.5,
    )

    selected_y = y - 20
    section_heading(pdf, "Selected work", left, selected_y, left_w)
    y = paragraph(
        pdf,
        "Portfolio: a bilingual Next.js site with responsive project pages, GSAP scroll interactions and page transitions. Personal projects also cover storefronts, dashboards, booking flows and games.",
        left, selected_y - 24, left_w, size=8.25, leading=11.5,
    )

    # Skills column.
    section_heading(pdf, "Skills", right_x, column_top, right_w)
    groups = [
        ("Frontend", "HTML, CSS, JavaScript, React, Next.js, Tailwind CSS."),
        ("Motion", "GSAP and ScrollTrigger for interface animation."),
        ("Workflow", "Git, GitHub, REST APIs, Swagger and sprint-based collaboration."),
        ("Additional", "React Native, PHP and backend fundamentals, SEO."),
    ]
    y = 574
    for label, value in groups:
        small_label(pdf, label, right_x, y)
        y = paragraph(pdf, value, right_x, y - 14, right_w, size=7.8, leading=10.7)
        y -= 13

    education_y = y - 1
    section_heading(pdf, "Education", right_x, education_y, right_w)
    edu_top = education_y - 25
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 8.2)
    pdf.drawString(right_x, edu_top, "Istanbul University")
    paragraph(pdf, "Web Design and Programming", right_x, edu_top - 14, right_w, size=7.8, leading=10, color=MUTED)
    pdf.setFillColor(PRIMARY)
    pdf.setFont(BOLD, 7.3)
    pdf.drawString(right_x, edu_top - 38, "2023 - PRESENT")

    academy_y = edu_top - 64
    pdf.setFillColor(INK)
    pdf.setFont(BOLD, 8.2)
    pdf.drawString(right_x, academy_y, "Acunmedya Akademi")
    paragraph(pdf, "One-year Frontend Program", right_x, academy_y - 14, right_w, size=7.8, leading=10, color=MUTED)
    paragraph(pdf, "Nisantasi University | 2024", right_x, academy_y - 38, right_w, size=7.3, leading=9.5, color=PRIMARY, font=BOLD)

    teamwork_y = academy_y - 67
    section_heading(pdf, "Team practice", right_x, teamwork_y, right_w)
    paragraph(
        pdf,
        "Final training project with backend students: Swagger documentation, daily check-ins, sprints and version control.",
        right_x, teamwork_y - 24, right_w, size=7.8, leading=10.7,
    )

    # Quiet footer, with no page count or decorative filler.
    footer_y = 29
    pdf.setStrokeColor(PALE)
    pdf.setLineWidth(0.6)
    pdf.line(40, footer_y + 12, PAGE_W - 40, footer_y + 12)
    pdf.setFillColor(FAINT)
    pdf.setFont(BOLD, 6.8)
    pdf.drawString(40, footer_y, "FURKANCOSAR.COM")
    pdf.drawRightString(PAGE_W - 40, footer_y, "FRONTEND DEVELOPMENT")
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/pdf/furkan-cosar-cv.pdf")
    draw_cv(output)
    print(output.resolve())
