import Link from "next/link";
import { contactItems, navigationItems, socialItems } from "@/data/site";
import { updateTitleFillOrigin } from "@/lib/pointerOrigin";
import { basePath } from "@/lib/localizedRoutes";
import { useLocalizedContent } from "@/lib/localizeContent";
import SocialMediaButtons from "@/components/ui/SocialMediaButtons/SocialMediaButtons";

const ringNames = ["one","two","three","four","five","six","seven","eight","nine"];
const menuLinkClass = "ui-navigation-link gradient-title-button inline-flex w-fit max-w-full text-[44px] leading-[0.9] font-black tracking-[-0.04em] text-black uppercase no-underline md:text-[80px] lg:text-[120px]";

export function ChromeRings({ menu = false }) {
  return (
    <div className={menu ? "menu-footer-backdrop" : "footer-backdrop"} aria-hidden="true">
      {ringNames.map(name => <span key={name} className={`footer-ring footer-ring-${name}${menu ? " menu-ring" : ""}`} />)}
    </div>
  );
}

export function ChromeNavigation({ pathname, variant, onNavigate }) {
  const localize = useLocalizedContent();
  const menu = variant === "menu";
  const motionAttribute = menu ? { "data-menu-nav-item": "" } : { "data-footer-primary": "" };
  return localize(
    <nav aria-label={menu ? "Main menu" : "Footer navigation"} className={menu ? undefined : "ui-footer-nav lg:justify-self-end"}>
      <ul className={`m-0 flex list-none flex-col gap-1 p-0${menu ? "" : " lg:items-end"}`}>
        {navigationItems.map(({ href, label }) => {
          const isActive = basePath(pathname) === href;

          return (
            <li key={href} className="w-fit max-w-full overflow-hidden">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                {...motionAttribute}
                onClick={onNavigate && (event => onNavigate(event, href))}
                onPointerEnter={updateTitleFillOrigin}
                onPointerLeave={updateTitleFillOrigin}
                className={menu ? menuLinkClass : "ui-navigation-link gradient-title-button inline-flex w-fit max-w-full text-[28px] leading-[0.82] font-black tracking-[-0.03em] text-white uppercase no-underline md:text-[30px] lg:text-[32px]"}
              >
                <span className="gradient-title-text">
                  <span className="ui-navigation-label">{label}</span>

                  <span
                    className="ui-navigation-label gradient-text-flow gradient-title-fill"
                    aria-hidden="true"
                  >
                    {label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ChromeContact({ menu = false }) {
  const localize = useLocalizedContent();
  const motionAttribute = menu ? { "data-menu-address-item": "" } : { "data-footer-address-item": "" };
  return localize(
    <address className={`ui-chrome-contact m-0 flex flex-col items-start gap-3 not-italic ${menu ? "text-black" : "text-white lg:flex-row lg:items-center lg:gap-4"}`}>
      {contactItems.flatMap((item, index) => [
          <span key={item.href} className="inline-block overflow-hidden">
            <a
              href={item.href}
              {...motionAttribute}
              className="group relative inline-block w-fit text-current no-underline"
            >
              <span className="ui-chrome-contact-text relative block after:absolute after:bottom-[-0.35rem] after:left-0 after:h-0.5 after:w-full after:bg-current after:[clip-path:inset(0_100%_0_0)] after:opacity-90 after:transition-[clip-path] after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:[clip-path:inset(0_0_0_0)] group-focus-visible:after:[clip-path:inset(0_0_0_0)]">
                {item.label}
              </span>
            </a>
          </span>,
          !menu && index === 0 && (
            <span
              key="separator"
              className="hidden overflow-hidden lg:inline-block"
              aria-hidden="true"
            >
              <span
                data-footer-address-item
                className="ui-chrome-contact-text block text-white/60"
              >
                |
              </span>
            </span>
          )
      ])}
    </address>
  );
}

export function ChromeSocials({ menu = false }) {
  const localize = useLocalizedContent();
  return localize(
    <ul
      className="ui-chrome-socials m-0 flex list-none items-center p-0"
      aria-label="Social links"
    >
      {socialItems.map((item) => (
        <li key={item.name} className="overflow-hidden rounded-full">
          <SocialMediaButtons
            item={item}
            animationAttribute={menu ? "data-menu-social-item" : "data-footer-social-item"}
            className={menu ? "text-black" : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
