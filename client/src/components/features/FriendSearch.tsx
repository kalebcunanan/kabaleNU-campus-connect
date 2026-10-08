import { useState } from 'react';
import FadeIn from '../common/FadeIn';
import Input from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import FriendActionButton from './FriendActionButton';
import FriendUserCard from './FriendUserCard';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { SearchedUser } from '../../types/friend';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;

export default function FriendSearch() {
  const [query, setQuery] = useState<string>('');
  const term = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const canSearch = term.length >= MIN_QUERY_LENGTH;

  const { data, loading, error, refetch } = useAxiosFetch<SearchedUser[]>(
    `/friends/search?q=${encodeURIComponent(term)}`,
  );
  const users = data ?? [];

  const handleChanged = (): void => {
    void refetch();
  };

  const renderResults = () => {
    if (!canSearch) return <p className="py-8 text-center text-gray-500">Type at least 2 letters to search.</p>;
    if (loading) return <p role="status" className="py-8 text-center text-gray-500">Searching...</p>;
    if (error && users.length === 0) return <ErrorState message={error} onRetry={handleChanged} />;
    if (users.length === 0) return <EmptyState message="No students found." hideIcon />;

    return (
      <ul className="space-y-3">
        {users.map((user, index) => (
          <li key={user._id}>
            <FadeIn index={index}>
              <FriendUserCard user={user}>
                <FriendActionButton
                  userId={user._id}
                  status={user.friendStatus}
                  friendshipId={user.friendshipId}
                  onChanged={handleChanged}
                />
              </FriendUserCard>
            </FadeIn>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-4">
      <Input
        label="Find a student"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name"
        autoComplete="off"
      />
      {renderResults()}
    </div>
  );
}
