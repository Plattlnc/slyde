import { notFound } from "next/navigation";
import SubPage from "@/components/sub-page";
import AddToCart from "@/components/add-to-cart";
import { getProduct, formatWon } from "@/lib/shop-data";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  return (
    <SubPage emoji="🛍️" title="상품 상세">
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-50 text-7xl">
        {p.emoji}
      </div>
      <div className="mt-4">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {p.category}
        </span>
        <h1 className="mt-2 text-lg font-extrabold text-slate-900">{p.name}</h1>
        <p className="mt-1 text-xl font-extrabold text-blue-600">
          {formatWon(p.price)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.desc}</p>
      </div>

      <div className="mt-6">
        <AddToCart productId={p.id} />
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        * 데모 상점입니다. 실제 결제는 이뤄지지 않아요.
      </p>
    </SubPage>
  );
}
