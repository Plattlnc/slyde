/* eslint-disable @next/next/no-img-element */

// 게시글 첨부 사진 그리드
export default function PostImages({ images }: { images?: string[] }) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-100">
        <img
          src={images[0]}
          alt="첨부 사진"
          className="max-h-96 w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
      {images.map((u, i) => (
        <img
          key={i}
          src={u}
          alt="첨부 사진"
          className="aspect-square w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
}
