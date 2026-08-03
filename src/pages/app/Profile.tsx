import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteComment, getMyComments, type Comment } from "../../api/comments";
import {
  deletePost,
  getMyRetweets,
  getUserTweets,
  type Post,
} from "../../api/posts";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  type CurrentUser,
  unfollowUser,
} from "../../api/user";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import { DeletePostModal } from "../../components/posts/DeletePostModal";
import { ProfilePostCard } from "../../components/posts/ProfilePostCard";
import { CommentItem } from "../../components/comments/CommentItem";
import { DeleteCommentModal } from "../../components/comments/DeleteCommentModal";

const PAGE_SIZE = 10;
type ProfileTab = "posts" | "retweets" | "comments";

export const SelfProfile = () => {
  const { name = "" } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CurrentUser | null>(null);
  const [viewer, setViewer] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [retweetedPosts, setRetweetedPosts] = useState<Post[]>([]);
  const [hasMoreRetweets, setHasMoreRetweets] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMoreRetweets, setLoadingMoreRetweets] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [error, setError] = useState("");
  const [retweetsError, setRetweetsError] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [editing, setEditing] = useState(false);
  const [followedByMe, setFollowedByMe] = useState(false);
  const [changingFollow, setChangingFollow] = useState(false);
  const [followError, setFollowError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteCommentTarget, setDeleteCommentTarget] =
    useState<Comment | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [deleteCommentError, setDeleteCommentError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      setCommentsError("");
      setRetweetsError("");
      try {
        const decodedName = decodeURIComponent(name);
        const [foundProfile, current, page] = await Promise.all([
          getUserProfile(decodedName),
          getCurrentUser(),
          getUserTweets(decodedName, PAGE_SIZE, 0),
        ]);
        if (active) {
          setProfile(foundProfile);
          setFollowedByMe(foundProfile.followed_by_me);
          setViewer(current);
          setPosts(page.tweets);
          setHasMore(page.has_more);
          setActiveTab("posts");
          setComments([]);
          setHasMoreComments(false);
          setRetweetedPosts([]);
          setHasMoreRetweets(false);
        }
        if (current.id === foundProfile.id) {
          try {
            const commentsPage = await getMyComments(PAGE_SIZE, 0);
            if (active) {
              setComments(commentsPage.comments);
              setHasMoreComments(commentsPage.has_more);
            }
          } catch (reason) {
            if (active) {
              setCommentsError(
                reason instanceof Error
                  ? reason.message
                  : "コメント一覧を取得できませんでした",
              );
            }
          }
          try {
            const retweetsPage = await getMyRetweets(PAGE_SIZE, 0);
            if (active) {
              setRetweetedPosts(retweetsPage.posts);
              setHasMoreRetweets(retweetsPage.has_more);
            }
          } catch (reason) {
            if (active) {
              setRetweetsError(
                reason instanceof Error
                  ? reason.message
                  : "リツイート一覧を取得できませんでした",
              );
            }
          }
        }
      } catch (reason) {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "プロフィールを読み込めませんでした",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [name]);

  const loadMore = async () => {
    if (!profile || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getUserTweets(profile.name, PAGE_SIZE, posts.length);
      setPosts((current) => [...current, ...page.tweets]);
      setHasMore(page.has_more);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "投稿を取得できませんでした",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePost(deleteTarget.id);
      setPosts((current) =>
        current.filter((post) => post.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "投稿を削除できませんでした",
      );
    } finally {
      setDeleting(false);
    }
  };

  const loadMoreComments = async () => {
    if (loadingMoreComments) return;
    setLoadingMoreComments(true);
    setCommentsError("");
    try {
      const page = await getMyComments(PAGE_SIZE, comments.length);
      setComments((current) => [...current, ...page.comments]);
      setHasMoreComments(page.has_more);
    } catch (reason) {
      setCommentsError(
        reason instanceof Error
          ? reason.message
          : "コメント一覧を取得できませんでした",
      );
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const loadMoreRetweets = async () => {
    if (loadingMoreRetweets) return;
    setLoadingMoreRetweets(true);
    setRetweetsError("");
    try {
      const page = await getMyRetweets(PAGE_SIZE, retweetedPosts.length);
      setRetweetedPosts((current) => [...current, ...page.posts]);
      setHasMoreRetweets(page.has_more);
    } catch (reason) {
      setRetweetsError(
        reason instanceof Error
          ? reason.message
          : "リツイート一覧を取得できませんでした",
      );
    } finally {
      setLoadingMoreRetweets(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentTarget || deletingComment) return;
    setDeletingComment(true);
    setDeleteCommentError("");
    try {
      await deleteComment(deleteCommentTarget.id);
      setComments((current) =>
        current.filter((comment) => comment.id !== deleteCommentTarget.id),
      );
      setDeleteCommentTarget(null);
    } catch (reason) {
      setDeleteCommentError(
        reason instanceof Error
          ? reason.message
          : "コメントを削除できませんでした",
      );
    } finally {
      setDeletingComment(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!profile || changingFollow) return;
    setChangingFollow(true);
    setFollowError("");
    try {
      const response = followedByMe
        ? await unfollowUser(profile.name)
        : await followUser(profile.name);
      setFollowedByMe(response.followed_by_me);
    } catch (reason) {
      setFollowError(
        reason instanceof Error
          ? reason.message
          : "フォロー状態を変更できませんでした",
      );
    } finally {
      setChangingFollow(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white">
        読み込み中...
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-dvh bg-black p-8 text-center text-red-400">
        {error || "ユーザーが見つかりません"}
      </div>
    );
  const isMe = viewer?.id === profile.id;

  return (
    <div className="min-h-dvh bg-black text-white">
      <main className="mx-auto min-h-dvh max-w-[600px] border-x border-slate-800">
        <header className="sticky top-0 z-10 flex items-center gap-7 bg-black/85 px-4 py-2 backdrop-blur">
          <button
            onClick={() => navigate(-1)}
            aria-label="戻る"
            className="rounded-full p-2 text-xl hover:bg-slate-900"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-xs text-slate-500">{posts.length}件のポスト</p>
          </div>
        </header>
        <div className="h-48 bg-slate-700" />
        <section className="px-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="-mt-16 flex size-32 items-center justify-center rounded-full border-4 border-black bg-slate-600 text-5xl font-bold">
              {profile.name.slice(0, 1)}
            </div>
            {isMe && (
              <button
                onClick={() => setEditing(true)}
                className="mt-3 rounded-full border border-slate-600 px-5 py-2 font-bold hover:bg-slate-900"
              >
                プロフィールを編集
              </button>
            )}
            {!isMe && (
              <button
                type="button"
                disabled={changingFollow}
                onClick={handleToggleFollow}
                className={`mt-3 rounded-full px-5 py-2 font-bold disabled:opacity-50 ${
                  followedByMe
                    ? "border border-slate-600 bg-black text-white hover:border-red-500 hover:text-red-500"
                    : "bg-white text-black hover:bg-slate-200"
                }`}
              >
                {changingFollow
                  ? "処理中..."
                  : followedByMe
                    ? "フォロー中"
                    : "フォロー"}
              </button>
            )}
          </div>
          {followError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {followError}
            </p>
          )}
          <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
          <p className="text-slate-500">@{profile.name}</p>
          {profile.bio && (
            <p className="mt-4 whitespace-pre-wrap">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            {profile.location && <span>⌖ {profile.location}</span>}
            {profile.website && (
              <a
                href={
                  profile.website.startsWith("http")
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 hover:underline"
              >
                🔗 {profile.website}
              </a>
            )}
            <span>
              📅{" "}
              {new Intl.DateTimeFormat("ja-JP", {
                year: "numeric",
                month: "long",
              }).format(new Date(profile.created_at))}
              から利用しています
            </span>
          </div>
        </section>
        <div
          className={`grid border-b border-slate-800 text-center ${isMe ? "grid-cols-3" : "grid-cols-1"}`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`py-4 font-bold hover:bg-slate-900 ${activeTab === "posts" ? "border-b-4 border-sky-500" : "text-slate-500"}`}
          >
            ポスト
          </button>
          {isMe && (
            <button
              type="button"
              onClick={() => setActiveTab("retweets")}
              className={`py-4 font-bold hover:bg-slate-900 ${activeTab === "retweets" ? "border-b-4 border-sky-500" : "text-slate-500"}`}
            >
              リツイート
            </button>
          )}
          {isMe && (
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`py-4 font-bold hover:bg-slate-900 ${activeTab === "comments" ? "border-b-4 border-sky-500" : "text-slate-500"}`}
            >
              コメント
            </button>
          )}
        </div>
        {activeTab === "posts" && error && (
          <p
            role="alert"
            className="border-b border-slate-800 p-4 text-center text-sm text-red-400"
          >
            {error}
          </p>
        )}
        {activeTab === "posts" && posts.length === 0 && !error && (
          <p className="p-10 text-center text-slate-500">
            まだ投稿がありません
          </p>
        )}
        {activeTab === "posts" && (
          <div className="divide-y divide-slate-800">
          {posts.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
              canDelete={viewer?.id === post.user_id}
              onOpen={(postID) => navigate(`/post/${postID}/detail`)}
              onRequestDelete={(target) => {
                setDeleteError("");
                setDeleteTarget(target);
              }}
            />
          ))}
          </div>
        )}
        {activeTab === "posts" && hasMore && (
          <div className="p-5 text-center">
            <button
              disabled={loadingMore}
              onClick={loadMore}
              className="text-sky-500 disabled:opacity-50"
            >
              {loadingMore ? "読み込み中..." : "さらに表示"}
            </button>
          </div>
        )}
        {activeTab === "retweets" && retweetsError && (
          <p
            role="alert"
            className="border-b border-slate-800 p-4 text-center text-sm text-red-400"
          >
            {retweetsError}
          </p>
        )}
        {activeTab === "retweets" &&
          retweetedPosts.length === 0 &&
          !retweetsError && (
            <p className="p-10 text-center text-slate-500">
              まだリツイートがありません
            </p>
          )}
        {activeTab === "retweets" && (
          <div className="divide-y divide-slate-800">
            {retweetedPosts.map((post) => (
              <ProfilePostCard
                key={post.id}
                post={post}
                canDelete={viewer?.id === post.user_id}
                onOpen={(postID) => navigate(`/post/${postID}/detail`)}
                onRequestDelete={(target) => {
                  setDeleteError("");
                  setDeleteTarget(target);
                }}
              />
            ))}
          </div>
        )}
        {activeTab === "retweets" && hasMoreRetweets && (
          <div className="p-5 text-center">
            <button
              disabled={loadingMoreRetweets}
              onClick={loadMoreRetweets}
              className="text-sky-500 disabled:opacity-50"
            >
              {loadingMoreRetweets ? "読み込み中..." : "さらに表示"}
            </button>
          </div>
        )}
        {activeTab === "comments" && commentsError && (
          <p
            role="alert"
            className="border-b border-slate-800 p-4 text-center text-sm text-red-400"
          >
            {commentsError}
          </p>
        )}
        {activeTab === "comments" &&
          comments.length === 0 &&
          !commentsError && (
            <p className="p-10 text-center text-slate-500">
              まだコメントがありません
            </p>
          )}
        {activeTab === "comments" &&
          comments.map((comment) => (
            <div
              key={comment.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/post/${comment.post_id}/detail`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(`/post/${comment.post_id}/detail`);
                }
              }}
              className="cursor-pointer hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <CommentItem
                comment={comment}
                canDelete
                onDelete={(target) => {
                  setDeleteCommentError("");
                  setDeleteCommentTarget(target);
                }}
              />
            </div>
          ))}
        {activeTab === "comments" && hasMoreComments && (
          <div className="p-5 text-center">
            <button
              disabled={loadingMoreComments}
              onClick={loadMoreComments}
              className="text-sky-500 disabled:opacity-50"
            >
              {loadingMoreComments ? "読み込み中..." : "さらに表示"}
            </button>
          </div>
        )}
      </main>
      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setProfile(updated);
            setViewer(updated);
            setEditing(false);
            navigate(`/user/${encodeURIComponent(updated.name)}`, {
              replace: true,
            });
          }}
        />
      )}
      {deleteTarget && (
        <DeletePostModal
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {deleteCommentTarget && (
        <DeleteCommentModal
          deleting={deletingComment}
          error={deleteCommentError}
          onConfirm={handleDeleteComment}
          onClose={() => setDeleteCommentTarget(null)}
        />
      )}
    </div>
  );
};
