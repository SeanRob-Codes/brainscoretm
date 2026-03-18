import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/store/gameStore';
import {
  Users, Share2, Copy, Check, MessageSquare, Trophy, Flame,
  Search, UserPlus, UserCheck, Heart, MessageCircle, Send, X, Clock, Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  brain_score: number | null;
  peak_score: number | null;
  login_streak: number | null;
  selected_outfit: string | null;
  last_active_at: string | null;
  is_plus: boolean | null;
}

interface Comment {
  id: string;
  author_id: string;
  target_user_id: string;
  comment: string;
  created_at: string;
  author?: UserProfile;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

type SocialTab = 'feed' | 'search' | 'friends' | 'share';

export function SocialPage() {
  const { brainScore, peakScore, brainLevel, gauntletHighScore } = useGameStore();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [socialTab, setSocialTab] = useState<SocialTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({});
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userComments, setUserComments] = useState<Comment[]>([]);

  const shareUrl = 'https://brainscoretm.lovable.app';
  const shareText = `🧠 BrainScore™ Report Card\n\n📊 Current Score: ${brainScore}\n🏔️ Peak Score: ${peakScore}\n🎯 Level: ${brainLevel}\n⚔️ Gauntlet High: ${gauntletHighScore}\n\nThink you can beat me? Train your brain:\n${shareUrl}`;

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFollowing();
      loadFeedComments();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    
    if (data) {
      const accepted = data.filter(f => f.status === 'accepted');
      const pending = data.filter(f => f.status === 'pending' && f.addressee_id === user.id);
      setFriends(accepted);
      setPendingRequests(pending);

      // Load friend profiles
      const friendIds = accepted.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id);
      const pendingIds = pending.map(f => f.requester_id);
      const allIds = [...new Set([...friendIds, ...pendingIds])];
      
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('*')
          .in('user_id', allIds);
        if (profiles) {
          const map: Record<string, UserProfile> = {};
          profiles.forEach(p => { map[p.user_id!] = p as UserProfile; });
          setFriendProfiles(map);
        }
      }
    }
  };

  const loadFollowing = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    if (data) setFollowing(data.map(f => f.following_id));
  };

  const loadFeedComments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('score_comments')
      .select('*')
      .eq('target_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      // Load author profiles
      const authorIds = [...new Set(data.map(c => c.author_id))];
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('*')
          .in('user_id', authorIds);
        const profileMap: Record<string, UserProfile> = {};
        profiles?.forEach(p => { profileMap[p.user_id!] = p as UserProfile; });
        setComments(data.map(c => ({ ...c, author: profileMap[c.author_id] })));
      } else {
        setComments(data);
      }
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from('public_profiles')
      .select('*')
      .ilike('username', `%${searchQuery.trim()}%`)
      .limit(20);
    setSearchResults((data as UserProfile[]) || []);
    setSearching(false);
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!user) return;
    await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetId,
    });
    loadFriends();
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    loadFriends();
  };

  const declineFriendRequest = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'declined' }).eq('id', friendshipId);
    loadFriends();
  };

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
    if (following.includes(targetId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      setFollowing(f => f.filter(id => id !== targetId));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      setFollowing(f => [...f, targetId]);
    }
  };

  const postComment = async (targetUserId: string) => {
    if (!user || !commentText.trim()) return;
    await supabase.from('score_comments').insert({
      author_id: user.id,
      target_user_id: targetUserId,
      comment: commentText.trim(),
    });
    setCommentText('');
    if (selectedUser) loadUserComments(targetUserId);
    loadFeedComments();
  };

  const loadUserComments = async (targetUserId: string) => {
    const { data } = await supabase
      .from('score_comments')
      .select('*')
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      const authorIds = [...new Set(data.map(c => c.author_id))];
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase.from('public_profiles').select('*').in('user_id', authorIds);
        const profileMap: Record<string, UserProfile> = {};
        profiles?.forEach(p => { profileMap[p.user_id!] = p as UserProfile; });
        setUserComments(data.map(c => ({ ...c, author: profileMap[c.author_id] })));
      } else {
        setUserComments(data);
      }
    }
  };

  const openUserProfile = (profile: UserProfile) => {
    setSelectedUser(profile);
    loadUserComments(profile.user_id);
  };

  const isFriend = (userId: string) => {
    return friends.some(f => 
      (f.requester_id === userId || f.addressee_id === userId) && f.status === 'accepted'
    );
  };

  const hasPendingRequest = (userId: string) => {
    return pendingRequests.some(f => f.requester_id === userId) ||
      friends.some(f => f.requester_id === user?.id && f.addressee_id === userId && f.status === 'pending');
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'BrainScore™', text: shareText, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`🧠 My BrainScore is ${brainScore} — ${brainLevel}! Peak: ${peakScore} 🏔️\n\nCan you beat me? ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const getTimeAgo = (date: string | null) => {
    if (!date) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  // User profile modal
  if (selectedUser) {
    return (
      <div className="space-y-4 animate-slide-up">
        <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          ← Back to Social
        </button>

        <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-card to-accent/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold tracking-wider">{selectedUser.display_name || selectedUser.username || 'Anonymous'}</h2>
              <p className="text-xs text-muted-foreground">@{selectedUser.username || 'unknown'}</p>
            </div>
            {selectedUser.is_plus && (
              <span className="gradient-accent rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">Plus</span>
            )}
          </div>

          <div className="flex gap-4 text-center">
            <div><div className="font-display text-xl font-bold text-accent">{selectedUser.brain_score ?? 0}</div><div className="text-[10px] text-muted-foreground">Score</div></div>
            <div><div className="font-display text-xl font-bold text-foreground">{selectedUser.peak_score ?? 0}</div><div className="text-[10px] text-muted-foreground">Peak</div></div>
            <div><div className="font-display text-xl font-bold text-warning">{selectedUser.login_streak ?? 0}</div><div className="text-[10px] text-muted-foreground">Streak</div></div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" /> Active {getTimeAgo(selectedUser.last_active_at)}
          </div>

          <div className="flex gap-2">
            {selectedUser.user_id !== user?.id && (
              <>
                {isFriend(selectedUser.user_id) ? (
                  <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11px] font-semibold text-success">
                    <UserCheck className="h-3 w-3" /> Friends
                  </span>
                ) : hasPendingRequest(selectedUser.user_id) ? (
                  <span className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground">Pending</span>
                ) : (
                  <button onClick={() => sendFriendRequest(selectedUser.user_id)} className="flex items-center gap-1 gradient-accent rounded-full px-3 py-1.5 text-[11px] font-bold text-accent-foreground">
                    <UserPlus className="h-3 w-3" /> Add Friend
                  </button>
                )}
                <button
                  onClick={() => toggleFollow(selectedUser.user_id)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    following.includes(selectedUser.user_id) ? 'border-accent/30 text-accent' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`h-3 w-3 ${following.includes(selectedUser.user_id) ? 'fill-accent' : ''}`} />
                  {following.includes(selectedUser.user_id) ? 'Following' : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comments on this user's score */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-display text-xs font-bold tracking-wider flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-accent" /> Comments
          </h3>

          {selectedUser.user_id !== user?.id && (
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Comment on their score..."
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && postComment(selectedUser.user_id)}
              />
              <button onClick={() => postComment(selectedUser.user_id)} className="gradient-accent rounded-xl px-3 py-2">
                <Send className="h-4 w-4 text-accent-foreground" />
              </button>
            </div>
          )}

          {userComments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userComments.map(c => (
                <div key={c.id} className="rounded-lg border border-border bg-secondary p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">{c.author?.display_name || c.author?.username || 'Anonymous'}</span>
                    <span className="text-[9px] text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Social
      </div>

      {/* Social Sub-tabs */}
      <div className="flex gap-1.5">
        {([['feed', 'Feed'], ['search', 'Find'], ['friends', 'Friends'], ['share', 'Share']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSocialTab(id)}
            className={`flex-1 rounded-xl border py-2 text-[11px] font-bold uppercase tracking-wider transition-all
              ${socialTab === id ? 'gradient-accent border-accent text-accent-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pending friend requests */}
      {pendingRequests.length > 0 && (socialTab === 'feed' || socialTab === 'friends') && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 space-y-2">
          <h3 className="font-display text-[11px] font-bold tracking-wider flex items-center gap-1 text-warning">
            <UserPlus className="h-3.5 w-3.5" /> Friend Requests ({pendingRequests.length})
          </h3>
          {pendingRequests.map(req => {
            const profile = friendProfiles[req.requester_id];
            return (
              <div key={req.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <div className="flex-1">
                  <span className="text-xs font-bold">{profile?.display_name || profile?.username || 'Unknown'}</span>
                  <span className="block text-[10px] text-muted-foreground">@{profile?.username || '???'}</span>
                </div>
                <button onClick={() => acceptFriendRequest(req.id)} className="gradient-accent rounded-lg px-2.5 py-1 text-[10px] font-bold text-accent-foreground">Accept</button>
                <button onClick={() => declineFriendRequest(req.id)} className="rounded-lg border border-border px-2.5 py-1 text-[10px] text-muted-foreground">Decline</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Feed Tab */}
      {socialTab === 'feed' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display text-xs font-bold tracking-wider flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" /> Comments on Your Score
            </h3>
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No comments yet. Share your profile so friends can comment!</p>
            ) : (
              <div className="space-y-2">
                {comments.map(c => (
                  <div key={c.id} className="rounded-lg border border-border bg-secondary p-3">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={() => c.author && openUserProfile(c.author)}
                        className="text-[11px] font-bold text-accent hover:underline"
                      >
                        {c.author?.display_name || c.author?.username || 'Anonymous'}
                      </button>
                      <span className="text-[9px] text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {socialTab === 'search' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && searchUsers()}
            />
            <button onClick={searchUsers} disabled={searching} className="gradient-accent rounded-xl px-4 py-3">
              <Search className="h-4 w-4 text-accent-foreground" />
            </button>
          </div>

          {searching && (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}

          <div className="space-y-2">
            {searchResults.map(profile => (
              <button
                key={profile.user_id}
                onClick={() => openUserProfile(profile)}
                className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-accent/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent font-display text-[10px] font-bold text-accent-foreground">
                    {(profile.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-xs font-bold tracking-wider truncate">{profile.display_name || profile.username || 'Anonymous'}</span>
                      {profile.is_plus && <span className="gradient-accent rounded px-1 py-0.5 text-[8px] font-bold text-accent-foreground">+</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">@{profile.username || 'unknown'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-sm font-bold text-accent">{profile.brain_score ?? 0}</div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" /> {getTimeAgo(profile.last_active_at)}
                    </div>
                  </div>
                </div>
                {(profile.login_streak ?? 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-warning">
                    <Flame className="h-3 w-3" /> {profile.login_streak} day streak
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {socialTab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No friends yet!</p>
              <p className="text-xs text-muted-foreground mt-1">Search for users to add friends.</p>
            </div>
          ) : (
            friends.map(f => {
              const friendId = f.requester_id === user?.id ? f.addressee_id : f.requester_id;
              const profile = friendProfiles[friendId];
              if (!profile) return null;
              return (
                <button
                  key={f.id}
                  onClick={() => openUserProfile(profile)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent font-display text-[10px] font-bold text-accent-foreground">
                      {(profile.username || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-display text-xs font-bold tracking-wider truncate block">{profile.display_name || profile.username}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {getTimeAgo(profile.last_active_at)}</span>
                        {(profile.login_streak ?? 0) > 0 && <span className="flex items-center gap-0.5 text-warning"><Flame className="h-2.5 w-2.5" /> {profile.login_streak}d</span>}
                      </div>
                    </div>
                    <div className="font-display text-sm font-bold text-accent">{profile.brain_score ?? 0}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Share Tab */}
      {socialTab === 'share' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-card to-accent/5 p-5 space-y-4">
            <div className="text-center space-y-2">
              <div className="font-display text-4xl font-bold text-accent">{brainScore}</div>
              <div className="font-display text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">{brainLevel}</div>
              <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-warning" /> Peak: {peakScore}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-destructive" /> Gauntlet: {gauntletHighScore}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={share} className="flex-1 gradient-accent rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all flex items-center justify-center gap-1.5">
                {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Share2 className="h-3.5 w-3.5" /> Share Score</>}
              </button>
              <button onClick={shareTwitter} className="rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all">
                𝕏
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="font-display text-xs font-bold tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" /> Challenge Messages
            </h3>
            <p className="text-[11px] text-muted-foreground">Tap to copy:</p>
            {[
              `🧠 I just scored ${brainScore} on BrainScore™. Think you can beat that? ${shareUrl}`,
              `⚡ My reaction time is insane. Challenge me on BrainScore™! ${shareUrl}`,
              `🏆 I'm a ${brainLevel} — what's YOUR brain level? Find out: ${shareUrl}`,
            ].map((msg, i) => (
              <button
                key={i}
                onClick={() => { navigator.clipboard.writeText(msg); }}
                className="w-full text-left rounded-lg border border-border bg-secondary p-3 text-[11px] text-muted-foreground hover:border-accent/30 hover:text-foreground transition-all leading-relaxed"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
