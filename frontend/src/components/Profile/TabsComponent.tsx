import React from "react";

const TabKinds = ["tweets", "media", "likes"] as const;
export type TabType = (typeof TabKinds)[number];

const TabNames: Record<TabType, string> = {
  tweets: "ポスト",
  media: "メディア",
  likes: "いいね",
};

interface TabsComponentProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabsComponent = ({ activeTab, onTabChange }: TabsComponentProps) => {
  const tabs = TabKinds.map((tab) => ({
    id: tab,
    label: TabNames[tab],
  }));

  return (
    <div className="border-b border-gray-300">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`py-2 w-full ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export { TabKinds, TabNames };
export default TabsComponent;
