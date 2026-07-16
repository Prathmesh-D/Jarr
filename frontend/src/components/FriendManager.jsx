import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Plus, Trash2, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import ConfirmDialog from './ui/ConfirmDialog';
import { friendService } from '../services/friendService';

export default function FriendManager() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteFriendId, setDeleteFriendId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchFriends = async () => {
    try {
      const data = await friendService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await friendService.createFriend(data);
      reset();
      fetchFriends();
    } catch (error) {
      console.error('Failed to add friend', error);
      alert(error.response?.data?.message || 'Error adding friend. Does this friend already exist?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFriendId) return;
    try {
      await friendService.deleteFriend(deleteFriendId);
      fetchFriends();
    } catch (error) {
      console.error('Failed to delete friend', error);
    } finally {
      setDeleteFriendId(null);
    }
  };

  return (
    <div className="bg-j-surface border border-j-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-j-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-j-accent/10 flex items-center justify-center text-j-accent">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-j-ink">Friends List</h2>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-4">
          <div className="flex-1">
            <Input
              placeholder="Add a new friend..."
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-5 whitespace-nowrap">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span className="ml-2 hidden sm:inline">Add Friend</span>
          </Button>
        </form>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-j-ink-4">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8 text-j-ink-4 bg-j-surface-raised rounded-lg border border-dashed border-j-border">
              No friends added yet. Type a name above!
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-j-surface border border-j-border rounded-lg shadow-sm group">
                  <div>
                    <h3 className="font-semibold text-j-ink">{friend.name}</h3>
                    <p className="text-xs text-j-ink-4 mt-1">Added {new Date(friend.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setDeleteFriendId(friend.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-j-ink-4 hover:text-j-negative hover:bg-j-negative/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Friend"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={!!deleteFriendId}
        onClose={() => setDeleteFriendId(null)}
        onConfirm={handleDelete}
        title="Remove Friend"
        message="Are you sure you want to remove this friend? Their past debts will not be deleted, but they will be removed from your autocomplete list."
        confirmText="Remove"
        icon="trash"
      />
    </div>
  );
}
