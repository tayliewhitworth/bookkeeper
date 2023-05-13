import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";

export const FollowBtn = (props: { id: string }) => {
  const { user } = useUser();
  const { data, isLoading } = api.profile.getProfileWithFollowers.useQuery({
    id: props.id,
  });

  const ctx = api.useContext();

  const toggleLike = api.profile.toggleFollow.useMutation({
    onSuccess: () => {
      void ctx.profile.getProfileWithFollowers.invalidate();
    },
    onError: () => {
      toast.error("Unable to follow, try again later!");
    },
  });

  const handleToggleFollow = () => {
    toggleLike.mutate({ profileId: props.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-1">
          <button
            title="Follow"
            className="rounded bg-slate-200 px-2 py-1 text-sm text-violet-500 transition-colors hover:bg-violet-300"
            onClick={handleToggleFollow}
          >
            Follow Reader
          </button>
        </div>
      </div>
    );
  }

  const userHasFollowed = data.followers.some(
    (follow) => follow.userId == user?.id
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-1">
        <button
          className="rounded bg-slate-200 px-2 py-1 text-sm text-violet-500 transition-colors hover:bg-violet-300"
          onClick={handleToggleFollow}
          title={userHasFollowed ? "Unfollow" : "Follow"}
        >
          {userHasFollowed ? "Following" : "Follow Reader"}
        </button>
      </div>
    </div>
  );
};

const FollowerFollowingCount = (props: {
  count: number;
  label: string;
  onClick: () => void;
}) => (
  <div
    className="flex cursor-pointer items-center gap-1"
    onClick={props.onClick}
  >
    <p className="text-xs text-slate-500">{props.count}</p>
    <p className="text-xs text-slate-500">{props.label}</p>
  </div>
);

export const FollowerCount = (props: { profileId: string; userId: string }) => {
  const [showUsernames, setShowUsernames] = useState<
    null | "followers" | "following"
  >(null);
  const followers = api.profile.getProfileWithFollowers.useQuery({
    id: props.profileId,
  });

  const following = api.profile.getUserFollowing.useQuery({
    userId: props.userId,
  });

  const handleClick = (type: "followers" | "following") => {
    setShowUsernames(showUsernames === type ? null : type);
  };

  if (followers.isLoading || following.isLoading) {
    return (
      <div className="flex items-center justify-center gap-3">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <FollowerFollowingCount
        onClick={() => handleClick("followers")}
        count={followers.data ? followers.data.followers.length : 0}
        label="Followers"
      />
      <FollowerFollowingCount
        onClick={() => handleClick("following")}
        count={following.data ? following.data.following.length : 0}
        label="Following"
      />
      {(showUsernames === "following" || showUsernames === "followers") && (
        <div className="fixed z-50 h-screen w-screen bg-black bg-opacity-40">
          <div
            id="readProductDrawer"
            className={`fixed left-0 top-0 z-40 h-screen w-full max-w-xs overflow-y-auto bg-gray-800 p-4 transition-transform ${
              showUsernames === "following" || showUsernames === "followers"
                ? "translate-x-0 ease-out"
                : "-translate-x-full ease-in"
            }`}
            tabIndex={-1}
            aria-labelledby="drawer-label"
            aria-hidden="true"
          >
            <div className="py-4">
              <h4
                id="drawer-label"
                className="mb-1.5 text-xl font-semibold leading-none text-violet-300"
              >
                {showUsernames === "following" ? "Following" : "Followers"}
              </h4>
            </div>
            <button
              onClick={() => setShowUsernames(null)}
              type="button"
              data-drawer-dismiss="readProductDrawer"
              aria-controls="readProductDrawer"
              className="absolute right-2.5 top-2.5 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close menu</span>
            </button>
            <div>
              {showUsernames === "following" ? (
                <>
                  {following.data ? (
                    following.data.profiles.map((profile) => (
                      <div
                        className="flex flex-col items-start gap-3 p-2"
                        key={profile.user.id}
                      >
                        <Link
                          href={`/@${
                            profile.user.username
                              ? profile.user.username
                              : profile.user.name
                          }`}
                          onClick={() => setShowUsernames(null)}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={profile.user.profileImageUrl}
                              alt={profile.user.name}
                              width={48}
                              height={48}
                              className="h-[48px] w-[48px] rounded-full object-cover"
                            />
                            <p className="text-sm text-slate-500">
                              @{profile.user.username}
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-start gap-3 p-2">
                      <p className="text-sm text-slate-500">No Users</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {followers.data ? (
                    followers.data.withUsers.map((follower) => {
                      if (!follower) return null;
                      return (
                        <div
                          key={follower.followedBy.user.id}
                          className="flex flex-col items-start gap-3 p-2"
                        >
                          <Link
                            href={`/@${
                              follower.followedBy.user.username
                                ? follower.followedBy.user.username
                                : follower.followedBy.user.name
                            }`}
                            onClick={() => setShowUsernames(null)}
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={follower.followedBy.user.profileImageUrl}
                                alt={follower.followedBy.user.name}
                                width={48}
                                height={48}
                                className="h-[48px] w-[48px] rounded-full object-cover"
                              />
                              <p className="text-sm text-slate-500">
                                @{follower.followedBy.user.username}
                              </p>
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-start gap-3 p-2">
                      <p className="text-sm text-slate-500">No Users</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
