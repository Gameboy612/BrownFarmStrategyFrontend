export default function ShopSlotTitle({ title }) {
  return (
    <span className="flex items-center justify-center m-[10%]">
      <img src="/images/shared/shop_title.png" alt="" aria-hidden="true" className="h-auto w-auto object-contain" />
      <span className="pt-1 absolute inset-0 flex items-center justify-center px-3 text-[90%] sm:text-[100%] md:text-[110%] lg:text-[120%] font-semibold tracking-[0.18em] text-[#72421A]">
        {title}
      </span>
    </span>
  );
}
