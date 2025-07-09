import React from "react";

const TabKinds = ["tweets", "media", "likes", "characters"] as const;
export type TabType = (typeof TabKinds)[number];

const TabNames: Record<TabType, string> = {
  tweets: "ポスト",
  media: "メディア",
  likes: "いいね",
  characters: "キャラクター",
};

interface TabsComponentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabsComponent = ({ activeTab, onTabChange }: TabsComponentProps) => {
  const tabs = TabKinds
    // キャラクタータブは常に表示
    .map((tab) => ({
      id: tab,
      label: TabNames[tab],
    }));

  return (
    <div className="border-b border-border">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`py-2 w-full ${
              activeTab === tab.id
                ? "border-b-2 border-interactive font-bold text-text"
                : "text-text-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export { TabNames };
export default TabsComponent;
