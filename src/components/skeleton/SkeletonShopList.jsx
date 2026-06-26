import { Skeleton } from "./Skeleton.jsx";

/* Mirrors the shop list items inside the AddCollection modal dropdown */
export function SkeletonShopList({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk-shop-item">
          <Skeleton w={40} h={40} r={12} />
          <div className="sk-col" style={{ gap: 7 }}>
            <Skeleton w="55%" h={13} />
            <Skeleton w="35%" h={11} />
          </div>
          <Skeleton w={52} h={22} r={20} style={{ flexShrink: 0 }} />
        </div>
      ))}
    </>
  );
}
