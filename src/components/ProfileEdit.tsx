import { api } from "~/utils/api";

import { useState } from "react";
import { LoadingSpinner } from "./loading";

import { toast } from "react-hot-toast";

export const UpdateProfile = (props: { userId: string }) => {
  const { data } = api.profile.getProfileByUserId.useQuery({
    userId: props.userId,
  });

  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [bio, setBio] = useState(data?.profile.bio);
  const [tags, setTags] = useState(data?.profile.tags);
  const ctx = api.useContext();

  if (!data || data.profile === null) {
    return <div>No profile to edit</div>;
  }

  const { mutate, isLoading } = api.profile.update.useMutation({
    onSuccess: () => {
      setShowModal(false);
      void ctx.profile.getProfileByUserId.invalidate();
    },
    onError: (err) => {
      const errMsg = err?.data?.zodError?.fieldErrors.content;
      if (errMsg && errMsg[0]) {
        toast.error(errMsg[0]);
      } else {
        toast.error("Unable to update...");
      }
    },
  });

  const updateProfile = () => {
    mutate({
      id: data.profile.id,
      bio: bio ?? "",
      tags: tags ?? "",
    });
  };

  return (
    <div>
      <div className="flex justify-center">
        <button
          id="updateProductButton"
          data-modal-toggle="updateProductModal"
          className="rounded bg-violet-500 p-1 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-400"
          type="button"
          title="Edit Profile"
          onClick={() => setShowModal(true)}
        >
          Edit Profile
        </button>
      </div>

      <div
        id="updateProductModal"
        tabIndex={-1}
        aria-hidden="true"
        className={`h-modal fixed left-0 right-0 top-0 z-50 h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-12 md:inset-0 ${
          showModal ? "flex" : "hidden"
        } bg-black bg-opacity-60`}
      >
        <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
          <div className="relative rounded-lg bg-gray-800 p-4 shadow-lg sm:p-5">
            <div className="mb-4 flex items-center justify-between rounded-t border-b border-gray-600 pb-4 sm:mb-5">
              <h3 className="text-lg font-semibold text-white">
                Edit Profile Bio
              </h3>
              <button
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm hover:bg-gray-600 hover:text-white"
                data-modal-toggle="updateProductModal"
                onClick={() => setShowModal(false)}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <form>
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-start">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Favorite Genres
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={tags}
                    maxLength={200}
                    onChange={(e) => setTags(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700  p-2.5 text-sm text-white placeholder-gray-400"
                  />
                  <div className="mt-4">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Seperate tags by commas{" "}
                      <button
                        data-popover-target="popover-description"
                        data-popover-placement="bottom-end"
                        type="button"
                        title="Generate Image Info"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <svg
                          className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span className="sr-only">Show information</span>
                      </button>
                    </p>
                    <div
                      data-popover
                      id="popover-description"
                      role="tooltip"
                      className={`absolute z-10 inline-block w-72 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 shadow-sm transition-opacity duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 ${
                        showInfo ? "visible opacity-100" : "invisible opacity-0"
                      }`}
                    >
                      <div className="space-y-2 p-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          What does this mean?
                        </h3>
                        <p>
                          When entering your favorite genres, please seperate
                          each genre by a comma. For example, if you like
                          romance and fiction, you would enter
                          &quot;romance,fiction&quot; in the input field.
                        </p>
                      </div>
                      <div data-popper-arrow></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Bio
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    maxLength={255}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm  text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500"
                  ></textarea>
                  <div className="pt-2 text-xs font-light text-white">
                    {bio?.length}/255
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={updateProfile}
                  type="submit"
                  className="rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-950 hover:bg-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-300"
                >
                  {isLoading ? <LoadingSpinner /> : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreateProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [bio, setBio] = useState("");
  const [tags, setTags] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading } = api.profile.create.useMutation({
    onSuccess: () => {
      setShowModal(false);
      setBio("");
      setTags("");
      void ctx.profile.getProfileByUserId.invalidate();
    },
    onError: () => {
      toast.error("Error adding profile");
    },
  });

  return (
    <div>
      <div className="flex justify-center pt-2">
        <button
          id="updateProductButton"
          data-modal-toggle="updateProductModal"
          className="rounded bg-violet-500 p-1 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-violet-400"
          type="button"
          title="Add Wishlist Item"
          onClick={() => setShowModal(true)}
        >
          Add Bio
        </button>
      </div>

      <div
        id="updateProductModal"
        tabIndex={-1}
        aria-hidden="true"
        className={`h-modal fixed left-0 right-0 top-0 z-50 h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-12 md:inset-0 ${
          showModal ? "flex" : "hidden"
        } bg-black bg-opacity-60`}
      >
        <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
          <div className="relative rounded-lg bg-gray-800 p-4 shadow-lg sm:p-5">
            <div className="mb-4 flex items-center justify-between rounded-t border-b border-gray-600 pb-4 sm:mb-5">
              <h3 className="text-lg font-semibold text-white">
                Create Profile Bio
              </h3>
              <button
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm hover:bg-gray-600 hover:text-white"
                data-modal-toggle="updateProductModal"
                onClick={() => setShowModal(false)}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <form>
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col items-start">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Favorite Genres
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-600 bg-gray-700  p-2.5 text-sm text-white placeholder-gray-400"
                    placeholder="romance,fiction,etc."
                  />
                  <div className="mt-4">
                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Seperate tags by commas{" "}
                      <button
                        data-popover-target="popover-description"
                        data-popover-placement="bottom-end"
                        type="button"
                        title="Generate Image Info"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <svg
                          className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-500"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <span className="sr-only">Show information</span>
                      </button>
                    </p>
                    <div
                      data-popover
                      id="popover-description"
                      role="tooltip"
                      className={`absolute z-10 inline-block w-72 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 shadow-sm transition-opacity duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 ${
                        showInfo ? "visible opacity-100" : "invisible opacity-0"
                      }`}
                    >
                      <div className="space-y-2 p-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          What does this mean?
                        </h3>
                        <p>
                          When entering your favorite genres, please seperate
                          each genre by a comma. For example, if you like
                          romance and fiction, you would enter
                          &quot;romance,fiction&quot; in the input field.
                        </p>
                      </div>
                      <div data-popper-arrow></div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-col items-start">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Bio
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    maxLength={255}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm  text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500"
                    placeholder="Tell us about yourself!"
                  ></textarea>
                  <div className="pt-2 text-xs font-light text-white">
                    {bio.length}/255
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    mutate({
                      bio,
                      tags,
                    });
                  }}
                  type="submit"
                  className="rounded-lg bg-violet-400 px-5 py-2.5 text-center text-sm font-medium text-slate-950 hover:bg-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-300"
                >
                  {isLoading ? <LoadingSpinner /> : "Create Bio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
