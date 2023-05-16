const FullStar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    width={20}
    height={20}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5.46 5.02 1.29 7.68L12 18.77l-6.91 3.63 1.29-7.68L2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HalfStar = () => (
  <svg
    width="22px"
    height="22px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.1467 4.13112C12.7115 3.12752 11.2883 3.12751 10.8531 4.13112L8.87333 8.69665L3.91947 9.16869C2.83051 9.27246 2.3907 10.626 3.2107 11.3501L6.94099 14.6438L5.85911 19.501C5.62129 20.5688 6.77271 21.4053 7.7147 20.8492L11.9999 18.3193L16.2851 20.8492C17.2271 21.4053 18.3785 20.5688 18.1407 19.501L17.0588 14.6438L20.7891 11.3501C21.6091 10.626 21.1693 9.27246 20.0804 9.16869L15.1265 8.69665L13.1467 4.13112ZM12 15.9968L12.5083 16.2969L15.8125 18.2477L14.9783 14.5023L14.85 13.9261L15.2925 13.5353L18.1689 10.9956L14.3491 10.6316L13.7613 10.5756L13.5265 10.034L12 6.51388V15.9968Z"
        fill="currentColor"
      ></path>{" "}
    </g>
  </svg>
);

const EmptyStar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width={20}
    height={20}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2l3.09 6.26L22 9.27l-5.46 5.02 1.29 7.68L12 18.77l-6.91 3.63 1.29-7.68L2 9.27l6.91-1.01L12 2z"
    />
  </svg>
);

export const Rating = (props: { rating: number }) => {
  const roundedRating = Math.round(props.rating * 2) / 2;
  const stars = Array.from({ length: 5 });

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {stars.map((_, index) => {
          const starNumber = index + 1;
          if (starNumber <= roundedRating) {
            return <FullStar key={index} />;
          }
          if (starNumber - 0.5 === roundedRating) {
            return <HalfStar key={index} />;
          }
          return <EmptyStar key={index} />;
        })}
      </div>
      <div className="text-sm">{props.rating} / 5</div>
    </div>
  );
};
