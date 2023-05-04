import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";


type WishlistItemWithUser = RouterOutputs["wishlistItem"]["getWishlistByUserId"][number];
const WishistItem = (props: WishlistItemWithUser) => {
    const { wishlistItem } = props;

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-950 p-4 shadow-md">
      <div className="flex flex-col items-center justify-center">
        <p className="text-2xl font-semibold text-violet-300">{wishlistItem.title}</p>
        <p className="text-slate-400">{wishlistItem.author}</p>
      </div>
      <div>
        <p className="text-slate-700">
         {wishlistItem.description}
        </p>
      </div>
      <div className="rounded-lg bg-violet-400 px-2 py-1 text-xs font-medium text-slate-950">
        <Link href={wishlistItem.link} target="_blank">
            Buy Book
        </Link>
      </div>
    </div>
  );
};

export default WishistItem;




{/* <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-950 p-4 shadow-md">
<div className="flex flex-col items-center justify-center">
  <p className="text-2xl font-semibold text-violet-300">Title</p>
  <p className="text-slate-400">Author</p>
</div>
<div>
  <p className="text-slate-700">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
    vero neque. Dignissimos unde dolorum ea. Lorem ipsum dolor sit
    amet consectetur adipisicing elit. Nihil ex, repellendus error
    eius perferendis mollitia.
  </p>
</div>
<div className="rounded-lg bg-violet-400 px-2 py-1 text-xs font-medium text-slate-950">
  <p>Buy Book</p>
</div>
</div>
</div> */}