import { useSearchParams } from 'react-router-dom';
import FriendList from '../../components/features/FriendList';
import FriendRequests from '../../components/features/FriendRequests';
import FriendSearch from '../../components/features/FriendSearch';
import { useFriendRequestCount } from '../../hooks/useFriendRequestCount';
import type { FriendsTab } from '../../types/friend';

interface TabOption {
  key: FriendsTab;
  label: string;
}

const TABS: TabOption[] = [
  { key: 'search', label: 'Search' },
  { key: 'requests', label: 'Requests' },
  { key: 'friends', label: 'My Friends' },
];

export default function FriendsPage() {
  const [params, setParams] = useSearchParams();
  const requestCount = useFriendRequestCount();

  // The active tab comes from the URL so a link can open the Requests tab directly.
  const activeIndex: number = Math.max(0, TABS.findIndex((tab) => tab.key === params.get('tab')));
  const activeTab: FriendsTab = TABS[activeIndex].key;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-nu-blue">Friends</h1>

      <div role="tablist" aria-label="Friends sections" className="relative grid grid-cols-3 rounded-xl bg-gray-200 p-1">
        {/* One pill slides under the tabs so switching glides instead of cutting. */}
        <span
          aria-hidden="true"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-nu-blue shadow transition-transform duration-300 ease-out motion-reduce:transition-none"
        />
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setParams({ tab: tab.key }, { replace: true })}
              className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold transition-colors duration-300 motion-reduce:transition-none ${
                isActive ? 'text-white' : 'text-gray-600 hover:text-nu-blue'
              }`}
            >
              {tab.label}
              {tab.key === 'requests' && requestCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{requestCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {activeTab === 'search' && <FriendSearch />}
        {activeTab === 'requests' && <FriendRequests />}
        {activeTab === 'friends' && <FriendList />}
      </div>
    </div>
  );
}
