import { IconSearch, IconShoppingCart, IconInfoSquareRounded, IconHistory } from "@tabler/icons-react";

const items = [
  { label: "さがす", icon: IconSearch, href: "/" },
  { label: "カート", icon: IconShoppingCart, href: "/cart" },
  { label: "履歴", icon: IconHistory, href: "/history" },
  { label: "情報", icon: IconInfoSquareRounded, href: "/info" },
];

function availableColor(pathname: string, href: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isAvailable =
    href === "/" ? normalizedPath === href || ["items", "stores"].includes(pathname) : normalizedPath.startsWith(href);

  return isAvailable ? "primary.main" : null;
}

interface BottomMenuProps {
  path: string;
}

export function FooterMenu({ path }: BottomMenuProps) {
  return (
    <div
      style={{
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      <div >
        <div >
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <a
                key={index}

                href={item.href}
                style={{
                  borderRight: (index + 1) % items.length === 0 ? 0 : 1,
                  borderColor: "divider",
                  transition: "background-color 0.3s",
                  color: availableColor(path, item.href) ?? "inherit",
                }}
              >
                {

                  <IconComponent
                    style={{
                      stroke: availableColor(path, item.href) ?? "#000",
                    }}
                  />
                }
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}