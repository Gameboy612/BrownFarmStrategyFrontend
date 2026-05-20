export default function ShopSlotTitle({ title }) {
  return (
    <span className="flex items-center justify-center m-[10%]">
      <img src="/images/shared/shop_title.png" alt="" aria-hidden="true" className="h-auto w-auto object-contain" />
      <span className="pt-1 absolute inset-0 flex items-center justify-center px-3 text-[1.1em] sm:text-[1.3em] md:text-[1.5em] lg:text-[1.7em] font-semibold tracking-[0.18em] text-[#72421A]">
        {title}
      </span>
    </span>
  );
}